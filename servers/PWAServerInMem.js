var _ = require('lodash')
var async = require('async')
var Queue = require('kue').createQueue()
var genstats = require('genstats')
var quicksort = require('../api/controllers/utils/quicksort')
var quicksortobj = require('../api/controllers/utils/quicksortobj')

var level = require('level')
var pathwayrankdb = level('/data/genenetwork/level/new/dbexternalranks', {
    valueEncoding: 'binary'
})

var TERM_SERVER = {

    termData: [],
    dbStartIndices: {},
    dbStopIndices: {}, // exclusive

    analyseDB: function(genes, dbname, options, progressCallback, callback) {
        
        options = options || {}
        var testType = options.testType || 'wilcoxonr'
        var foreIndices = quicksort(_.map(genes, function(gene) { return gene.index_ }))
        var start = TERM_SERVER.dbStartIndices[dbname]
        var stop = TERM_SERVER.dbStopIndices[dbname]
        if (start == undefined || stop == undefined) {
            callback({name: 'ArgumentError', message: 'No start/stop position for ' + dbname})
        }
        this.run(foreIndices, start, stop, testType, progressCallback, callback)
    },
    
    analyseRange: function(genes, start, stop, options, progressCallback, callback) {

        options = options || {}
        var testType = options.testType || 'wilcoxonr'
        var foreIndices = quicksort(_.map(genes, function(gene) { return gene.index_ }))
        this.run(foreIndices, start, stop, testType, progressCallback, callback)
    },
    
    run: function(foreIndices, start, stop, testType, progressCallback, callback) {

        var numPathways = stop - start
        var results = []

        for (var i = start; i < stop; i++) {

            var data = TERM_SERVER.termData[i]
            var a1 = []
            var a2 = []
            
            var curFore = 0
            for (var di = 0, len = data.length; di < len; di++) {
                if (curFore < foreIndices.length && di === foreIndices[curFore]) {
                    a1.push(data[di])
                    curFore++
                } else {
                    a2.push(data[di])
                }
            }

            var p = -1
            if (testType === 't') {
                var p = genstats.welch(a1, a2)
            } else if (testType === 'wilcoxonr') {
                var p = genstats.wilcoxonRanked(a1, a2).p
            } else {
                sails.log.warn('PWAServer: Unexpected test type: ' + testType)
            }

            //var pathway = pathways[done]
            results.push(p)

            if (numPathways > 1500 && results.length % 500 === 0) {
                progressCallback(results.length, numPathways)
            }
        }
        callback(results)
    }
}

console.log('Reading gene set data from database...')
var tstart = new Date()
var prefix = 'RNASEQ!PREDICTIONS!'
var prefixLen = prefix.length
var curDB = null
var curArray = null
pathwayrankdb.createReadStream({
    start: prefix,
    end: prefix + '~'
})
    .on('data', function(data) {
        var dbThisData = data.key.substring(prefixLen, data.key.lastIndexOf('!'))
        if ('GO-BP' == dbThisData || 'GO-MF' == dbThisData) return
        if (dbThisData != curDB) {
            TERM_SERVER.dbStopIndices[curDB] = TERM_SERVER.termData.length
            curDB = dbThisData
            TERM_SERVER.dbStartIndices[curDB] = TERM_SERVER.termData.length
            console.log('Reading ranks for ' + curDB)
            //TERM_SERVER.termData[curDB] = []
        }
        // normal arrays are faster to read and write than typed arrays but consume more memory
        // TODO test one big typed array instead of an array of typed arrays
        //TERM_SERVER.termData.push(Int16Array(data))
        var arr = []
        for (var i = 0, ii = data.value.length / 2; i < ii; i++) {
            arr.push(data.value.readUInt16BE(i * 2))
        }
        TERM_SERVER.termData.push(arr)
    })
    .on('error', function(err) {
        console.log('Could not read gene set data from database! ' + err.name + ': ' + err.message)
        process.exit(-1)
    })
    .on('end', function() {
        console.log('Gene set ranks read in ' + Math.round((new Date() - tstart) / 60) + 's')
        _.forEach(TERM_SERVER.dbStartIndices, function(index, db) {
            if (!TERM_SERVER.dbStopIndices[db]) {
                TERM_SERVER.dbStopIndices[db] = TERM_SERVER.termData.length
            }
            console.log(db + ': ' + (TERM_SERVER.dbStopIndices[db] - TERM_SERVER.dbStartIndices[db]) + ' gene sets')
        })
        console.log('Ready to consume queue')
        Queue.process('pathwayanalysis', function(job, done) {
            console.log(new Date() + '\t' + job.data.ip + '\tStarting pathway analysis\t' + job.data.db + ':' + job.data.genes.length + '\t' + job.data.socketID)
            var tstart = new Date()
            TERM_SERVER.analyseDB(job.data.genes, job.data.db, {ip: job.data.ip, socketID: job.data.socketID, testType: 'wilcoxonr'},
                    function(numDone, numTotal) {
                        job.progress(numDone, numTotal)
                    }, function(results) {
                        job.progress(results.length, results.length, results)
                        done(null, results)
                        console.log(new Date() + '\t' + job.data.ip + '\tFinished pathway analysis\t' + job.data.db + ':' + job.data.genes.length + '(' + (new Date() - tstart) / 1000 + 's)\t' + job.data.socketID)
                    })
        });
    })
