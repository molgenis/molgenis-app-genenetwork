var fs = require('fs')
var splitter = require('split')
var zlib = require('zlib')

var exp = module.exports

exp.readBinary = function(filename, cb) {

    console.log('reading data from ' + filename)
    var isNPY = filename.indexOf('.npy', filename.length - '.npy'.length) !== -1

    var timeStart = new Date().getTime()
    var numRows = -1
    var numCols = -1
    var rowsRead = 0
    var valuesRead = 0
    var result = []
    
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
            result.push([])
        }
        for (var i = start; i < data.length; i += 8) {
            if (isNPY) {
                value = data.readDoubleLE(i)
            } else {
                value = data.readDoubleBE(i)
            }
            result[rowsRead].push(value)
            if (++valuesRead === numCols) {
                valuesRead = 0
                if (++rowsRead % 10000 === 0) {
                    console.log(rowsRead + ' rows read')
                }
                result.push([])
            }
        }
    })
    rs.on('end', function() {
        console.log(filename + ' read in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
        cb(null, result)
    })
}

exp.readTXT = function(filename, cb) {

    console.log('reading data from ' + filename)

    var timeStart = new Date().getTime()
    var rowsRead = 0
    var result = []

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
            line = line.toString("utf8")
            var split = line.split(/\t/)
            if (split.length > 1) {
                if (rowsRead === 0) {
                    console.log((split.length-1) + ' columns in ' + filename)
                } else {
                    var arr = []
                    for (var i = 1; i < split.length; i++) {
                        arr.push(+split[i])
                    }
                    result.push(arr)
                }
                if (++rowsRead % 10000 === 0) {
                    console.log(rowsRead + ' rows read')
                }
            }
        })
        .on('end', function() {
            console.log(filename + ' read in ' + (new Date().getTime() - timeStart) / 1000 + ' s')
            cb(null, result)
        })
}
