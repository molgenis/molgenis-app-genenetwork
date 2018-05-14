var _ = require('lodash')
var async = require('async')
var level = require('level')
var elasticsearch = require('elasticsearch')

var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info'
})

var db = level('/data/genenetwork/level/new/dbexternal_uint16be', {valueEncoding: 'binary'})

async.waterfall([
    function(cb) {
        var numTotal = 0
        db.createValueStream({start: '!RNASEQ!HPO', end: '!RNASEQ!HPO~', valueEncoding: 'json'})
            .on('data', function(data) {
                numTotal += data.length
            })
            .on('end', function() {
                console.log('%d terms in total', numTotal)
                cb(null, numTotal)
            })
    },
    function(numTotal, cb) {
        var bulk = []
        var numBatched = 0
        db.createReadStream({start: '!RNASEQ!HPO', end: '!RNASEQ!HPO~', valueEncoding: 'json'})
            .on('data', function(data) {
                console.log(data.key, data.value.length + ' terms')
                _.forEach(data.value, function(term) {
                    // client.delete({
                    //     index: 'diagnosis',
                    //     type: 'term',
                    //     id: term.id
                    // }, function(err, response) {
                    //     if (err && err.message !== 'Not Found') {
                    //         return cb(err)
                    //     }
                        bulk.push({
                            create: {
                                _index: 'diagnosis',
                                _type: 'term',
                                _id: term.id
                            }
                        })
                        bulk.push({
                            id: term.id,
                            name: term.name,
                            database: term.database,
                            numGenes: term.numAnnotatedGenes
                        })
                        if (++numBatched === numTotal) {
                            cb(null, bulk)
                        }
                    // })
                })
            }).on('end', function() {
            })
    }], function(err, bulk) {
        // console.log(bulk.length)
        console.log('writing bulk, numTerms:', bulk.length / 2)
        client.bulk({body: bulk}, function(err, resp) {
            if (err) console.log(err)
            else console.log('bulk written')
        })
    })
