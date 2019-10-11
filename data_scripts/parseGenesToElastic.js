var _ = require('lodash')
var level = require('level')
var elasticsearch = require('elasticsearch')
// get the address for elastic search host
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config/config.properties');
var elasticHostAddress = properties.get('ELASTICSEARCH_HOST');
// get the location of the GN files
var genenetworkFilePath = properties.get('GN_FILES_PATH')

var client = new elasticsearch.Client({
    host: elasticHostAddress,
    log: 'info'
})

var db = level(genenetworkFilePath+'level/new/dbgenes_uint16be', {valueEncoding: 'binary'})

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
