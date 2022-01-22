var _ = require('lodash')
var fs = require('fs')
const { Client } = require('@elastic/elasticsearch')
var request = require('request')
var http = require('http')
var split = require('split')
var async = require('async')
var crypto = require('crypto')
var bs62 = require('base62')
var genedesc = require('../api/controllers/utils/genedesc')
// get the address for elastic search host
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config/config.properties');
var elasticHostAddress = properties.get('ELASTICSEARCH_HOST');

var URL = 'http://www.ebi.ac.uk/gwas/api/search/downloads/full'
var COLUMNS = [{name: 'DATE ADDED TO CATALOG', field: 'dateAdded'},
               {name: 'PUBMEDID', field: 'pubmedId'},
               {name: 'FIRST AUTHOR', field: 'firstAuthor'},
               {name: 'DATE', field: 'date'},
               {name: 'JOURNAL', field: 'journal'},
               {name: 'LINK', field: 'link'},
               {name: 'STUDY', field: 'study'},
               {name: 'DISEASE/TRAIT', field: 'trait'},
               {name: 'REPORTED GENE(S)', field: 'reportedGenes'},
               {name: 'MAPPED_GENE', field: 'mappedGenes'},
               {name: 'SNPS', field: 'snps'},
               {name: 'P-VALUE', field: 'pValue'}
              ]

var client = new Client({
    node: elasticHostAddress,
//    log: 'trace'
})

async.waterfall([
    function(cb) {
        var loci = []
        var lineNum = 0
        var colNums = null
        console.log('Fetching and parsing catalog...')
        request(URL)
            .pipe(split())
            .on('data', function(line) {
                if (++lineNum === 1) {
                    headers = line.split('\t')
                    colNums = _.map(COLUMNS, function(col) {
                        var index = headers.indexOf(col.name)
                        if (index < 0) {
                            return cb({name: 'NotFoundError', message: 'Column not found in GWAS catalog: ' + col.name})
                        }
                        return index
                    });
                } else {
                    var spl = line.split('\t')
                    var locus = {}
                    var i = 0
                    _.each(colNums, function(colNum) { locus[COLUMNS[i++].field] = spl[colNum] })
                        try {
                            locus.reportedGenes = _.filter(_.map(locus.reportedGenes.split(/( \- |;|,)/g),
                                                                 function(gene) { return gene.trim() }),
                                                           function(gene) { return gene.length > 1 && gene != 'NR' && gene.toLowerCase() != 'intergenic' })
                            locus.mappedGenes = _.filter(_.map(locus.mappedGenes.split(/( \- |;|,)/g),
                                                               function(gene) { return gene.trim() }),
                                                         function(gene) { return gene.length > 1 && gene != 'NR' && gene.toLowerCase() != 'intergenic' })
                            locus.snps = _.filter(_.map(locus.snps.split(/( \- |;|,)/g),
                                                        function(snp) { return snp.trim() }),
                                                  function(snp) { return snp.length > 1 && snp != 'NR'})
                            loci.push(locus)
                        } catch (e) {
                            console.log('Locus on line ' + lineNum + ' ignored: ' + e.name + ': ' + e.message)
                        }
                }
            })
            .on('error', function() {
                return cb(err)
            })
            .on('end', function() {
                console.log(loci.length + ' loci read')
                return cb(null, loci)
            })
        
    }, function(loci, cb) { // TODO both mapped and reported genes separately
        traitMapAllLoci = {}
        _.each(loci, function(locus) {
            if (locus.mappedGenes.length > 0 || locus.reportedGenes.length > 0) {
                trait = traitMapAllLoci[locus.trait]
                if (trait === undefined) {
                    trait = {}
                    trait.index = _.size(traitMapAllLoci)
                    trait.snps = []
                    trait.pValues = []
                    trait.reportedGenes = []
                    trait.gwReportedGenes = []
                    trait.mappedGenes = []
                    trait.gwMappedGenes = []
                    trait.studies = []
                    traitMapAllLoci[locus.trait] = trait
                }
                trait.snps.push(locus.snps)
                trait.pValues.push(locus.pValue)
                trait.reportedGenes.push(locus.reportedGenes || null)
                trait.mappedGenes.push(locus.mappedGenes || null)
                if (+(locus.pValue) < 5E-8) {
                    trait.gwReportedGenes.push(locus.reportedGenes || null)
                    trait.gwMappedGenes.push(locus.mappedGenes || null)
                }
                if (trait.studies.length == 0 || _.last(trait.studies).pubmedId != locus.pubmedId) {
                    trait.studies.push({name: locus.study,
                                        pubmedId: locus.pubmedId,
                                        link: locus.link,
                                        journal: locus.journal,
                                        firstAuthor: locus.firstAuthor}
                                      )
                }
            }
        })
            
            console.log(_.size(traitMapAllLoci) + ' traits in total')
        
        return cb(null, traitMapAllLoci)
        
    }, function(traitMapAllLoci, callback) {
        
        var numIncludedTraits = 0
        var numGWIncludedTraits = 0
        var bulk = []
        var numBatched = 0
        var traitsToInclude = {}
        _.each(traitMapAllLoci, function(trait, name) {
            if (trait.mappedGenes.length > 4) {
                traitsToInclude[name] = trait
            }
        })

            var traitNames = _.keys(traitsToInclude)
        async.eachSeries(traitNames, function(name, cb) {

            var trait = traitsToInclude[name]
            
            trait.reportedGenes = _.uniq(_.compact(_.flatten(trait.reportedGenes)))
            trait.gwReportedGenes = _.uniq(_.compact(_.flatten(trait.gwReportedGenes)))
            trait.mappedGenes = _.uniq(_.compact(_.flatten(trait.mappedGenes)))

            //TODO
            // convert gene names to ensg ids
            trait.mappedGenes = _.sortBy(_.compact(_.map(trait.mappedGenes, function(name) {
                var gene = genedesc.get(name)
                return gene ? gene.id : null
            })))

            if (trait.mappedGenes.length >= 10) {

                var req = http.request({
                    method: 'POST',
                    hostname: 'molgenis27.target.rug.nl',
                    path: '/socketapi/network'
                }, function(res) {
                    if (res.statusCode === 500) {
                        console.log(name + ': ' + trait.mappedGenes.length + ', ' + res.statusCode)
                        // console.log(trait.mappedGenes.join(','))
                    } else if (res.statusCode === 200) {
                        console.log('ok')
                    } else {
                        console.log('status: ' + res.statusCode)
                    }
                    cb(null)
                })
                req.write(JSON.stringify({
                    genes: trait.mappedGenes.join(',')
                }))
                req.end()

                var sha = crypto.createHash('sha1').update(trait.mappedGenes.join(',')).digest('hex')
                var shortURL = bs62.encode(parseInt(sha.substring(0, 8), 16))
                
                trait.gwMappedGenes = _.uniq(_.compact(_.flatten(trait.gwMappedGenes)))

                var cleanName = name.replace(/[^a-zA-Z0-9\\-_ ]/g, '').replace(/\s/g, '_')
                
                bulk.push({
                    create: {
                        _index: 'search',
                        _id: cleanName
                    }
                })
                bulk.push({
                    id: cleanName,
                    name: name,
                    shortURL: shortURL,
                    kind: 'trait_mapped',
                    numGenes: trait.mappedGenes.length
                })
            } else {
                cb(null)
            }
        }, function(err, results) {

            if (err) {
                console.error(err)
            } else {
                console.log('done')
            }
            callback(null, bulk)
        })
            
        
        // if (trait.gwMappedGenes.length > 4) {
        //     numGWIncludedTraits++
        // }
        //console.log(numIncludedTraits + ' traits with at least five mapped genes')
        //console.log(numGWIncludedTraits + ' traits with at least five genome-wide significant mapped genes')
        //cb()
    }], function(err, bulk) {
        if (err) return console.log(err)
        else {
            console.log('writing bulk, number of traits:', bulk.length)
            client.bulk({body: bulk}, function(err, resp) {
                if (err) console.log(err)
                else console.log('bulk written')
            })
        }
    })

                // client.delete({
                //     index: 'gwas',
                //     type: 'trait',
                //     id: trait.index
                // }, function(err, response) {
                //     if (err) console.error(err)
                //     client.create({
                //         index: 'gwas',
                //         type: 'trait',
                //         id: trait.index,
                //         body: {
                //             name: name,
                //             genes: 'tba',
                //             suggest: {
                //                 input: words,
                //                 output: [name + ' - ' + trait.mappedGenes.length + ' GWAS genes'],
                //                 payload: {traitId: trait.index},
                //                 weight: trait.mappedGenes.length
                //             }
                //         }
                //     })
                // })
