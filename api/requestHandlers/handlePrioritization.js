var _ = require('lodash')
var dbutil = require('../utils/dbutil')
var mim2gene = require('../utils/mim2gene')
sails.log.debug("calling genesdesc from handlePrioritization.js");
var genedesc = require('../utils/genedesc')
var quicksort = require('../utils/quicksort')
var quicksortobj = require('../utils/quicksortobj')
var cholesky = require('../../stats/cholesky')
var ziggurat = require('../../stats/ziggurat')
var getprioritizedgenes = require('../utils/getprioritizedgenes')
var query2genes = require('../utils/query2genes');
var crypto = require('crypto')
var bs62 = require('base62')
var json2csv = require('json2csv');
var fs = require('fs')

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString()
    var mm = (this.getMonth()+1).toString()
    var dd  = this.getDate().toString()
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0])
}

module.exports = function(req, res) {
    var terms = req.params.id
    var genes = req.url.split('&')[1]

    async.waterfall([
        //if genes of interest are given, get those genes
        function(callback){

            if (genes){ 
                query2genes(genes.split(','), function(err, json, complete){
                    if (err) res.send(err.status, err)
                    else {
                        var genes = []
                        var notFound = []
                        for (var i = 0; i < complete.length; i++){
                            if(complete[i]['genes']){
                                genes.push(complete[i]['genes'][0]['id'])
                            } else {
                                notFound.push(complete[i]['not_found'])
                            }
                        }
                        callback(null, genes, notFound)
                    }
                })
            } else {
                callback(null, null, null)
            }

        },

        //get prioritized genes and send back results
        function(genes, notFound, callback){

            getprioritizedgenes(terms, true, function(err, r){
                r.href = req.protocol + '://' + req.get('host') + req.originalUrl

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
                    if (genes){

                        r.results = _.filter(r.results, function(item){
                            return genes.indexOf(item.gene.id) != -1
                        }).slice(0, sails.config.api.prioritizationMaxNumEntries)
                        
                        r['genesNotFound'] = notFound

                    } else {
                        r.results = r.results.slice(0, sails.config.api.prioritizationMaxNumEntries)    
                    }
                    
                }

                for (var i = 0; i < r.results.length; i++) {
                    r.results[i].weightedZScore = Number(r.results[i].weightedZScore.toPrecision(4))
                }

                if (req.query.permutations && req.query.permutations > 0) {
                    if (req.query.permutations < 1000 || req.query.permutations > 100000) {
                        return res.send(400, {status: 400, message: 'At least 1000 and at most 100000 permutations are needed'})
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
                    
                    //get hpo correlation matrix 
                    dbutil.getHpoCorrelationMatrix(_.map(r.termsFound, 'id'), function(err, hpoCorrelation){
                        if (err) {
                            r.hpoCorrelation = null
                        } else {
                            r.hpoCorrelation = hpoCorrelation
                        }

                        // return res.json(r)
                    // }
                    //add information on annotated pathways for the genes
                    //TODO store pathway annotations for genes in memory to avoid async db requests
                        async.map(r.results, function(result, cb) {
                            var geneID = result.href.substring(result.href.lastIndexOf('/') + 1)
                            dbutil.getAnnotatedPathwayIDsForGene(genedesc.get(geneID), null, function(err, annotations) {
                                if (err) cb(err)
                                else {
                                    result.annotated = _.intersection(annotations, r.termsFound)
                                    cb(null, annotations)
                                }
                            })
                        }, function(err, annotations) {
                            if (err) {
                                return res.send(err.status, err)
                            }
                            return res.json(r)
                        })

                    })
                    
                }
            })
        }
    ], function(err){
        if (err) sails.log.error(err)
    })

}

        

