var _ = require('lodash')
var dbutil = require('./dbutil')
sails.log.debug("calling genesdesc from getprioritizedgens.js");
var genedesc = require('./genedesc')
var quicksort = require('./quicksort')
var quicksortobj = require('./quicksortobj')
var cholesky = require('../../stats/cholesky')
var ziggurat = require('../../stats/ziggurat')
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

module.exports = function(terms, verbose, callback) {
    var termsQ = terms.trim().split(/[\s,;]+/)
    var terms = [] // objects
    var termsFound = []
    var termsNotFound = []
    var pathwayDBs = []
    var genesToGet = []

    for (var i = 0; i < termsQ.length; i++) {
        var pathwayObj = dbutil.pathwayObject(termsQ[i])
        if (pathwayObj) {
            terms.push(pathwayObj)
            termsFound.push({id: pathwayObj.id, name: pathwayObj.name})
            if (pathwayDBs.indexOf(pathwayObj.database) < 0) {
                pathwayDBs.push(pathwayObj.database)
            }
        } else {
            termsNotFound.push(termsQ[i])
        }
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

        r.termsNotFound = termsNotFound
        r.termsFound = termsFound
        r.terms = []
        for (var i = 0; i < terms.length; i++) {
            r.terms.push({
                href: sails.config.version.apiUrl + '/pathway/' + terms[i].id
            })
            //TODO req.query.verbose
            if (verbose === '' || verbose === 'true' || verbose == true) {
                r.terms[i].term = terms[i]
            }
        }

        r.results = []
        for (var j = 0; j < results[0].length; j++) {
            var gene = genedesc.get(j)
            if (genesToGet.length == 0 || genesToGet.indexOf(gene) >= 0) {
                r.results.push({
                    href: sails.config.version.apiUrl + '/gene/' + gene.id,
                    predicted: [],
                    weightedZScore: 0
                })
                // if (req.query.verbose === '' || req.query.verbose === 'true') {
                    _.last(r.results).gene = gene
                // }
            }
        }

        var sq = Math.sqrt(results.length)
        for (var i = 0; i < results.length; i++) {
            for (var j = 0; j < results[i].length; j++) {
                r.results[j].weightedZScore += results[i][j] / sq
                r.results[j].predicted[i] = results[i][j]
            }
        }

        sails.log.debug((new Date() - ts) + ' ms creating result array')
        ts = new Date()
        quicksortobj(r.results, 'weightedZScore')
        r.results.reverse()
        sails.log.debug((new Date() - ts) + ' ms sorting')

        callback(null, r)

    })
}

