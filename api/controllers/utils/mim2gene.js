var exp = module.exports
var fs = require('fs')

//file mapping OMIM CUI's to gene names

var mim2gene = readMim2Gene()

exp.get = function(gene){
    return mim2gene[gene]
}

function readMim2Gene(){
    var lines = fs.readFileSync(sails.config.mim2gene, 'utf8').split('\n')
    var mim2GeneObject = {}
    for (i = 0; i < lines.length; i++) {
        var line = lines[i].split('\t')
        if (line[1] == 'gene') {
            var mimGeneName = line[3]
            mim2GeneObject[mimGeneName] = line[0]                        
        }
    }
    return mim2GeneObject
}
