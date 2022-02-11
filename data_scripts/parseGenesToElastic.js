var _ = require('lodash')
var level = require('level')
const { Client } = require('@elastic/elasticsearch')
// get the address for elastic search host
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config/config.properties');
var elasticHostAddress = properties.get('ELASTICSEARCH_HOST');

// get the location of the GN files
var genenetworkFilePath = properties.get('GN_FILES_PATH')

console.log("Loading genes into Elasticsearch")

const client = new Client({
    node: elasticHostAddress
})

var db = level(genenetworkFilePath+'level/new/dbgenes_uint16be', {valueEncoding: 'binary'})

db.get('!RNASEQ', {valueEncoding: 'json'}, function(err, data) {
    var bulk = []
    var numBatched = 0
    var batchsize = 10000
    if (err) return console.error(err)
    _.forEach(data, function(gene, i) {
        var desc = (gene.description.replace(/\[[^\]]+\]/g, '') || 'no description').trim()
        var words = _.compact(desc.split(' '))
        words.push(gene.name)
        words.push(gene.id)
        if (bulk.length % 100000 === 0) {
            if ( bulk.length > 0){
                console.log(i, gene.name, desc, bulk.length)    
                processBulk(bulk)
                bulk = []
               // process.exit(1)
            }
        }
        
        bulk.push({
            create: {
                _index: 'search',
                _id: gene.id               
            }
        })
        bulk.push({
            id: gene.id,
            name: gene.name,
            biotype: gene.biotype,
            description: desc,
            kind: 'gene'
            // suggest: {
            //     input: words,
            //     output: [gene.name + ' - ' + desc],
            //     payload: {geneId: gene.index_},
            //     weight: 10000
            // }
        })
        // console.log(i+" versus "+bulk.length)   
        // if (++numBatched === data.length) {
            
        // }
    })
    if(bulk.length > 0){
        console.log("Processing last bulk batch; contains "+bulk.length)
        processBulk(bulk)
    }
})

async function processBulk(bulk) {
    console.log('processing bulk - start '+bulk.length)
    
    const bulkResponse  = await client.bulk({
            body: bulk
        });
    
    // console.log(bulkResponse)

    console.log('processing bulk - end '+bulk.length)
    const count = await client.count({ index: 'search' })
    console.log(count)
}
