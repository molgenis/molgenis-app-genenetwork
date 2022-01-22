var _ = require('lodash')
var fs = require('fs')
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

var genesetIDs = fileutil.readIDFile(genesetfile)
readDataAndInsertToDBUInt16BE(rankdb, dbname, datafile, genesetIDs, function(err) {
    console.log(err ? err : 'done!')
})

function readDataAndInsertToDBUInt16BE(rankdb, dbname, filename, ids, cb) {

    console.log('reading data from ' + filename)
    var isNPY = filename.indexOf('.npy', filename.length - '.npy'.length) !== -1
    
    var timeStart = new Date().getTime()
    var batch = rankdb.batch()
    var numRows = -1
    var numCols = -1
    var rowsRead = 0
    var valuesRead = 0
    var arr = null
    var numBatched = 0
    var rs = fs.createReadStream(filename)
    rs.on('error', function(err) {
        cb(err)
    })
    rs.on('data', function(data) {
        var start = 0
        if (numRows < 0) {
	    if (isNPY) {
		console.log('npy file')
		if (data.readUInt8(6) != 1) {
                    return cb({name: 'NotImplementedError', message: 'Support for numpy .npy formats newer than 1 not implemented.'})
		}
		headerLen = data.readUInt16LE(8)
		desc = data.toString('ascii', 10, 10+headerLen)
		console.log(desc.trim())
		numRows = +desc.match(/\(([0-9]*),\s([0-9]*)\)/)[1]
		numCols = +desc.match(/\(([0-9]*),\s([0-9]*)\)/)[2]
		start = 10 + headerLen
	    } else {
		numRows = data.readInt32BE(0)
		numCols = data.readInt32BE(4)
		start = 8
	    }
	    console.log(numRows + ' rows in ' + filename)
	    console.log(numCols + ' cols in ' + filename)
            arr = []
        }
        for (var i = start; i < data.length; i += 8) {
	    if (isNPY) {
                arr.push(data.readDoubleLE(i))
	    } else {
                arr.push(data.readDoubleBE(i))
	    }
            if (++valuesRead === numCols) {
                var ranks = rank(arr)
                var rankBuffer = new Buffer.alloc(ranks.length * 2)
                for (var j = 0; j < ranks.length; j++) {
                    rankBuffer.writeUInt16BE(ranks[j], j * 2)
                }
                batch.put('RNASEQ!PREDICTIONS!' + dbname.toUpperCase() + '!' + ids[rowsRead], rankBuffer)
                if (++numBatched % 100 === 0) {
                    console.log(numBatched + ' done')
                }
                if (numBatched % 1000 === 0) {
                    batch.write()
                    batch = rankdb.batch()
                    console.log('batch written')
                }
                valuesRead = 0
                if (++rowsRead % 1000 === 0) {
                    console.log(rowsRead + ' rows read')
                }
                arr = []
            }
        }
    })
    rs.on('end', function() {
        console.log(filename + ' read in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
        console.log('writing batch')
        timeStart = new Date().getTime()
        batch.write(function() {
            console.log('batch written in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
            cb(null)
        })
    })
}

