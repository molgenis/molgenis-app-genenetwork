var kue = require('kue')
var dbutil = require('../utils/dbutil')
var genedesc = require('../utils/genedesc')
var quicksortobj = require('../utils/quicksortobj')

var Queue = kue.createQueue() // this does not create a new queue, it's just redis access
var lastAnalysisRequest = null
var lastAnalysisResult = null

module.exports = function(req, res) {

    var db = req.body.db.toUpperCase()
    var pathways = dbutil.getPathways(db)
    if (!pathways) {
        res.send(400, 'Unknown gene set database: ' + req.body.db)
    }
    if (!req.body.genes && !req.params.id) {
        res.send(400, 'Resource id (genes) required')
    }
    
    var genesQ = req.body.genes

    var ip = req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
    
    sails.log.verbose(ip + '\tPathway analysis request\t' + db + ':' + genesQ.length)

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
            sails.sockets.emit(req.socket.id, 'pathwayanalysis.error', {
                pwaMessage: 'At least five genes are needed for pathway analysis'
            })
        } catch (e) {
            sails.log.warn('Could not send pathway analysis error to socket id: ' + req.socket.id)
        }
        return res.send(400, {
            status: 400,
            message: 'At least five genes are needed'
        })
    }

    var tstart = new Date()
    var job = Queue.create('pathwayanalysis', {
        ip: ip,
        socketID: req.socket.id,
        db: db,
        genes: geneObjs
    }).save(function(err) {
        if (err) {
            sails.log.error(err)
            return res.serverError()
        }
    })

    job
        .on('enqueue', function() {
            Queue.inactiveCount('pathwayanalysis', function(err, total) {
                try {
                    // assume analysis process is not responsive if more than x seconds have passed since last not completed request was made
                    // console.log((lastAnalysisResult - lastAnalysisRequest) + 'ms for previous analysis')
                    if (lastAnalysisResult - lastAnalysisRequest < 0 && new Date() - lastAnalysisRequest > 20000) {
                        sails.sockets.emit(req.socket.id, 'pathwayanalysis.error', {
                            pwaMessage: 'Unfortunately our analysis servers are not responding. We\'re working on it, please try again later.'
                        })
                        req.socket.broadcast.emit('pathwayanalysis.error', {
                            pwaMessage: 'Unfortunately our analysis servers are not responding. We\'re working on it, please try again later.'
                        })
                    } else {
                        sails.sockets.emit(req.socket.id, 'pathwayanalysis.queueEvent', {
                            db: db,
                            queueLength: total
                        })
                        req.socket.broadcast.emit('pathwayanalysis.queueEvent', {
                            queueLength: total
                        })
                    }
                } catch (e) {
                    sails.log.warn('Could not send pathway analysis enqueue event to socket id: ' + req.socket.id + ' (or broadcast it)')
                }
                lastAnalysisRequest = new Date()
            })
        })
        .on('progress', function(progress, someResults) {
            try {
                var results = []
                if (someResults) {
                    for (var i = 0, len = someResults.length; i < len; i++) {
                        results.push({
                            pathway: pathways[i],
                            p: someResults[i]
                        })
                    }
                    quicksortobj(results, 'p')
                }
                sails.sockets.emit(req.socket.id, 'pathwayanalysis.result', {
                    db: db,
                    availableDatabases: _.filter(dbutil.DBUTIL.databases, function(db) {
                        return db.inMemory === true
                    }),
                    progress: progress,
                    numGenes: geneObjs.length,
                    testType: 'wilcoxon',
                    pwaResults: results
                })
            } catch (e) {
                sails.log.warn('Could not send pathway analysis results to socket!' + e.name + ': ' + e.message + ': socket id: ' + req.socket.id)
            }
        })
        .on('failed', function() {
            sails.log.error('Pathway analysis failed!')
            sails.log.error(err)
            return res.serverError()
        })
        .on('complete', function(msg) {
            lastAnalysisResult = new Date()
            try {
                sails.sockets.emit(req.socket.id, 'pathwayanalysis.end', {
                    db: db,
                    time: Math.round((new Date() - tstart) / 10) / 100,
                    numTotal: pathways.length
                })
                Queue.inactiveCount('pathwayanalysis', function(err, total) {
                    req.socket.broadcast.emit('pathwayanalysis.queueEvent', {
                        queueLength: total
                    })
                })
            } catch (e) {
                sails.log.warn('Could not send pathway analysis completion status to socket id: ' + req.socket.id + ' (or broadcast it)')
            }
            return res.json({
                message: 'done'
            })
        })
}
