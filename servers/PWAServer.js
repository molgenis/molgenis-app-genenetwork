var _ = require('lodash')
var Queue = require('kue').createQueue()
var ttest = require('../stats/ttest')
var wilcoxonr = require('../stats/wilcoxonr')
var quicksort = require('../api/utils/quicksort')
var quicksortobj = require('../api/utils/quicksortobj')

var level = require('level')
var pathwayrankdb = level('/data/genenetwork/final/dbexternalranks_', {
    valueEncoding: 'binary'
})

Queue.process('pathwayanalysis', function(job, done) {
    console.log(new Date() + '\t' + job.data.ip + '\tStarting pathway analysis\t' + job.data.db + ':' + job.data.genes.length + '\t' + job.data.socketID)
    analyse(job.data.genes, job.data.db, job.data.pathways, {ip: job.data.ip, socketID: job.data.socketID, testType: 'wilcoxonr'}, function(someResults) {
        job.progress(someResults.numDone, someResults.numTotal, someResults.data)
//        console.log(job.data.pathways.length)
        if (someResults.numDone === job.data.pathways.length) {
            done()
        }
    })
})

var analyse = function(genes, dbname, pathways, options, batchDone) {

    options = options || {}
    var foreIndices = quicksort(_.map(genes, function(gene) { return gene.index_ }))
    
    var tstart = new Date()
    var done = 0
    var numPathways = pathways.length
    var results = []
    var testType = options.testType || 'wilcoxonr'

    pathwayrankdb.createReadStream({
        start: 'RNASEQ!PREDICTIONS!' + dbname.toUpperCase() + '!',
        end: 'RNASEQ!PREDICTIONS!' + dbname.toUpperCase() + '!~'
    })
        .on('data', function(d) {
            
            var ts = new Date()
            // var pathway = d.key.substring(d.key.indexOf('!') + 1).toUpperCase()
            var data = d.value
            var a1 = []
            var a2 = []

            var curFore = 0
            for (var i = 0; i < data.length / 2; i++) {
                if (curFore < foreIndices.length && i === foreIndices[curFore]) {
                    a1.push(data.readUInt16BE(i*2))
                    curFore++
                } else {
                    a2.push(data.readUInt16BE(i*2))
                }
            }

            // var total = []
            // for (var i = 0; i < data.length / 2; i++) {
            //     // if (allGenes[i].biotype === 'protein_coding') {
            //     total.push(data.readUInt16BE(i * 2))
            //         // }
            // }
            // var a2 = total.slice(0)
            // for (var i = 0; i < foreIndices.length; i++) {
            //     a1.push(total[foreIndices[i]])
            //     a2.splice(foreIndices[i], 1)
            // }

            var p = -1
            if (testType === 't') {
                var p = ttest.welch(a1, a2)
            } else if (testType === 'wilcoxonr') {
                var p = wilcoxonr(a1, a2).p
            } else {
                sails.log.warn('PWAServer: Unexpected test type: ' + testType)
            }

            var pathway = pathways[done]
	    results.push({
                pathway: pathway,
                p: p
	    })
            done++
            if (done % 100 === 0 || done === numPathways) {
                //console.log(pathway, pwObj.name)
                quicksortobj(results, 'p')
                batchDone({
                    numDone: done,
                    numTotal: numPathways,
                    data: results
                })
                results = []
            }
        })
        .on('end', function() {
            console.log(new Date() + '\t' + options.ip + '\tFinished pathway analysis\t' + dbname + ':' + genes.length + '(' + (new Date() - tstart) / 1000 + 's)\t' + options.socketID)
        })
}
