var _ = require('lodash')
var level = require('level')
var elasticsearch = require('elasticsearch')

var client = new elasticsearch.Client({
    host: 'elasticsearch:9200',
    log: 'info'
})

var db = level('/data/genenetwork/level/new/dbgenes_uint16be', {valueEncoding: 'binary'})

db.get('!RNASEQ', {valueEncoding: 'json'}, function(err, data) {
    var bulk = []
    var numBatched = 0
    if (err) return console.error(err)
    _.forEach(data, function(gene, i) {
        var desc = (gene.description.replace(/\[[^\]]+\]/g, '') || 'no description').trim()
        var words = _.compact(desc.split(' '))
        words.push(gene.name)
        words.push(gene.id)
        if (i % 10000 === 0) {
            console.log(i, gene.name, desc)
        }
        bulk.push({
            create: {
                _index: 'search',
                _type: 'gene',
                _id: gene.id
                
            }
        })
        bulk.push({
            id: gene.id,
            name: gene.name,
            biotype: gene.biotype,
            description: desc
            // suggest: {
            //     input: words,
            //     output: [gene.name + ' - ' + desc],
            //     payload: {geneId: gene.index_},
            //     weight: 10000
            // }
        })
        if (++numBatched === data.length) {
            processBulk(bulk)
        }
    })
})

function processBulk(bulk) {
    console.log('processing bulk')
    client.bulk({body: bulk}, function(err, resp) {
        if (err) console.log(err)
        else console.log('bulk written')
    })
}
