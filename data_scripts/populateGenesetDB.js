var _ = require('lodash')
var fs = require('fs')
var fileutil = require('./fileutil')
var level = require('level')
var async = require('async')
var encoding = require('../api/controllers/utils/encoding.js')

if (process.argv.length != 9) {
    console.log('usage: node populategenesetdb.js genedbpath genesetdbpath dbname genesetdescriptionfile genesetdatafile genesetaucfile genetotermfile')
    return
}

var genedbpath = process.argv[2]
var genesetdbpath = process.argv[3]
var dbname = process.argv[4]
var genesetfile = process.argv[5]
var datafile = process.argv[6]
var aucfile = process.argv[7]
var genetotermfile = process.argv[8]

var geneDB = level(genedbpath, {valueEncoding: 'binary'})
var genesetDB = level(genesetdbpath, {valueEncoding: 'binary'})
var geneIDs = fileutil.readIDFile(genetotermfile)
var genesetIDs = fileutil.readIDFile(genesetfile)

run()

function run() {
    async.series([
        function(callback) {
            console.log('starting')
            callback(null)
        },
        function(callback) {
            readGenesetsAndInsertToDBJSON(genesetDB, dbname, genesetfile, aucfile)
            readAnnotationsAndInsertToDBsUInt16BE(geneDB, genesetDB, dbname, aucfile, genetotermfile)
            callback(null)
        },
        function(callback) {
            readDataAndInsertToDBUInt16BE(genesetDB, dbname, datafile, genesetIDs, function(err) {
                if (err) console.log(err)
                else console.log('insert data done')
                callback(null)
            })
        },
        function(callback) {
            readDataAndInsertTransposedToDBUInt16BE(geneDB, dbname, datafile, geneIDs, function(err) {
                if (err) console.log(err)
                else console.log('insert data transposed done')
                callback(null)
            })
        }
    ], function(err) {
        if (err) console.log(err)
        else console.log('all done')
    })
}

function readGenesetsAndInsertToDBJSON(db, dbname, filename, aucfilename) {

    var genesetsInAUCFile = fileutil.readColumnFromFile(aucfilename, 0, {header: true})
    var genesets = fileutil.readGenesetFile(dbname, filename, genesetsInAUCFile)
    var aucs = fileutil.readColumnFromFile(aucfilename, 2, {header: true})
    var numGenes = fileutil.readColumnFromFile(aucfilename, 3, {header: true})
   
    if (genesets.length != aucs.length) {
	throw {name: 'DataError', message: 'auc file length different from number of gene sets: ' + aucs.length + ' vs ' + genesets.length}
    }
    
    for (var i = 0; i < genesets.length; i++) {
	if (genesetsInAUCFile[i] != genesets[i].id) {
	    throw {name: 'DataError', message: 'different gene set in auc file and gene set file, are they in the same order? ' + genesetsInAUCFile[i] + ' ' + genesets[i].id}
	}
        genesets[i].numAnnotatedGenes = +numGenes[i]
        genesets[i].auc = +aucs[i]
    }

    db.put('!RNASEQ!' + dbname.toUpperCase(), genesets, {valueEncoding: 'json'}, function(err) {
        if (err) console.log(err)
        else console.log(genesets.length + ' ' + dbname + ' gene sets inserted to db')
    })
}

function readAnnotationsAndInsertToDBsUInt16BE(genedb, genesetdb, dbname, aucfile, genetotermfile) {

    var genesetsInAUCFile = fileutil.readColumnFromFile(aucfile, 0, {header: true})
    var genes = fileutil.readIDFile(genetotermfile)
    var genesets = fileutil.readIDFile(aucfile, {header: true, limit: genesetsInAUCFile})

    if (genesets.length != genesetsInAUCFile.length) {
	throw {name: 'DataError', message: 'auc file length different from number of gene sets: ' + genesetsInAUCFile.length + ' vs ' + genesets.length}
    }

    var lines = _.compact(fs.readFileSync(genetotermfile, 'utf8').split('\n'))

    var batch = genedb.batch()
    var geneset2genes = []
    var num = 0
    for (var i = 0; i < lines.length; i++) { // i == gene index

        // if (i % 1000 === 0) {
        //     console.log(i + ' genes done')
        // }
        var split = _.compact(lines[i].split('\t'))
        if (split.length > 1) {
	    var indices = []
            for (var j = 1; j < split.length; j++) {
                var gsi = genesets.indexOf(split[j].trim())
                if (gsi < 0) {
                    console.log('Gene set ' + split[j].trim() + ' not in auc file!')
                } else {
		    indices.push(gsi)
                    if (!geneset2genes[gsi]) {
                        geneset2genes[gsi] = []
                    }
                    geneset2genes[gsi].push(i)
                }
            }
	    if (indices.length > 0) {
		var buf = new Buffer.alloc(indices.length * 2)
		for (var j = 0; j < indices.length; j++) {
		    buf.writeUInt16BE(indices[j], j * 2)
		}
		batch.put('RNASEQ!ANNOTATIONS!' + split[0] + '!' + dbname.toUpperCase(), buf)
		num++
	    }
        }
    }
    batch.write()
    console.log(num + ' annotations written to genedb')

    batch = genesetdb.batch()
    for (var i = 0; i < geneset2genes.length; i++) {
        var buf = new Buffer.alloc(geneset2genes[i].length * 2)
        for (var j = 0; j < geneset2genes[i].length; j++) {
            buf.writeUInt16BE(geneset2genes[i][j], j * 2)
        }
        if ('REACTOME' === dbname.toUpperCase() && genesets[i].indexOf('REACTOME_') != 0) {
            batch.put('RNASEQ!ANNOTATIONS!' + dbname.toUpperCase() + '!REACTOME_' + genesets[i], buf)
        } else {
            batch.put('RNASEQ!ANNOTATIONS!' + dbname.toUpperCase() + '!' + genesets[i], buf)
        }
    }
    batch.write()
    console.log('annotations written to genesetdb')
}

function readDataAndInsertToDBUInt16BE(db, dbname, filename, ids, cb) {

    console.log('reading data from ' + filename)
    var isNPY = filename.indexOf('.npy', filename.length - '.npy'.length) !== -1
    
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
	    buf = new Buffer.alloc((numCols + 1) * 2)
	    buf.writeUInt16BE(2, 0) // TODO number of significant genes
        }
        for (var i = start; i < data.length; i += 8) {
	    if (isNPY) {
		//value = Math.round(data.readDoubleLE(i) * 65535)
                value = Math.min(65535, Math.round(1000 * data.readDoubleLE(i)) + 32768)
		//buf.writeUInt16BE(Math.min(65535, Math.round(1000 * data.readDoubleLE(i)) + 32768), (valuesRead + 1) * 2)
	    } else {
		//value = Math.round(data.readDoubleBE(i) * 65535)
                value = Math.min(65535, Math.round(1000 * data.readDoubleBE(i)) + 32768)
		//buf.writeUInt16LE(Math.min(65535, Math.round(1000 * data.readDoubleBE(i)) + 32768), (valuesRead + 1) * 2)
	    }
	    if (value > 65535 || value < 0) {
		console.log('Value not in range: ' + value)
	    }
	    buf.writeUInt16BE(value, (valuesRead + 1) * 2)
            if (++valuesRead === numCols) {
                batch.put('RNASEQ!PREDICTIONS!' + dbname.toUpperCase() + '!' + ids[rowsRead], buf)
                valuesRead = 0
                if (++rowsRead % 1000 === 0) {
                    console.log(rowsRead + ' rows read')
                }
                buf = new Buffer.alloc((numCols + 1) * 2)
                buf.writeUInt16BE(2, 0) // TODO number of significant genes
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

function readDataAndInsertTransposedToDBUInt16BE(db, dbname, filename, ids, cb) {

    console.log('reading data from ' + filename)
    var isNPY = filename.indexOf('.npy', filename.length - '.npy'.length) !== -1

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
		console.log(numRows + ' rows in ' + filename)
		console.log(numCols + ' cols in ' + filename)
		start = 8
	    }
	    bufs = []
	    for (var i = 0; i < numCols; i++) {
                var b = new Buffer.alloc((numRows + 1) * 2)
                b.writeUInt16BE(2, 0)
                bufs.push(b)
	    }
        }
        for (var i = start; i < data.length; i += 8) {
	    if (isNPY) {
		//value = Math.round(data.readDoubleLE(i) * 65535)
                value = Math.min(65535, Math.round(1000 * data.readDoubleLE(i)) + 32768)
		//buf.writeUInt16BE(Math.min(65535, Math.round(1000 * data.readDoubleLE(i)) + 32768), (valuesRead + 1) * 2)
	    } else {
		//value = Math.round(data.readDoubleBE(i) * 65535)
                value = Math.min(65535, Math.round(1000 * data.readDoubleBE(i)) + 32768)
		//buf.writeUInt16LE(Math.min(65535, Math.round(1000 * data.readDoubleBE(i)) + 32768), (valuesRead + 1) * 2)
	    }
	    if (value > 65535 || value < 0) {
		console.log('Value not in range: ' + value)
	    }
            bufs[valuesRead].writeUInt16BE(value, (rowsRead + 1) * 2)
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
            batch.put('RNASEQ!PREDICTIONS!' + ids[i] + '!' + dbname.toUpperCase(), bufs[i])
        }
        batch.write(function() {
            console.log('batch written in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
            cb(null)
        })
    })
}
