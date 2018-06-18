var _ = require('lodash')
var fs = require('fs')
var async = require('async')
var lookup = function(value) { return (value - 32768) / 1000 }



var hpo = fs.readFileSync('/data/genenetwork/files/HPO/ALL_SOURCES_ALL_FREQUENCIES_diseases_to_genes_to_phenotypes.txt', 'utf8').split('\n')
hpo.splice(0,1)
hpo.splice(-1,1)



async.map(terms, function(term, cb) {

    pathwaydb.get('RNASEQ!PREDICTIONS!HPO!' + term, function(err, buffer) {
        if (err) {
            cb(err)
        } else {
            for (var i = 1; i < buffer.length / 2; i++) {
                var z = lookup(buffer.readUInt16BE(i * 2))
                var gene = genedesc.get(i - 1)
                if (options && options.array) {
                    result.push(z)
                }
            }
        }
    })
    
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
})
