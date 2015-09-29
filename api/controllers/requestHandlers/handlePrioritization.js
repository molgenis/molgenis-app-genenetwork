var _ = require('lodash')
var dbutil = require('../utils/dbutil')
var genedesc = require('../utils/genedesc')
var quicksort = require('../utils/quicksort')
var quicksortobj = require('../utils/quicksortobj')
var cholesky = require('../../../stats/cholesky')
var ziggurat = require('../../../stats/ziggurat')

module.exports = function(req, res) {

    var termsQ = req.params.id.trim().split(/[\s,;]+/)
    var terms = [] // objects
    var termsFound = []
    var termsNotFound = []
    var pathwayDBs = []

    var genesToGet = []
    if (req.query.genes) {
        var genesQ = req.query.genes.split(/[\s,;]+/)
        for (var i = 0; i < genesQ.length; i++) {
            var gene = genedesc.get(genesQ[i])
            if (gene) {
                genesToGet.push(gene)
            }
        }
    }

    for (var i = 0; i < termsQ.length; i++) {
        var pathwayObj = dbutil.pathwayObject(termsQ[i])
        if (pathwayObj) {
            terms.push(pathwayObj)
            termsFound.push(pathwayObj.id)
            if (pathwayDBs.indexOf(pathwayObj.database) < 0) {
                pathwayDBs.push(pathwayObj.database)
            }
        } else {
            termsNotFound.push(termsQ[i])
        }
    }

    if (terms.length === 0) {
        return res.notFound({
            status: 404,
            message: 'No pathways/phenotypes found for \'' + req.params.id + '\''
        })
    }

    async.map(terms, function(term, cb) {
        dbutil.getGeneZScoresForTerm(term, {
            array: true,
            sort: false
        }, function(err, result) {
            if (err) {
                cb(err)
            } else {
                cb(null, result)
            }
        })
    }, function(err, results) {

        if (err) {
            return res.send(err.status, err)
        }

        var ts = new Date()

        var r = {}
        r.href = req.protocol + '://' + req.get('host') + req.originalUrl
        r.termsNotFound = termsNotFound
        r.terms = []
        for (var i = 0; i < terms.length; i++) {
            r.terms.push({
                href: sails.config.version.apiUrl + '/pathway/' + terms[i].id
            })
            if (req.query.verbose === '' || req.query.verbose === 'true') {
                r.terms[i].term = terms[i]
            }
        }
        r.results = []
        for (var j = 0; j < results[0].length; j++) {
            var gene = genedesc.get(j)
            if (genesToGet.length == 0 || genesToGet.indexOf(gene) >= 0) {
                r.results.push({
                    href: sails.config.version.apiUrl + '/gene/' + gene.id,
                    weightedZScore: 0
                })
                if (req.query.verbose === '' || req.query.verbose === 'true') {
                    _.last(r.results).gene = gene
                }
            }
        }
        var sq = Math.sqrt(results.length)
        for (var i = 0; i < results.length; i++) {
            for (var j = 0; j < results[i].length; j++) {
                r.results[j].weightedZScore += results[i][j] / sq
            }
        }

        sails.log.debug((new Date() - ts) + ' ms creating result array')
        ts = new Date()
        quicksortobj(r.results, 'weightedZScore')
        r.results.reverse()
        sails.log.debug((new Date() - ts) + ' ms sorting')

        if (req.query.start) {
            if (req.query.start >= r.results.length) {
                return res.send(400, {
                    status: 400,
                    message: 'Start parameter cannot be greater than the number of results'
                })
            }
            var start = Number(req.query.start)
            var stop = req.query.stop || start + sails.config.api.prioritizationMaxNumEntries
            r.results = r.results.slice(start, Math.min(stop, start + sails.config.api.prioritizationMaxNumEntries))
        } else {
            r.results = r.results.slice(0, sails.config.api.prioritizationMaxNumEntries)
        }

        for (var i = 0; i < r.results.length; i++) {
            r.results[i].weightedZScore = Number(r.results[i].weightedZScore.toPrecision(4))
        }

        if (req.query.permutations && req.query.permutations > 0) {
            if (req.query.permutations < 1000) {
                return res.send(400, {status: 400, message: 'At least 1000 permutations are needed'})
            }
            dbutil.getTermCorrelationMatrix(terms, {
                standardnormalize: true
            }, function(err, correlations) {
                var ts = new Date()
                var choleskyL = cholesky(correlations)
                var permZ = []
                for (var perm = 0; perm < req.query.permutations; perm++) {
                    var normalVect = []
                    for (var i = 0; i < terms.length; i++) {
                        var g = ziggurat.nextGaussian()
                        normalVect.push(g)
                    }
                    var wz = 0
                    for (var i = 0; i < terms.length; i++) {
                        var value = 0
                        for (var j = 0; j < terms.length; j++) {
                            value += normalVect[j] * choleskyL[i][j]
                        }
                        wz += value
                    }
                    wz /= Math.sqrt(terms.length)
                    permZ.push(wz)
                }
                quicksort(permZ)
                permZ.reverse()
                sails.log.debug((new Date() - ts) + ' ms cholesky permutations + sorting')

                for (var i = 0; i < r.results.length; i++) {
                    for (var p = 0; p < permZ.length; p++) {
                        if (permZ[p] < r.results[i].weightedZScore) {
                            if (p === 0) p = 1
                            var pVal = p / (permZ.length + 1)
                            var pReadable = pVal
                            if (pVal < 0.01) {
                                pReadable = pReadable.toExponential(2)
                            } else {
                                pReadable = pReadable.toPrecision(2)
                            }
                            r.results[i].pValue = pReadable
                            break
                        }
                    }
                    if (!r.results[i].pValue) {
                        r.results[i].pValue = 1
                    }
                }
                return res.json(r)
            })
        } else {
            //     return res.json(r)
            // }
            //add information on annotated pathways for the genes
            //TODO store pathway annotations for genes in memory to avoid async db requests
            async.map(r.results, function(result, cb) {
                var geneID = result.href.substring(result.href.lastIndexOf('/') + 1)
                dbutil.getAnnotatedPathwayIDsForGene(genedesc.get(geneID), null, function(err, annotations) {
                    if (err) cb(err)
                    else {
                        result.annotated = _.intersection(annotations, termsFound)
                        cb(null, annotations)
                    }
                })
            }, function(err, annotations) {
                if (err) {
                    return res.send(err.status, err)
                }
                return res.json(r)
            })
        }
    })
}
