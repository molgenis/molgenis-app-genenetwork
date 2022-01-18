var exp = module.exports;
var fs = require('fs');
var zlib = require('zlib')

var genes = readGenes();
var genesByENSG = {};
var genesByName = {};
for (var i = 0; i < genes.length; i++) {
    genesByENSG[genes[i].id] = genes[i];
    genesByName[genes[i].name] = genes[i]
}

var genesIDNameHref = {};
genesIDNameHref.comment = sails.config.version.comment();
genesIDNameHref.version = sails.config.version.version;
genesIDNameHref.href = sails.config.version.apiUrl + '/gene';
genesIDNameHref.genes = [];
for (var i = 0; i < genes.length; i++) {
    genesIDNameHref.genes.push({
        id: genes[i].id,
        name: genes[i].name,
        href: sails.config.version.apiUrl + '/gene/' + genes[i].id
    })
}
var genesJSONStr = JSON.stringify(genesIDNameHref, null, 2);

exp.getAll = function() {
    return genes
};

exp.getAllJSONStr = function() {
    return genesJSONStr
};

exp.getNumGenes = function() {
    return genes.length
};

exp.getByENSG = function(ensg) {
    return genesByENSG[ensg]
};

exp.get = function(x) {
    var gene = null;
    if (typeof x === 'number') {
        gene = genes[x]
    } else {
        x = x.trim();
        // var colonI = x.indexOf(':')
        // if (colonI > 0) {
        //     x = x.substring(0, colonI)
        // }
        if (x.substring(0, 4).toUpperCase() === 'ENSG') {
            gene = genesByENSG[x.toUpperCase()]
        } else {
            if (genesByName[x]) gene = genesByName[x];
            else if (genesByName[x.toUpperCase()]) gene = genesByName[x.toUpperCase()];
            else gene = genesByName[x.toLowerCase()];
        }
    }
    return gene
};

exp.getMap = function(names) {
    var map = {};
    for (var i = 0; i < names.length; i++) {
        var gene = this.get(names[i]);
//        if (names[i].indexOf(':') > -1) {
//            gene = this.get(names[i].substring(0, names[i].indexOf(':')))
//        }
        if (gene) {
            map[names[i]] = gene
        }
    }
    return map
};

exp.getArray = function(names) {
    var arr = [];
    var ensgs = [];
    for (var i = 0; i < names.length; i++) {
        var gene = this.get(names[i]);
        if (!gene && names[i].indexOf(':') > -1) {
            gene = this.get(names[i].substring(0, names[i].indexOf(':')))
        }
        if (gene && ensgs.indexOf(gene.id) < 0) {
            arr.push(gene);
            ensgs.push(gene.id)
        }
    }
    return arr
};

function readGenes() {

    console.log("Read: "+sails.config.geneDescFile)
    var lines = fs.readFileSync(sails.config.geneDescFile);
    if(sails.config.geneDescFile.endsWith(".gz")){
        lines = zlib.gunzipSync(lines)
    }
    lines = lines.toString("utf8").split("\n");

    console.log("Read: "+sails.config.genesToTranscripts)
    var transcripts = fs.readFileSync(sails.config.genesToTranscripts);
    if(sails.config.genesToTranscripts.endsWith(".gz")){
        transcripts = zlib.gunzipSync(transcripts)
    }
    transcripts = transcripts.toString("utf8").split("\n");

    var transcriptsPerGene = {};
    for (var i = 1; i < transcripts.length; i++){
        var gene = transcripts[i].split('\t')[0];
        if (!(gene in transcriptsPerGene)) {transcriptsPerGene[gene] = Array()}
        transcriptsPerGene[gene].push(transcripts[i].split('\t')[1])
    }
    var geneObjects = [];
    for (var i = 1; i < lines.length; i++) {
        var split = lines[i].split('\t');
        if (split.length > 8) {
            var desc = split[8];
            if (desc.substring(0, 1) == '"') {
                desc = desc.substring(1)
            }
            if (desc.substring(desc.length - 1) == '"') {
                desc = desc.substring(0, desc.length - 1)
            }
            geneObjects.push({
                id: split[0],
                // so if you use 'index', it will be overwritten by something at some point:
                // in the browser, the indices are overwritten according to the indices in the array...
                // jesus christ
                index_: (i - 1),
                name: split[1],
                biotype: split[3],
                chr: split[4],
                start: Number(split[5]),
                stop: Number(split[6]),
                strand: Number(split[7]),
                description: desc,
                biomartRelease: sails.config.version.biomartRelease,
                assemblyRelease: sails.config.version.assemblyRelease,
                transcripts: transcriptsPerGene[split[0]] ? transcriptsPerGene[split[0]].sort() : undefined
            })
        }
    }

    console.log("Reading through gene predict score file: "+sails.config.genePredScoreFile,)
    var genePredictFileLines = fs.readFileSync(sails.config.genePredScoreFile);
    var transcripts = fs.readFileSync(sails.config.genesToTranscripts);
    if(sails.config.genePredScoreFile.endsWith(".gz")){
        genePredictFileLines = zlib.gunzipSync(genePredictFileLines)
    }
    genePredictFileLines = genePredictFileLines.toString("utf8").split("\n");
    var indexOffset = 0;
    for (var i = 1; i < genePredictFileLines.length-1; i++) {
        var split = genePredictFileLines[i].split('\t');
        var geneId = split[0];
        var genePredScore = split[2];

        // Some genes are not present in genes file
        if (geneObjects[i-1+indexOffset].id !== geneId) {
            indexOffset++;
        }
        geneObjects[i-1+indexOffset].genePredScore = genePredScore;
    }

    sails.log.info(geneObjects.length + ' genes read from ' + sails.config.geneDescFile);
    return geneObjects
}
