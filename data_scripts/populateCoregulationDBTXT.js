'use strict'

var prob = require('genstats').probability
var fs = require('fs')
var level = require('level')
var splitter = require('split')
var zlib = require('zlib')

if (process.argv.length !== 5) {
    console.error('usage: node populateCoregulationdDBTXT filename dblocation numComponents')
    process.exit(1)
}

var db = level(process.argv[3], {
    valueEncoding: 'binary'
})

var numComps = +process.argv[4]
var lineNum = 0
var batch = db.batch()
var headers = null
var buf = null
if(!filename.endsWith(".gz")){
    console.log("not a GZIP file: " + filename)
    process.exit(1)
}
fs.createReadStream(process.argv[2])
    .pipe(zlib.createGunzip())
    .pipe(splitter())
    .on('data', function (line) {
        var split = line.split(/\t/)
        if (split.length > 1) {
            if (lineNum === 0) {
                headers = split.slice(1)
                for (var i = 0; i < headers.length; i++) {
                    headers[i] = headers[i].replace(/\]/g, '') // remove ] characters in ids
                }
                ++lineNum
                console.error(new Date(), 'headers read')
            } else {
                var buf = new Buffer(headers.length * 2)
                for (var i = 1; i < split.length; i++) {
                    var corr = +split[i]
                    var z = prob.corrToZ(corr, numComps)
                    var value = Math.max(0, Math.min(65535, Math.round(1000 * z) + 32768))

                    if (lineNum === 2 && i === 2) {
                        console.error('check', corr, z, value)
                    }
                    try {
                        buf.writeUInt16BE(value, (i - 1) * 2)
                    } catch (e) {
                        console.error('couldnt write', corr, z, value)
                        process.exit(1)
                    }
                }
                batch.put('RNASEQ!' + headers[lineNum - 1], buf)
                if (++lineNum % 1000 === 0) {
                    console.error(new Date(), lineNum + ' rows read, writing batch')
                    batch.write(function () {
                        console.error(new Date(), 'batch written')
                    })
                    batch = db.batch()
                }
            }
        }
    })
    .on('end', function () {
        console.error(new Date(), 'writing final batch')
        batch.write(function () {
            console.error(new Date(), 'final batch written')
        })
    })
