var _ = require('lodash')
var async = require('async')
var dom = require('domain').create()
var level = require('level')
var crypto = require('crypto')
var bs62 = require('base62')

var dbutil = require('../utils/dbutil')
var query2genes = require('../utils/query2genes')
var genedesc = require('../utils/genedesc')
var quicksortobj = require('../utils/quicksortobj')
var color = require('../../../assets/js/color')
var graphutil = require('../../../assets/js/graphutil')

var reqdb = level(sails.config.requestDBPath, {
    valueEncoding: 'json'
})

dom.on('error', function(err) {
    sails.log.error(err)
})

function getAllCorrelations(gene, options, callback) {

    if (!callback) {
        callback = options
        options = {}
    } else {
        options = options || {}
    }
    if (!callback || !_.isFunction(callback)) callback({name: 'ArgumentError', message: 'getAllCorrelations: The last argument has to be a callback function'})
    if (!_.isPlainObject(options)) callback({name: 'ArgumentError', message: 'getAllCorrelations: The second argument has to be an options object'})
    var limit = options.limit || sails.config.api.numGenesLimit || 20
    if (limit && _.isNumber(limit)) {
        limit = Math.min(sails.config.api.numGenesMax || 1000, limit)
    } else {
        callback({name: 'ArgumentError', message: 'getAllCorrelations: couldn\'t figure out a limit for genes'})
    }
    format = options.format || 'json'
    if (format == 'json') {
        dbutil.getCorrelationsJSON(gene, {limit: limit, verbose: options.verbose}, function(err, result) {
            if (err) {
                callback(err)
                //res.send(err.status, err)
            } else {
                //res.json(result)
                callback(null, result)
            }
        })
    } else {
        callback({name: 'ParameterError', message: 'Unsupported "format" parameter: ' + format})
        // res.send(400, "Unsupported 'format' parameter for one gene")
    }
}

function getNetwork(genes, options, callback) {

    if (!callback) {
        callback = options
        options = {}
    } else {
        options = options || {}
    }
    if (!callback || !_.isFunction(callback)) callback({name: 'ArgumentError', message: 'getAllCorrelations: The last argument has to be a callback function'})
    if (!_.isPlainObject(options)) callback({name: 'ArgumentError', message: 'getAllCorrelations: The second argument has to be an options object'})

    var ts = new Date()
    var threshold = options.threshold || sails.config.api.defaultCoregulationZScoreThreshold || 5
    dbutil.getCoregulationJSON(genes, threshold, {zScore: sails.config.api.includeGeneZScoresInCoregulationNetwork || false}, function(err, elements) {

        if (err) callback(err)
        sails.log.verbose((new Date() - ts) + 'ms getting coreg matrix')
        ts = new Date()

        var network = {}
        network.comment = sails.config.version.comment()
        network.elements = elements

        var finalThreshold = graphutil.sparsify(network, 10, threshold, 0.5)
        network.threshold = Math.round(100 * finalThreshold) / 100
        network.edgeValueType = 'Z-score'
        network.edgeValueScales = [[0, 12, 15], [0, -12, -15]]
        network.edgeColorScales = [['#ffffff', '#000000', '#ff3c00'], ['#ffffff', '#00a0d2', '#7a18ec']]
        
        var neighborLists = graphutil.neighborLists(network.elements.nodes, network.elements.edges)
        network.elements.groups = graphutil.connectedVsLone(network.elements.nodes, neighborLists)

        if (options.geneIdToGroupNums) {
            _.forEach(network.elements.nodes, function(node) {
                var indices = options.geneIdToGroupNums[node.data.id]
                if (indices != undefined) {
                    node.customGroups = []
                    node.customGroups.push.apply(node.customGroups, indices)//_.map(indices, function(index) { return index + network.elements.groups.length }))
                    // node.groups
                }
            })
            // var groupNumToGeneIds = _.invert(options.geneIdToGroupNums, true)
            var groupNumToGeneIds = {}
            _.forEach(options.geneIdToGroupNums, function(groupNums, geneId) {
                _.forEach(groupNums, function(groupNum) {
                    if (!groupNumToGeneIds[groupNum]) {
                        groupNumToGeneIds[groupNum] = []
                    }
                    groupNumToGeneIds[groupNum].push(geneId)
                })
            })
            network.elements.customGroups = []
            _.forEach(groupNumToGeneIds, function(geneIds, groupNum) {
                var groupName = options.groupNumToName && options.groupNumToName[groupNum]
                if (!groupName) {
                    groupName = geneIds.length === 1 ? genedesc.get(geneIds[0]).name : 'Group ' + groupNum
                }
                network.elements.customGroups.push({name: groupName, type: 'custom', index_: groupNum, nodes: geneIds})
                network.elements.groups.push({name: groupName, type: 'custom', index_: groupNum, nodes: geneIds})
            })
        }
        network.elements.groups.push({name: 'My selection', nodes: []})
            
        callback(null, network)
    })
}    

module.exports = function(req, res) {

    dom.run(function() {
        var format = (req.body && req.body.format.toLowerCase()) || (req.query.format && req.query.format.toLowerCase()) || 'json'
        var query = ((req.body && req.body.genes) || req.params.id).toUpperCase().trim().split('|')
        if (query.length > 2) {
            return res.badRequest()
        }
        async.waterfall([
            function(cb) {
                var ts = new Date()
                var groupNumToName = (query.length !== 2) ? null : _.zipObject(_.map(query[0].split(/[,;]+/), function(group) { return group.split('!') }))
                var geneQuery = query[query.length-1].split(/[\s,;]+/)
                query2genes(geneQuery, function(err, genes, geneIdToGroupNums) {
                    sails.log.verbose((new Date() - ts) + 'ms parsing genes, found ' + genes.length)
                    cb(err, genes, geneIdToGroupNums, groupNumToName)
                })
            },
            function(genes, geneIdToGroupNums, groupNumToName, cb) {
                var ts = new Date()
                if (genes.length === 0) {
                    console.log('trying ' + 'coregnetwork!' + req.body.genes)
                    reqdb.get('coregnetwork!' + req.body.genes, function(err, network) {
                        if (err) {
                            if (err.name == 'NotFoundError') {
                                sails.log.verbose('Network requested for previously unseen ' + genes.length + ' genes')
                                return cb({name: 'NotFoundError', message: 'No genes found'})
                            } else {
                                sails.log.error(err)
                                return cb(err)
                            }
                        } else {
                            sails.log.verbose((new Date() - ts) + 'ms getting previously created network for ' + genes.length + ' genes')
                            cb(null, network)
                        }})
                    // return cb({name: 'NotFoundError', message: 'No genes found'})
                } else if (genes.length === 1) {
                    getAllCorrelations(genes[0], {limit: req.query.limit, format: format, verbose: req.query.verbose}, function(err, result) {
                        sails.log.verbose((new Date() - ts) + 'ms getting correlations for ' + genes[0].name)
                        cb(err, result)
                    })
                } else {
                    if (format == 'json') {
                        dbutil.getPairWiseCorrelationsJSON(genes, function(err, result) {
                            cb(err, result)
                        })
                    } else if (format == 'network') {
                        var ensgs = _.map(genes, function(gene) { return gene.id })
                        var sha = crypto.createHash('sha1').update(ensgs.join(',')).digest('hex')
                        var vanity = bs62.encode(parseInt(sha.substring(0, 8), 16))
                        //TODO take into account custom coloring
                        reqdb.get('TODOcoregnetwork!' + vanity, function(err, network) {
                            if (err) {
                                if (err.name == 'NotFoundError') {
                                    sails.log.verbose('Network requested for previously unseen ' + genes.length + ' genes')
                                } else {
                                    sails.log.error(err)
                                }
                                getNetwork(genes, {geneIdToGroupNums: geneIdToGroupNums, groupNumToName: groupNumToName}, function(err, network) {
                                    if (err) {
                                        cb(err)
                                    } else {
                                        sails.log.verbose((new Date() - ts) + 'ms getting network for ' + genes.length + ' genes')
                                        // network.href = req.protocol + '://' + req.get('host') + req.originalUrl
                                        network.href = sails.config.version.coregNetworkUrl + vanity
                                        reqdb.put('coregnetwork!' + vanity, network, function(dberr) {
                                            if(dberr) sails.log.error(dberr)
                                        })
                                        cb(null, network)
                                    }
                                })
                            } else {
                                sails.log.verbose((new Date() - ts) + 'ms getting previously created network for ' + genes.length + ' genes')
                                cb(null, network)
                            }
                        })
                    } else {
                        cb({name: 'ParameterError', message: 'Unsupported "format" parameter: ' + format})
                    }
                }
            }],
                        function(err, result) {
                            if (err) {
                                sails.log.error(err)
                                if (err.name == 'NotFoundError' || err.status === 404) res.notFound()
                                else if (err.name == 'ParameterError') res.badRequest(err.message)
                                else res.serverError()
                            } else {
                                res.json(result)
                            }
                        })
    })
}
