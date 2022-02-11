var _ = require('lodash')
var fs = require('fs')
var level = require('level')
var split = require('split')

if (process.argv.length !== 4){
	console.log('usage: node writeHpoCorrelationToDb.js hpo_correlation_matrix.txt dbfolder')
	process.exit(1)
}

var db = level(process.argv[3], {
    valueEncoding: 'binary'
})

var lineNum = 0
var headers = null

fs.createReadStream(process.argv[2])
	.pipe(split())
	.on('data', function(line){
		split = line.split('\t')
		if (split.length > 1){
			if (lineNum == 0){
				headers = split.slice(1)
				db.put('RNASEQ!HPOCORRELATIONS!HEADER', headers, {valueEncoding: 'json'})
				lineNum++
			} else {
				var buf = new Buffer.alloc(headers.length * 2)
				for (var i = 1; i < split.length; i++){
					var corr = Math.round(split[i] * 1000)/1000
					//transform correlation to 16bit integer.
					//a 16bit integer can store 65,536 values,
					//therefore I scaled the correlation between
					//0 and 50.000 (-1 = 0, 0=25000, 1=50000).
					var value = corr * 25000 + 25000
					try {
						buf.writeUInt16BE(value, (i - 1) * 2)
					} catch (e) {
						console.error('couldnt write', corr, value)
					}
				}
				db.put('RNASEQ!HPOCORRELATIONS!' + headers[lineNum - 1], buf)
				++lineNum
			}
		}
	})


