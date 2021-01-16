var fs = require('fs')
var fileutil = require('./fileutil')
var level = require('level')
var async = require('async')
//var stats = require('../stats/stats.js')
//var prob = require('../stats/probability.js')
var prob = require('genstats').probability
var properties = PropertiesReader('config/config.properties');
// get the location of the GN files
var genenetworkFilePath = properties.get('GN_FILES_PATH')


var encoding = require('../api/controllers/utils/encoding.js')

if (process.argv.length != 4) {
    console.log('usage: node populatecompdbs.js genefile datafile')
    return
}

var genefile = process.argv[2]
var datafile = process.argv[3]

//var pcDB = level('/data/genenetwork/final/dbpcsfloat', {
//    valueEncoding: 'binary'
//})

var corrDB = level(genenetworkFilePath+'/dbpccorrelationzscores_uint16benpy', {
    valueEncoding: 'binary'
})

// insertData()
//printKeys(corrDB)
//calculateCorrelationZScores(pcDB, corrDB, 'float', 1000, function(err) {
//    console.log(err ? err : 'done!')
//})
//insertCorrelationData()


var geneIDs = fileutil.readIDFile(genefile, {
    header: true
})

// readNPY... contains magic numbers!!
rowsToSkip = 0
readNPYAndInsertToDBUInt16BE(corrDB, datafile, geneIDs, function(err) {
    if (err) console.log(err)
    else console.log('done')
})

function insertCorrelationData() {

    var geneIDs = fileutil.readIDFile(genefile, {
        header: true
    })
    readwrite(geneIDs, 54715)
}

function readwrite(geneIDs, i) {

    readDataAndInsertToDBUInt16BE(
        corrDB,
        genenetworkFilePath+'/final/CorrelationMatrix/169ComponentsGeneCorrelationMatrix.binary.' + i + '.binary.dat',
        geneIDs.slice(i <= 50000 ? i - 10000 : i - 4715, i),
        function(err) {
            if (err) console.log(err)
            else if (i < 50000) {
                readwrite(geneIDs, i + 10000)
            } else if (i === 50000) {
                readwrite(geneIDs, i + 4715)
            } else {
                console.log('done')
            }
        })
}

function insertData() {
    var pcs = []
    for (var i = 1; i <= 121; i++) {
        pcs.push('PC' + i)
    }
    var geneIDs = fileutil.readIDFile(genefile, {
        header: true
    })
    var ts = new Date()
    async.series([
            function(cb) {
                readDataAndInsertToDBFloat(pcDB, datafile, geneIDs, function(err) {
                    cb(err)
                })
            },
            function(cb) {
                readDataAndInsertTransposedToDBFloat(pcDB, datafile, pcs, function(err) {
                    cb(err)
                })
            },
        ],
        function(err) {
            if (err) console.log(err)
            else console.log('done in ' + (new Date().getTime() - ts) / 1000 + ' s')
        }
    )
}

function printKeys(db, nth) {
    var numRead = 0
    db.createReadStream()
        .on('data', function(data) {
            if (!nth || ++numRead % nth === 0) {
                console.log(data.key)
            }
        })
}

function readNPYAndInsertToDBUInt16BE(db, filename, ids, cb) {

    console.log('reading data from ' + filename)

    var timeStart = new Date().getTime()
    var batch = db.batch()
    var numRows = -1
    var numCols = -1
    var rowsRead = 0
    var valuesRead = 0
    var buf = null
    var rs = fs.createReadStream(filename)
    rs.on('error', function(err) {
        cb(err)
    })
    rs.on('data', function(data) {
        var start = 0
        if (numRows < 0) {
            if (data.readUInt8(6) != 1) {
                return cb({name: 'Error', message: 'Support for numpy .npy formats newer than 1 not implemented.'})
            }
            headerLen = data.readUInt16LE(8)
            desc = data.toString('ascii', 10, 10+headerLen)
            console.log(desc.trim())
	    numRows = +desc.match(/\(([0-9]*),\s([0-9]*)\)/)[1]
	    numCols = +desc.match(/\(([0-9]*),\s([0-9]*)\)/)[2]
            console.log(numRows + ' rows in ' + filename)
            console.log(numCols + ' cols in ' + filename)
            buf = new Buffer(numCols * 2)
            start = 10 + headerLen
        }
        for (var i = start; i < data.length; i += 8) {
	    if (rowsRead < rowsToSkip) {
		if (++valuesRead === numCols) {
                    valuesRead = 0
                    if (++rowsRead % 1000 === 0) {
			console.log(rowsRead + ' rows skipped')
		    }
		}
	    } else {
		corr = Math.min(1-1e-10, data.readDoubleLE(i))
		z = prob.corrToZ(corr, 343)
		val = Math.min(65535, Math.round(1000 * z) + 32768)
		try {
                    buf.writeUInt16BE(val, valuesRead * 2)
		} catch (e) {
                    console.log(corr, z, val, rowsRead, valuesRead)
		}
		if (++valuesRead === numCols) {
                    //console.log(ids[rowsRead])
                    batch.put('RNASEQ!' + ids[rowsRead], buf)
                    valuesRead = 0
                    if (++rowsRead % 1000 === 0) {
			console.log(rowsRead + ' rows read, writing batch')
			batch.write(function() {
                            console.log('batch written')
			})
			batch = db.batch()
                    }
                    buf = new Buffer(numCols * 2)
		}
            }
	}
    })
    rs.on('end', function() {
        if (numRows > 0) {
            console.log(filename + ' read in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
            console.log('writing batch')
            timeStart = new Date().getTime()
            batch.write(function() {
                console.log('batch written in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
                cb(null)
            })
        }
    })
}

function calculateCorrelationZScores(fromdb, todb, datatype, numItemsAtATime, cb) {

    console.log('calculating pairwise correlations from ' + fromdb.location + ' to ' + todb.location)

    var items = []
    var values = []
    var correlations = []
    var ts = new Date().getTime()
    var rs = fromdb.createReadStream()
    rs.on('err', function(err) {
        cb(err)
    })
    rs.on('data', function(data) {
        var item = data.key.substring(data.key.indexOf('!') + 1)
        if (item.indexOf('ENSG') === 0) {
            items.push(item)
            values.push(toFloatArray(data.value))
        }
    })
    rs.on('end', function() {
        console.log(items.length + ' items read in ' + (new Date().getTime() - ts) + ' ms')
        ts = new Date()
        console.log('starting correlation calculation')
        var batch = todb.batch()
        for (var i = 0; i < values.length; i++) {
            if (datatype === 'float') {
                var buf = new Buffer(values.length * 4)
                for (var j = 0; j < values.length; j++) {
                    if (i !== j) {
                        var corr = stats.correlation(values[i], values[j])
                        var z = prob.corrToZ(corr, values[i].length)
                        buf.writeUInt16BE(z, j * 4)
                        if (j === 0 && (i % numItemsAtATime === 0 || i === values.length - 1)) {
                            console.log('corr(' + i + ',' + j + '): ' + corr + ', ' + z)
                        }
                    } else {
                        buf.writeUInt16BE(Infinity, j * 4)
                    }
                }
            } else if (datatype === 'uint16be') {
                var buf = new Buffer(values.length * 2)
                for (var j = 0; j < values.length; j++) {
                    if (i !== j) {
                        var corr = stats.correlation(values[i], values[j])
                        var z = prob.corrToZ(corr, values[i].length)
                        var index = encoding.getIndex(z)
                        buf.writeUInt16BE(index, j * 2)
                        if (j === 0 && (i % numItemsAtATime === 0 || i === values.length - 1)) {
                            console.log('corr(' + i + ',' + j + '): ' + corr + ', ' + z + ', ' + index)
                        }
                    } else {
                        buf.writeUInt16BE(65535, j * 2)
                    }
                }
            } else {
                throw {
                    name: 'ArgumentError',
                    message: 'Unsupported "datatype"'
                }
            }
            batch.put('RNASEQ!' + items[i], buf)
            if ((i > 0 && i % numItemsAtATime === 0) || i === values.length - 1) {
                console.log(i, Math.round((new Date() - ts) / 1000), 's')
                batch.write()
                batch = todb.batch()
            }
        }
        cb(null)
    })

}

function readDataAndInsertToDBUInt16BE(db, filename, ids, cb) {

    console.log('reading data from ' + filename)

    var timeStart = new Date().getTime()
    var batch = db.batch()
    var numRows = -1
    var numCols = -1
    var rowsRead = 0
    var valuesRead = 0
    var buf = null
    var rs = fs.createReadStream(filename)
    rs.on('error', function(err) {
        cb(err)
    })
    rs.on('data', function(data) {
        var start = 0
        if (numRows < 0) {
            numRows = data.readInt32BE(0)
            numCols = data.readInt32BE(4)
            console.log(numRows + ' rows in ' + filename)
            console.log(numCols + ' cols in ' + filename)
            buf = new Buffer(numCols * 2)
            start = 8
        }
        for (var i = start; i < data.length; i += 8) {
            buf.writeUInt16BE(Math.min(65535, Math.round(1000 * data.readDoubleBE(i)) + 32768), valuesRead * 2)
            if (++valuesRead === numCols) {
                console.log(ids[rowsRead])
                batch.put('RNASEQ!' + ids[rowsRead], buf)
                valuesRead = 0
                if (++rowsRead % 1000 === 0) {
                    console.log(rowsRead + ' rows read')
                }
                buf = new Buffer(numCols * 2)
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

function readDataAndInsertTransposedToDBFloat(db, filename, ids, cb) {

    console.log('reading data from ' + filename)

    var timeStart = new Date().getTime()
    var batch = db.batch()
    var numRows = -1
    var numCols = -1
    var rowsRead = 0
    var valuesRead = 0
    var bufs = null
    var rs = fs.createReadStream(filename)
    rs.on('error', function(err) {
        cb(err)
    })
    rs.on('data', function(data) {
        var start = 0
        if (numRows < 0) {
            numRows = data.readInt32BE(0)
            numCols = data.readInt32BE(4)
            console.log(numRows + ' rows in ' + filename)
            console.log(numCols + ' cols in ' + filename)
            bufs = []
            for (var i = 0; i < numCols; i++) {
                bufs.push(new Buffer(numRows * 4))
            }
            start = 8
        }
        for (var i = start; i < data.length; i += 8) {
            bufs[valuesRead].writeUInt16BE(data.readDoubleBE(i), rowsRead * 4)
            if (++valuesRead === numCols) {
                valuesRead = 0
                if (++rowsRead % 1000 === 0) {
                    console.log(rowsRead + ' rows read')
                }
            }
        }
    })
    rs.on('end', function() {
        console.log(filename + ' read in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
        console.log('writing batch')
        timeStart = new Date().getTime()
        for (var i = 0; i < bufs.length; i++) {
            batch.put('RNASEQ!' + ids[i], bufs[i])
            if (i % 10000 === 0) {
                var arr = toFloatArray(bufs[i])
                console.log(i, 'mean', stats.mean(arr), 'stdev', stats.stdev(arr))
            }
        }
        batch.write(function() {
            console.log('batch written in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
            cb(null)
        })
    })
}

function toFloatArray(buffer) {
    var arr = []
    for (var i = 0; i < buffer.length / 4; i++) {
        arr.push(buffer.readFloatBE(i * 4))
    }
    return arr
}
