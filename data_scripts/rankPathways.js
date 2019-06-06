var _ = require('lodash')
var rank = require('../stats/rank.js')
var level = require('level')

var db = level('/data/genenetwork/final/dbexternal_uint16be_', {
    valueEncoding: 'binary'
})

var rankdb = level('/data/genenetwork/final/dbexternalranks_', {
    valueEncoding: 'binary'
})

var batch = rankdb.batch()
var numBatched = 0
db.createReadStream()
    .on('data', function(data) {
        // if (data.key.indexOf('PREDICTIONS') >= 0) {
        if (data.key.indexOf('!') > 0) {
            // var numAnn = data.value.readUInt32BE(0)
            // var numPred = data.value.length / 4 - numAnn - 1
            // var arr = []
            // for (var i = 1 + numAnn; i < data.value.length / 4; i++) {
            //     arr.push(data.value.readFloatBE(i * 4))
            // }
            var arr = []
            for (var i = 1; i < data.value.length / 4; i++) {
                arr.push(data.value.readFloatBE(i * 4))
            }
            var ranks = rank(arr)
            var rankBuffer = new Buffer(ranks.length * 2)
            for (var i = 0; i < ranks.length; i++) {
                rankBuffer.writeUInt16BE(ranks[i], i * 2)
            }
            batch.put(data.key, rankBuffer)
            if (++numBatched % 100 === 0) {
                console.log(numBatched + ' done')
            }
            if (numBatched % 1000 === 0) {
                batch.write()
                batch = rankdb.batch()
                console.log('batch written')
            }
        } else {
            console.log(data.key, data.value.length)
        }
    })
    .on('end', function(data) {
        batch.write()
        console.log('done!')
    })
