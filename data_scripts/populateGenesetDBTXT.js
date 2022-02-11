var _ = require('lodash')
var async = require('async')
var fs = require('fs')
var splitter = require('split')
var level = require('level')
var fileutil = require('./fileutil')
var zlib = require('zlib')

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

var NUM_ROWS = -1

// genesetDB.get('!RNASEQ!REACTOME', {valueEncoding: 'json'}, function(err, value) {
//     console.log(value)
// })

// genesetDB.get('!RNASEQ!REACTOME', {valueEncoding: 'json'}, function(err, pws) {
//     if (err) return console.log(err)
//     geneDB.get('RNASEQ!PREDICTIONS!ENSG00000012048!REACTOME', function(err, value) {
//         for (var i = 2; i < value.length; i+= 2) {
//             console.log(pws[(i - 2)/2].id + (value.readUInt16BE(i) - 32768) / 1000)
//         }
//     })
// })

run()

function run() {
    async.series([
        function(callback) {
            console.log('starting populateGenesetDBTXT')
            callback(null)
        },
        function(callback) {
            readGenesetsAndInsertToDBJSON(genesetDB, dbname, genesetfile, aucfile, callback)
        },
        function(callback) {
            readAnnotationsAndInsertToDBsUInt16BE(geneDB, genesetDB, dbname, aucfile, genetotermfile, callback)
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

function readGenesetsAndInsertToDBJSON(db, dbname, filename, aucfilename, callback) {

    var genesetsInAUCFile = fileutil.readColumnFromFile(aucfilename, 0, {header: true})
    var genesets = fileutil.readGenesetFile(dbname, filename, genesetsInAUCFile)
    var aucs = fileutil.readColumnFromFile(aucfilename, 2, {header: true})
    var numGenes = fileutil.readColumnFromFile(aucfilename, 3, {header: true})
    
    for (i = 0; i < genesetsInAUCFile.length; i++) {
        if ('REACTOME' === dbname.toUpperCase() && genesetsInAUCFile[i].indexOf('REACTOME:') != 0) {
            genesetsInAUCFile[i] = 'REACTOME:' + genesetsInAUCFile[i]
        }
    }

    if (genesets.length != aucs.length) {
        console.error('auc file length different from number of gene sets: ' + aucs.length + ' vs ' + genesets.length)
        process.exit(1)
    }
    
    for (var i = 0; i < genesets.length; i++) {
        if (genesetsInAUCFile[i] != genesets[i].id) {
	    console.error('different gene set in auc file and gene set file, are they in the same order? ' + genesetsInAUCFile[i] + ' ' + genesets[i].id)
            process.exit(1)
        }
        genesets[i].numAnnotatedGenes = +numGenes[i]
        genesets[i].auc = +aucs[i]
    }
    
    genesetDB.put('!RNASEQ!' + dbname.toUpperCase(), genesets, {valueEncoding: 'json'}, function(err) {
        if (err) {
            callback(err)
        }
        else console.error(genesets.length + ' ' + dbname + ' gene sets inserted to db')
        callback(null)
    })
}

function readAnnotationsAndInsertToDBsUInt16BE(genedb, genesetdb, dbname, aucfile, genetotermfile, callback) {

    var genesetsInAUCFile = fileutil.readColumnFromFile(aucfile, 0, {header: true})
    var genes = fileutil.readIDFile(genetotermfile)
    var genesets = fileutil.readIDFile(aucfile, {header: true, limit: genesetsInAUCFile})

    if (genesets.length != genesetsInAUCFile.length) {
	throw {name: 'DataError', message: 'auc file length different from number of gene sets: ' + genesetsInAUCFile.length + ' vs ' + genesets.length}
    }

    var raw = fs.readFileSync(genetotermfile)
    if(genetotermfile.endsWith(".gz")){
        raw = zlib.gunzipSync(raw)
    }
    raw = raw.toString("utf8");

    var lines = _.compact(raw.split('\n'))

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
                var key = 'RNASEQ!ANNOTATIONS!' + split[0] + '!' + dbname.toUpperCase()
		batch.put(key, buf)
		num++
	    }
        }
    }
    batch.write(function() {
        console.log(num + ' annotations written to genedb')
        var setbatch = genesetdb.batch()
        for (var i = 0; i < geneset2genes.length; i++) {
            var buf = new Buffer.alloc(geneset2genes[i].length * 2)
            for (var j = 0; j < geneset2genes[i].length; j++) {
                buf.writeUInt16BE(geneset2genes[i][j], j * 2)
            }
            if ('REACTOME' === dbname.toUpperCase() && genesets[i].indexOf('REACTOME:') != 0) {
                setbatch.put('RNASEQ!ANNOTATIONS!' + dbname.toUpperCase() + '!REACTOME:' + genesets[i], buf)
            } else {
                setbatch.put('RNASEQ!ANNOTATIONS!' + dbname.toUpperCase() + '!' + genesets[i], buf)
            }
        }
        setbatch.write(function() {
            console.log('annotations written to genesetdb')
            callback(null)
        })
    })
}

function readDataAndInsertToDBUInt16BE(db, dbname, filename, ids, cb) {

    console.log('reading data from ' + filename)
    
    var batch = db.batch()
    var lineNum = 0
    var buf = null
    var data = []
    var headers = null
    if(!filename.endsWith(".gz")){
        console.log("not a GZIP file: " + filename)
        process.exit(1)
    }
    fs.createReadStream(filename)
        .pipe(zlib.createGunzip())
        .pipe(splitter())
        .on('error', function(err) {
            cb(err)
        })
        .on('data', function(line) {
            var split = line.split(/\t/)
            if (split.length > 1) {
                if (lineNum === 0) {
                    headers = split.slice(1)
                    ++lineNum
                    console.error(new Date(), headers.length + ' headers read')
                } else {
                    var buf = new Buffer.alloc((headers.length + 1) * 2)
	            buf.writeUInt16BE(2, 0) // TODO number of significant genes
                    for (var i = 1; i < split.length; i++) {
		        var z = +split[i]
		        var value = Math.min(65535, Math.round(1000 * z) + 32768)
                        // if (lineNum === 2 && i === 2) {
                        //     console.error('check', z, value)
                        // }
		        try {
                            buf.writeUInt16BE(value, i * 2)
		        } catch (e) {
                            console.error(headers.length, z, value, e)
		        }
                    }
                    var key = 'RNASEQ!PREDICTIONS!' + dbname.toUpperCase() + '!' + split[0]
                    if ('REACTOME' === dbname.toUpperCase() && split[0].indexOf('REACTOME:') != 0) {
                        key = 'RNASEQ!PREDICTIONS!' + dbname.toUpperCase() + '!REACTOME:' + split[0]
                    }
                    batch.put(key, buf)
                    if (++lineNum % 100 === 0) {
		        console.error(new Date(), lineNum + ' rows read, writing batch')
		        batch.write(function() {
                            console.error(new Date(), 'batch written')
		        })
		        batch = db.batch()
                    }
                }
            }
        })
        .on('end', function() {
            NUM_ROWS = lineNum - 1
            console.error(new Date(), NUM_ROWS + ' rows in data')
            console.error(new Date(), 'writing final batch')
            batch.write(function() {
                console.error(new Date(), 'final batch written')
                cb(null)
            })
        })
}

function readDataAndInsertTransposedToDBUInt16BE(db, dbname, filename, ids, cb) {

    console.error(new Date(), 'reading data from ' + filename)

    var batch = db.batch()
    var lineNum = 0
    var bufs = null
    if(!filename.endsWith(".gz")){
        console.log("not a GZIP file: " + filename)
        process.exit(1)
    }   
    fs.createReadStream(filename)
        .pipe(zlib.createGunzip())
        .pipe(splitter())
        .on('error', function(err) {
            cb(err)
        })
        .on('data', function(line) {
            var split = line.split(/\t/)
            if (split.length > 1) {
                if (lineNum === 0) {
	            bufs = []
	            for (var i = 1; i < split.length; i++) {
                        var b = new Buffer.alloc((NUM_ROWS + 1) * 2)
                        b.writeUInt16BE(2, 0)
                        bufs.push(b)
	            }
                }
                for (var i = 1; i < split.length; i ++) {
                    value = Math.min(65535, Math.round(1000 * +split[i]) + 32768)
	            if (value > 65535 || value < 0) {
		        console.error(new Date(), 'Value not in range: ' + value)
	            }
                    bufs[i - 1].writeUInt16BE(value, lineNum * 2) // lineNum is at least 1
                }
                if (++lineNum % 100 === 0) {
                    console.error(new Date(), lineNum + ' rows read')
                }
            }
        })
        .on('end', function() {
            console.log(new Date(), 'writing batch')
            for (var i = 0; i < bufs.length; i++) {
                batch.put('RNASEQ!PREDICTIONS!' + ids[i] + '!' + dbname.toUpperCase(), bufs[i])
            }
            batch.write(function() {
                console.log(new Date(), 'batch written')
                cb(null)
            })
        })
}
