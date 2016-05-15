var level = require('level')

if (process.argv.length != 3) {
    return console.log('usage node listkeys.js dbpath')
}

var db = level(process.argv[2])
db.createKeyStream().on('data', function(key) {
    console.log(key)
})