var _ = require('lodash')
var fs = require('fs')

var BIOMART_RELEASE = 'V75'
var ASSEMBLY_RELEASE = 'GRCh37'

var exp = module.exports

exp.readIDFile = function(filename, options) {

    options = options || {}
    var ids = _.map(_.compact(fs.readFileSync(filename, 'utf8').split('\n')), function(line) { return line.split('\t')[0].trim()  })
    if (options.header === true) {
        ids.splice(0,1)
    }
    if (options.limit) {
	ids = _.filter(ids, function(id) { return options.limit.indexOf(id) > -1 })
    }
    
    if (options.addColon) {
        ids = _.map(ids, function(id) { return id.substring(0,2) + ':' + id.substring(2) } )
    }

    console.log(ids.length + ' ids read from ' + filename)
    return ids
}

exp.readColumnFromFile = function(filename, colNumber, options) {

    var lines = _.compact(fs.readFileSync(filename, 'utf8').split('\n'))
    if (options && options.header) {
        lines.splice(0,1)
    }
    var data = _.map(lines, function(line) { return line.split('\t')[colNumber] })
    // for (var i = 0; i < lines.length; i++) {
    //     data.push(lines[i].split('\t')[colNumber])
    // }

    console.log(lines.length + ' lines read from ' + filename)
    return data
}

exp.readGeneFile = function(filename) {
    var lines = fs.readFileSync(filename, 'utf8').split('\n')
    var geneObjects = []
    for (var i = 1; i < lines.length; i++) {
        var split = lines[i].split('\t')
        if (split.length > 8) {
            geneObjects.push({
                id: split[0],
                // if you use 'index', it will be overwritten by something at some point:
                // in the browser (Chrome), the indices are overwritten according to the indices in the array...
                // jesus christ
                index_: (i - 1),
                name: split[1],
                biotype: split[3],
                chr: split[4],
                start: Number(split[5]),
                stop: Number(split[6]),
                strand: Number(split[7]),
                description: split[8],
                biomartRelease: BIOMART_RELEASE,
                assemblyRelease: ASSEMBLY_RELEASE
            })
        }
    }
    console.log(geneObjects.length + ' genes read from ' + filename)
    return geneObjects
}

exp.readGenesetFile = function(dbname, filename, limittothesesets) {

    var genesetLines = fs.readFileSync(filename, 'utf8').split('\n')
    if (genesetLines[genesetLines.length-1] === '') {
        genesetLines.splice(-1,1)
    }

    var genesets = []
    for (var i = 0; i < genesetLines.length; i++) {
        var split = genesetLines[i].split('\t')
	if (!limittothesesets || limittothesesets.indexOf(split[0]) > -1) {
            var id = split[0]
            if ('REACTOME' === dbname.toUpperCase() && id.indexOf('REACTOME:') != 0) {
                id = 'REACTOME:' + id
            }
            genesets.push({
		database: dbname,
		id: id,
		name: split[1],
		url: split[3]
            })
	}
    }

    console.log(genesets.length + ' gene sets read from ' + filename)
    return genesets
}
