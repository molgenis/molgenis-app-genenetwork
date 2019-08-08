var _ = require('lodash')
// get location of GN files
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config/config.properties');
var Queue = require('kue').createQueue(
    {
        redis:{
            host: properties.get('REDIS_HOST'),
            port: properties.get('REDIS_PORT')
        }
    }
);
var genstats = require('genstats')
var prob = genstats.probability
var wilcoxon = genstats.wilcoxon
var quicksort = require('./quicksort')
var quicksortobj = require('./quicksortobj')
var fileutil = require('./fileutil')

var NUM_CODING_GENES_TO_SEND = 50
var NUM_NONCODING_GENES_TO_SEND = 50
var GENEDATA, COMPDATA, NUM_COMPS, BACKGROUND_MATRIX

// get location of GN files
var genenetworkFilePath = properties.get('GN_FILES_PATH');



var readData = function(callback) {
    //fileutil.readBinary('/data/genenetwork/files/169PCs.npy', function(err, data) {
    fileutil.readTXT(genenetworkFilePath+'files/31_G_QCD_ONLYCHR_NODUPL_DESEQ_LOG_COV_G_eigenvectors_307_genescompsstdnorm.txt', function(err, data) {
        if (err) return callback(err)
        GENEDATA = data
        COMPDATA = []
        for (var i = 0; i < GENEDATA[0].length; i++) {
            COMPDATA.push([])
            for (var j = 0; j < GENEDATA.length; j++) {
                COMPDATA[i].push(GENEDATA[j][i])
            }
        }
        NUM_COMPS = COMPDATA.length

        for (var i = 0; i < GENEDATA.length; i++) {
            genstats.standardNormalize(GENEDATA[i])
        }

        callback(null)
    })
}

var createBackgroundMatrix = function(backIndices) {
    BACKGROUND_MATRIX = []
    for (var c = 0; c < NUM_COMPS; c++) {
        BACKGROUND_MATRIX.push([])
        for (var i = 0; i < backIndices.length; i++) {
            BACKGROUND_MATRIX[c].push(COMPDATA[c][backIndices[i]])
        }
    }
}

var createComponentProfile = function(foreIndices, testType, excludeIndex) {
    var profile = []
    for (var c = 0; c < NUM_COMPS; c++) {
        var a1 = []
        for (var i = 0; i < foreIndices.length; i++) {
            if (excludeIndex === undefined || excludeIndex != i) {
                a1.push(COMPDATA[c][foreIndices[i]])
            }
        }
        if (testType == 'welch') {
            var welch = genstats.welch(a1, BACKGROUND_MATRIX[c])
            var z = prob.pToZ(welch.p)
            if (welch.t < 0) {
                z *= -1
            }
            profile.push(z)
            // if (excludeIndex === undefined) console.log(c + ' ' + z)
        } else {
            profile.push(0)
        }
    }
    console.log(new Date(), 'Component profile created')
    return profile
}

var predict = function(genes, numGenes, options, callback) {

    options = options || {}
    var foreIndices = quicksort(_.map(genes, function(gene) { return gene.index_ }))
    console.log(new Date(), 'Given genes sorted, numGenes:', numGenes)
    
    // var back = _.difference(_.map(allGenes, function(gene) { return gene.index_ }), foreIndices)
    // console.log('Sorting ' + back.length + ' genes')
    // var backIndices = quicksort(back)
    // console.log('Background genes sorted')
    var backIndices = []
    var curForeIndex = 0
    for (var i = 0; i < numGenes; i++) {
        if (i == foreIndices[curForeIndex]) {
            curForeIndex++
        } else {
            backIndices.push(i)
        }
    }

    var tstart = new Date()
    var done = 0
    var testType = options.testType.toLowerCase() || 'welch'

    createBackgroundMatrix(backIndices)
    var profile = createComponentProfile(foreIndices, testType)
    genstats.standardNormalize(profile)
    var allZ = []
    
    // first predict genes outside of the set
    var resultsOut = {}
    resultsOut.genes = []
    for (var i = 0; i < backIndices.length; i++) {
        // var gene = allGenes[backIndices[i]]
        var corr = genstats.correlationStdNorm(GENEDATA[backIndices[i]], profile)
        var p = prob.corrToP(corr, NUM_COMPS)
        var z = prob.pToZ(p)
        if (corr < 0) {
            z *= -1
        }
        allZ.push(z)
        // TODO arbitrary threshold
        if (p < 0.001) {
            resultsOut.genes.push({index_: backIndices[i], inset: false, corr: corr, p: p, z: z})
        }
        ++done
        // if (done % 10000 === 0 || done === numGenes - genes.length) {
        //     console.log(new Date(), done + ' genes predicted')
        //     quicksortobj(resultsOut, 'z')
        //     callback(null, {
        //         numDone: done,
        //         numTotal: numGenes - genes.length,
        //         //data: resultsOut.slice(-10000)
        //         data: resultsOut
        //     })
        //     resultsOut = []
        // }
    }

    console.log(new Date(), done + ' genes predicted')
    quicksortobj(resultsOut.genes, 'z')
    resultsOut.genes.reverse()
    
    // don't go for inset gene prediction and auc calculation with a lot of genes
    if (genes.length > 10) {
        resultsOut.auc = -1
        console.log(new Date(), 'not calculating auc (' + genes.length + ' genes)')
        return callback(null, {
            numDone: done,
            numTotal: numGenes - genes.length,
            data: resultsOut
        })
    } else {
        callback(null, {
            numDone: done,
            numTotal: numGenes - genes.length,
            data: resultsOut
        })
    }
    
    // predict genes inside of the set
    var resultsIn = {}
    resultsIn.genes = []
    var inZ = []
    for (var i = 0; i < foreIndices.length; i++) {
        //        var foreIndices_ = foreIndices.slice(0)
        //        foreIndices_.splice(i, 1)
        //        profile_ = createComponentProfile(foreIndices_, testType)
        profile_ = createComponentProfile(foreIndices, testType, i)
        genstats.standardNormalize(profile_)
        corr = genstats.correlationStdNorm(GENEDATA[foreIndices[i]], profile_)
        var p = prob.corrToP(corr, NUM_COMPS)
        var z = prob.pToZ(p)
        if (corr < 0) {
            z *= -1
        }
        if (p < 0.05) {
            resultsIn.genes.push({index_: foreIndices[i], inset: true, corr: corr, p: p, z: z})
        }
        allZ.push(z)
        inZ.push(z)
        ++done
    }

    console.log(new Date(), 'genes in set predicted')
    quicksortobj(resultsIn.genes, 'z')
    resultsIn.genes.reverse()
    var w = wilcoxon(inZ, null, allZ)
    console.log(new Date(), 'Wilcoxon AUC: ' + w.auc)
    resultsIn.auc = w.auc
    resultsIn.p = w.p
    callback(null, {numDone: genes.length, numTotal: genes.length, data: resultsIn})
}

readData(function(err) {
    if (err) {
        return console.log(err)
    }
    console.log(new Date(), 'Data read, ready to predict')
    Queue.process('geneprediction', function(job, done) {
        console.log(job.data.ip + '\tStarting gene prediction\t' + job.data.genes.length + ':' + job.data.geneOfInterest + '\t' + job.data.socketID)
        predict(job.data.genes, job.data.numGenes, {ip: job.data.ip, socketID: job.data.socketID, testType: 'welch'}, function(err, someResults) {
            if (err) {
                done(err)
            } else {
                job.progress(someResults.numDone, someResults.numTotal, someResults.data)
                if (someResults.data.auc) {
                    done()
                }
            }
        })
    })
})
