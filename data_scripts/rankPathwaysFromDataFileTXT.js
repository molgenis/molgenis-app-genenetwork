var _ = require('lodash')
var fs = require('fs')
var splitter = require('split')
var fileutil = require('./fileutil')
var rank = require('./rank.js')
var level = require('level')

if (process.argv.length != 6) {
    console.log('usage: node populategenesetdb.js rankdbpath dbname genesetdescriptionfile genesetdatafile')
    return
}

var rankdbpath = process.argv[2]
var dbname = process.argv[3]
var genesetfile = process.argv[4]
var datafile = process.argv[5]

var rankdb = level(rankdbpath, {
    valueEncoding: 'binary'
})

// rankdb.createKeyStream().on('data', function(k) { console.log(k) })
// return

//TODO genesetIDs unnecessary
var genesetIDs = fileutil.readIDFile(genesetfile)
readDataAndInsertToDBUInt16BE(rankdb, dbname, datafile, genesetIDs, function(err) {
    console.log(err ? err : 'done!')
})

function readDataAndInsertToDBUInt16BE(rankdb, dbname, filename, ids, cb) {

    console.log('reading data from ' + filename)
    var isNPY = filename.indexOf('.npy', filename.length - '.npy'.length) !== -1
    
    var timeStart = new Date().getTime()
    var batch = rankdb.batch()
    var lineNum = 0
    var numBatched = 0
    fs.createReadStream(filename)
        .pipe(splitter())
        .on('error', function(err) {
            cb(err)
        })
        .on('data', function(line) {
            var split = line.split(/\t/)
            if (split.length > 1) {
                if (lineNum === 0) {
                    //console.error(line)
                    ++lineNum
                } else {
                    var arr = []                    
                    for (var i = 1; i < split.length; i++) {
                        arr.push(+split[i])
                    }
                    var ranks = rank(arr)
                    var rankBuffer = new Buffer(ranks.length * 2)
                    for (var j = 0; j < ranks.length; j++) {
                        rankBuffer.writeUInt16BE(ranks[j], j * 2)
                    }
                    var id = split[0]
                    if ('REACTOME' === dbname.toUpperCase() && split[0].indexOf('REACTOME:') != 0) {
                        id = 'REACTOME:' + id
                    }
                    //console.error(id + '\t' + ranks.join('\t'))
                    batch.put('RNASEQ!PREDICTIONS!' + dbname.toUpperCase() + '!' + id, rankBuffer)
                    if (++numBatched % 100 === 0) {
                        console.log(numBatched + ' done')
                    }
                    if (numBatched % 1000 === 0) {
                        batch.write(function() {
                            console.log('batch written')
                        })
                        batch = rankdb.batch()
                    }
                    if (++lineNum % 1000 === 0) {
                        console.log(lineNum + ' rows read')
                    }
                }
            }
        })
        .on('end', function() {
            console.log(filename + ' read in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
            console.log('writing batch')
            timeStart = new Date().getTime()
            batch.write(function() {
                console.log('batch written in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
                cb(null)
            })
        })
}

