var _ = require('lodash');
var fs = require('fs');
var split = require('split');
var level = require('level');
var elasticsearch = require('elasticsearch')
// get the address for elastic search host
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('../config/config.properties');
var elasticHostAddress = properties.get('ELASTICSEARCH_HOST');
// get the location of the GN files
var genenetworkFilePath = properties.get('GN_FILES_PATH');

var pathwayDb = level(genenetworkFilePath+'level/new/dbexternal_uint16be', { valueEncoding: 'binary' });
var significantTerms = {};
var allTerms = {};

var client = new elasticsearch.Client({
    host: elasticHostAddress,
    log: 'info'
});

pathwayDb.createReadStream({
    start: '!RNASEQ!HPO',
    end: '!RNASEQ!HPO~',
    valueEncoding: 'json'
})
    .on('data', function(data) {
        significantTerms = _.keyBy(data["value"], function(o) { return(o.id) });
    })
    .on('end', function() {
        readObo();
    });


function readObo() {
    var currentTerm = null;

    fs.createReadStream(genenetworkFilePath+'files/new/hp.obo', 'utf8')
        .pipe(split())
        .on('data', function(data) {
            data = data.trim();

            // New term
            if (data.match(/\[Term]/)) {
                if (currentTerm) {
                    currentTerm.isSignificantTerm = !!significantTerms[currentTerm.id];
                    allTerms[currentTerm.id] = currentTerm;
                }
                currentTerm = {};
            }

            // Parse the term
            if (data.match(/^id: /)) {
                currentTerm.id = data.substring(4)
            } else if (data.match(/^name: /)) {
                currentTerm.name = data.substring(6)
            } else if (data.match(/^def: /)) {
                currentTerm.def = data.substring(5)
            } else if (data.match(/^comment: /)) {
                currentTerm.comment = data.substring(9)
            } else {
                var parent = data.match(/^is_a: (HP:[0-9]+)/);
                if (parent) {
                    if (!currentTerm.parents) {
                        currentTerm.parents = [];
                    }
                    currentTerm.parents.push(parent[1])
                }
            }
        })
        .on('end', function() {
            parseToElastic()
        });
}

function parseToElastic() {
    var bulk = [];
    _.forEach(allTerms, function (term) {
        bulk.push({
            create: {
                _index: 'diagnosis',
                _type: 'term',
                _id: term.id
            }
        });
        bulk.push({
            id: term.id,
            name: term.name,
            isSignificantTerm: term.isSignificantTerm,
            parents: term.parents,
        })
    });

    client.bulk({body: bulk}, function(err, resp) {
        if (err) console.log(err);
        else console.log('bulk written')
    })

}






