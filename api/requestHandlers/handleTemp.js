var _ = require('lodash')
var fs = require('fs')
var async = require('async')
var dbutil = require('../utils/dbutil')
sails.log.debug("calling genesdesc from handleTemp.js");
var genedesc = require('../utils/genedesc')
var quicksort = require('../utils/quicksort')
var quicksortobj = require('../utils/quicksortobj')
var cholesky = require('../../stats/cholesky')
var ziggurat = require('../../stats/ziggurat')

module.exports = function(req, res) {

    var hpo = fs.readFileSync('/data/genenetwork/files/HPO/ALL_SOURCES_ALL_FREQUENCIES_diseases_to_genes_to_phenotypes.txt', 'utf8').split('\n')
    hpo.splice(0,1)
    if (!_.last(hpo)) {
        hpo.splice(-1,1)
    }
    
    var OMIM = {}
    
    _.forEach(hpo, function(line) {
        var split = line.split('\t')
        if (!OMIM[split[0]]) {
            OMIM[split[0]] = {
                hpos: [],
                genes: []
            }
        }
        OMIM[split[0]].hpos.push(split[3])
        if (OMIM[split[0]].genes.indexOf(split[1]) < 0) {
            OMIM[split[0]].genes.push(split[1])
        }
    })
    
    var OMIM_RESULTS = {}
    async.forEachOfSeries(OMIM, function(obj, name, callback) {

        // OMIM_RESULTS[name] = {
        //     hpos: [],
        //     genes: []
        // }

        var terms = []
        for (var i = 0; i < obj.hpos.length; i++) {
            var pathwayObj = dbutil.pathwayObject(obj.hpos[i])
            if (pathwayObj) {
                //OMIM_RESULTS[name].hpos.push(pathwayObj)
                terms.push(pathwayObj)
            }
        }

        // console.log(OMIM_RESULTS[name].hpos.length + ' OMIM_RESULTS[name].hpos found for ' + omim)
        if (terms.length == 0) {
            return callback()
        }
        var weightedZScoresThisOMIM = []
        async.map(terms, function(term, cb) {

            dbutil.getGeneZScoresForTerm(term, {
                array: true,
                sort: false
            }, function(err, resultThisTerm) {
                cb(err, resultThisTerm)
            })
            
        }, function(err, results) {

            var zScores = []
            for (var j = 0; j < results[0].length; j++) {
                zScores.push(0)
            }
            
            var sq = Math.sqrt(results.length)
            for (var i = 0; i < results.length; i++) {
                for (var j = 0; j < results[i].length; j++) {
                    zScores[j] += results[i][j] / sq
                }
            }

            _.forEach(OMIM[name].genes, function(gene) {
                var geneObj = genedesc.get(gene)
                if (geneObj) {
                    var index = geneObj.index_
                    var z = zScores[index]
                    var rank = 1
                    for (var i = 0; i < zScores.length; i++) {
                        if (zScores[i] > z) {
                            ++rank
                        }
                    }
                    console.log('TEMP', name, gene, z, rank, _.map(terms, function(term) { return term.id + ';' + term.numGenesAnnotated }).join(','))
//                    OMIM_RESULTS[name].genes.push({gene: gene, weightedZScore: z, rank: rank})
                }
            })
            return callback()
        })
    }, function(err) {
        console.log('all done')
        // fs.writeFile('omim.json', JSON.stringify(OMIM_RESULTS, null, 4), function(err) {
        //     if(err) {
        //         console.log(err);
        //     } else {
        //         console.log("JSON saved");
        //         res.end()
        //     }
        // })
    })
}
