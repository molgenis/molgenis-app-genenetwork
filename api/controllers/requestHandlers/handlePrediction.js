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
var dbutil = require('../utils/dbutil')
var genedesc = require('../utils/genedesc')
var quicksortobj = require('../utils/quicksortobj')

var isCoding = {
    'protein_coding': true,
    'IG_C_gene': true,
    'IG_D_gene': true,
    'IG_J_gene': true,
    'IG_V_gene': true,
    'TR_C_gene': true,
    'TR_J_gene': true,
    'TR_D_gene': true
}

module.exports = function(req, res) {

    // TODO only req.body
    var genesQ = req.body.genes || req.params.id.toUpperCase().trim().split(/[\s,;]+/)

    var ip = req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
    
    sails.log.verbose(ip + '\tGene prediction request\t' + genesQ.length)

    var geneObjs = []
    var ensgs = []
    for (var i = 0; i < genesQ.length; i++) {
        var gene = genedesc.get(genesQ[i])
        if (gene) {
            var ensg = gene.id
            if (ensgs.indexOf(ensg) < 0) {
                ensgs.push(ensg)
                geneObjs.push(gene)
            }
        }
    }

    if (geneObjs.length < 5) {
        try {
            sails.sockets.emit(req.socket.id, 'geneprediction.error', {
                gpMessage: 'At least five genes are needed for gene prediction'
            })
        } catch (e) {
            sails.log.warn('Could not send gene prediction error to socket id: ' + req.socket.id)
        }
        return res.send(400, {
            status: 400,
            message: 'At least five genes are needed'
        })
    }

    var totalNumGenes = genedesc.getNumGenes()
    var tstart = new Date()
    var job = Queue.create('geneprediction', {
        ip: ip,
        socketID: req.socket.id,
        genes: geneObjs,
        geneOfInterest: req.body.geneOfInterest,
        //allGenes: genedesc.getAll()
        numGenes: totalNumGenes,
    }).save(function(err) {
        if (err) {
            sails.log.error(err)
            return res.serverError()
        }
    })

    job
        .on('enqueue', function() {
            Queue.inactiveCount('geneprediction', function(err, total) {
                try {
                    sails.sockets.emit(req.socket.id, 'geneprediction.queueEvent', {
                        queueLength: total
                    })
                    req.socket.broadcast.emit('geneprediction.queueEvent', {
                        queueLength: total
                    })
                } catch (e) {
                    sails.log.warn('Could not send gene prediction enqueue status to socket id: ' + req.socket.id + ' (or broadcast it)')
                }
            })
        })
        .on('progress', function(progress, someResults) {
            // someResults.genes.splice(100, someResults.genes.length-100)
            _.each(someResults.genes, function(r) { r.gene = genedesc.get(r.index_) })
            var arr = []
            for (var i = 0; i < someResults.genes.length && arr.length < sails.config.api.predictedNumGenesToSend; i++) {
                arr.push(someResults.genes[i])
            }

            var gpMessage = null
            console.log('Received ' + someResults.genes.length + ' results')
            if (req.body.geneOfInterest) {
                //var geneObj = genedesc.get(req.body.geneOfInterest)
                console.log('Checking if ' + req.body.geneOfInterest + ' is among them')
                for (var i = 0; i < someResults.genes.length; i++) {
                    if (someResults.genes[i].gene.name == req.body.geneOfInterest.toUpperCase()) {
                        gpMessage = req.body.geneOfInterest.toUpperCase() + ' rank: ' + (i+1)
                        console.log(gpMessage)
                        break
                    }
                }
            }
            try {
                sails.sockets.emit(req.socket.id, 'geneprediction.result', {
                    gpStatus: {
                        progress: progress,
                        numGenes: geneObjs.length
                    },
                    gpResults: {
                        results: arr,
                        auc: someResults.auc
                    },
                    gpMessage: gpMessage
                })
            } catch (e) {
                sails.log.warn('Could not send gene prediction results to socket id: ' + req.socket.id)
            }
        })
        .on('failed', function(err) {
            sails.log.error('Gene prediction failed!')
            sails.log.error(err)
            return res.serverError()
        })
        .on('complete', function() {
            try {
                sails.sockets.emit(req.socket.id, 'geneprediction.end', {
                    gpMessage: 'Gene prediction finished',
                    time: Math.round((new Date() - tstart) / 10) / 100,
                    numTotal: totalNumGenes
                })
                Queue.inactiveCount('geneprediction', function(err, total) {
                    req.socket.broadcast.emit('geneprediction.queueEvent', {
                        queueLength: total
                    })
                })
            } catch (e) {
                sails.log.warn('Could not send gene prediction completion status to socket id: ' + req.socket.id + ' (or broadcast it): ' + e)
            }
            return res.json({
                message: 'done'
            })
        })
}
