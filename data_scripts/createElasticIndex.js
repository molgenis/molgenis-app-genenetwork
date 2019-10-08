var elasticsearch = require('elasticsearch')
var async = require('async')
// get the address for elastic search host
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config/config.properties');
var elasticHostAddress = properties.get('ELASTICSEARCH_HOST');

var CLIENT = new elasticsearch.Client({
    host: elasticHostAddress,
    log: 'info'
})

var indices = ['search', 'diagnosis']

async.eachSeries(indices, function(index, callback) {
    CLIENT.indices.exists({index: index})
        .then(function(exists) {
            if (exists) {
                console.log('index exists, deleting: %s', index)
                CLIENT.indices.delete({index: index})
                    .then(function(resp) {
                        console.log('index deleted:', resp)
                        createSearchIndex(callback)
                    })
            } else {
                console.log('index does not exist yet: %s', index)
                if (index === 'search') createSearchIndex(callback)
                if (index === 'diagnosis') createDiagnosisIndex(callback)
            }
        })
})

function createSearchIndex(callback) {
    CLIENT.indices.create({
        index: 'search',
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
            body: {
                gene: {
                    properties: {
                        id: {
                            index: 'not_analyzed',
                            type: 'string'
                        },
                        name: {
                            index: 'analyzed',
                            analyzer: 'analyzer_startswith',
                            type: 'string'
                        },
                        description: {
                            index: 'not_analyzed',
                            type: 'string'
                        }
                    }
                },
                term: {
                    properties: {
                        id: {
                            index: 'not_analyzed',
                            type: 'string'
                        },
                        name: {
                            index: 'analyzed',
                            analyzer: 'analyzer_startswith',
                            type: 'string'
                        },
                        database: {
                            index: 'not_analyzed',
                            type: 'string'
                        },
                        type: {
                            index: 'not_analyzed',
                            type: 'string'
                        },
                        genes: {
                            index: 'not_analyzed',
                            type: 'string'
                        },
                        numGenes: {
                            index: 'not_analyzed',
                            type: 'integer'
                        }
                    }
                },
                trait_mapped: {
                    properties: {
                        id: {
                            index: 'not_analyzed',
                            type: 'string'
                        },
                        name: {
                            index: 'analyzed',
                            analyzer: 'analyzer_startswith',
                            type: 'string'
                        },
                        numGenes: {
                            index: 'not_analyzed',
                            type: 'integer'
                        }
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
            body: {
                term: {
                    properties: {
                        id: {
                            index: 'analyzed',
                            analyzer: 'analyzer_startswith',
                            type: 'string'
                        },
                        name: {
                            index: 'analyzed',
                            analyzer: 'analyzer_startswith',
                            type: 'string'
                        }
                    }
                }
            }
        }
    }).then(function(resp) {
        return callback(null, resp)
    })
}
