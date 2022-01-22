
const { Client } = require('@elastic/elasticsearch')
var async = require('async')
// get the address for elastic search host
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config/config.properties');
var elasticHostAddress = properties.get('ELASTICSEARCH_HOST');


console.log("Elastic search host: "+elasticHostAddress)

const CLIENT = new Client({
    node: elasticHostAddress
})

var indices = ['search', 'gene', 'term','trait_mapped', 'diagnosis']

console.log("Reinitializing Elasticsearch indices")

// Code below is compatible with ElasticSearch 7
async.eachSeries(indices, async function(queryIndex, callback) {

    console.log(queryIndex);
    var {body} = await CLIENT.indices.exists({
        index: queryIndex
    })
    
    
    console.log(body)
    if (body === true) {
        console.log("Index "+queryIndex+" exists, deleting")
        // delete index
        await CLIENT.indices.delete({index: queryIndex})
    }  else {
        console.log("Index "+queryIndex+" does not exists")
    }
    if (queryIndex === 'search'){
        console.log("creating index: "+queryIndex)  
        await createSearchIndex(callback) 
    } 
    
    if (queryIndex === 'diagnosis'){
        console.log("creating index: "+queryIndex)  
        await createDiagnosisIndex(callback) 
    } 
        // if (index === 'diagnosis') createDiagnosisIndex(callback)
    

    
    
    // CLIENT.indices.exists({index: index})
    //     .then(function(exists) {
    //         if (exists) {
    //             console.log('index exists, deleting: %s', index)
    //             CLIENT.indices.delete({index: index})
    //                 .then(function(resp) {
    //                     console.log('index deleted:', resp)
    //                     if (index === 'search') createSearchIndex(callback)
    //                     if (index === 'diagnosis') createDiagnosisIndex(callback)
    //                 })
    //         } else {
    //             console.log('index does not exist yet: %s', index)
    //             if (index === 'search') createSearchIndex(callback)
    //             if (index === 'diagnosis') createDiagnosisIndex(callback)
    //         }
    //     })
})

function createSearchIndex(callback) {
    
    CLIENT.indices.create({ 
        index: 'search',
        body: {
            settings: {
                analysis: {
                    analyzer: {
                        analyzer_startswith: {
                            tokenizer: 'keyword',
                            filter: ['lowercase']
                        }
                    }
                }
            },
            mappings: {
                properties: {
                    id: {
                        index: true,
                        type: 'text'
                    },
                    name: {
                        index: true,
                        analyzer: 'analyzer_startswith',
                        type: 'text'
                    },
                    description: {
                        index: false,
                        type: 'text'
                    },
                    kind: {
                        index: false,
                        type: 'text'
                    },
                    database: {
                        index: false,
                        type: 'text'
                    },
                    type: {
                        index: false,
                        type: 'text'
                    },
                    genes: {
                        index: false,
                        type: 'text'
                    },
                    numGenes: {
                        index: false,
                        type: 'integer'
                    }
                }
            }
        }
    }).then(function(resp) {
        return callback(null, resp)
    })
}

function createDiagnosisIndex(callback) {
    CLIENT.indices.create({
        index: 'diagnosis',
        body: {
            settings: {
                analysis: {
                    analyzer: {
                        analyzer_startswith: {
                            tokenizer: 'keyword',
                            filter: ['lowercase']
                        }
                    }
                }
            },
            mappings: {
                properties: {
                    id: {
                        index: true,
                        analyzer: 'analyzer_startswith',
                        type: 'text'
                    },
                    name: {
                        index: true,
                        analyzer: 'analyzer_startswith',
                        type: 'text'
                    }
                }
            }
        }
        
    }).then(function(resp) {
        return callback(null, resp)
    })
}
