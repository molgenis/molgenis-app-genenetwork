var fs = require('fs')
var level = require('level')
var fileutil = require('./fileutil')

if (process.argv.length != 4) {
    return console.log('usage: node populateGenesToGeneDB.js path/to/db path/to/genefile')
}

var filename = process.argv[3]
var genes = fileutil.readGeneFile(filename)

var genedb = level(process.argv[2], {valueEncoding: 'json'})
genedb.put('!RNASEQ', genes)
