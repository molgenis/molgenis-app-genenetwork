var level = require('level');
var fs = require('fs');

if (process.argv.length != 4){
    console.log('Usage: node get.js db gene')
    process.exit(1)
}

var db = level(process.argv[2], {valueEncoding: 'binary'});
var key = process.argv[3]

// function getData(key) {
// 	db.get(key, function(err, data) {
// 		if (err) console.log(err)
// 		else console.log(data)
// 		})
// }

// getData('!RNASEQ!' + gene)

var a = []

db.createReadStream({
	start: key,
	end: key
})

.on('data', function(buffer) {
	for (var i = 0; i < buffer.value.length; i+=2){
    	a.push((buffer.value.readUInt16BE(i) - 32768) / 1000)
    }
})

.on('end', function(){
	console.log(a.join('\n'))
	// fs.writeFile('/data/genenetwork/level/tissuedb.txt', a.join('\n'))
})




// db2.get('RNASEQ!' + gene, [{valueEncoding: 'binary'}], function(err, buffer) {
//     if (err) console.log(err)
//     else {
    	
//     	for (var i = 0; i < buffer.length; i+=2){
//     		a.push((buffer.readUInt16BE(i) - 32768) / 1000)
//     	}
//     }
// })






// db.get('!RNASEQ!TISSUES', [{valueEncoding: 'json'}], function(err, data) {
//                 if (err) sails.log.error(err)
//                 else {
//                 	console.log(data)
//                     // for (var i = 0; i < data.length; i++){
//                     //     console.log(data[i])
//                     // }
//                 }
//             })