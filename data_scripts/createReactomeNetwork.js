var _ = require('lodash')
var fs = require('fs')
var level = require('level')
var split = require('split')

var termFile = process.argv[2] //'/data/genenetwork/files/Reactome/Reactome_terms.txt'
var idFile = process.argv[3] //'/data/genenetwork/files/Reactome/ReactomePathways.txt'
var relationFile = process.argv[4] //'/data/genenetwork/files/Reactome/ReactomePathwaysRelation.txt'

var terms = {}
_.forEach(fs.readFileSync(termFile, 'utf8').split('\n'), function(line) {
    var split = line.split('\t')
    if (split.length > 1) {
        terms[line.split('\t')[1].trim()] = true
    }
})

var id2term = {}
_.forEach(fs.readFileSync(idFile, 'utf8').split('\n'), function(line) {
    var split = line.split('\t')
    if (split.length > 2 && split[2].trim().toLowerCase() == 'homo sapiens') {
        if (terms[split[1].trim()] === true) {
            id2term[split[0].trim()] = split[1].trim()
        }
    }
})

_.forEach(terms, function(truu, term) {
    if (!_.includes(id2term, term)) {
        // console.log(term)
    }
})

console.log(_.size(terms) + ' terms', _.size(id2term) + ' ids')

var ReactomeNetwork = {
    nodes: [],
    edges: []
}

ReactomeNetwork.nodes = _.map(id2term, function(term, id) {
    return {
        id: id,
        name: term
    }
})

ReactomeNetwork.edges = _.compact(_.map(fs.readFileSync(relationFile, 'utf8').split('\n'), function(line) {
    var split = line.split('\t')
    var parent = split[0].trim()
    var child = child.trim()
    if (id2term[parent] && id2term[child]) {
        return {
            source: parent,
            target: child
        }
    } else {
        return null
    }
}))

console.log(ReactomeNetwork.nodes.length + ' nodes', ReactomeNetwork.edges.length + ' edges')

var genesetDB = level('/data/genenetwork/level/dbexternal_uint16be', {valueEncoding: 'binary'})
genesetDB.get('!RNASEQ!REACTOME', {valueEncoding: 'json'}, function(err, json) {
    if (err) {
        console.log(err)
    } else {
        // ReactomeNetwork.nodes = _.map(json, function(term) {
        //     if (id2term
        // })
    }
    genesetDB.put('RNASEQ!NETWORK!REACTOME', ReactomeNetwork, {valueEncoding: 'json'}, function(err) {
        if (err) console.log(err)
        console.log('network put to database')
    })
})
