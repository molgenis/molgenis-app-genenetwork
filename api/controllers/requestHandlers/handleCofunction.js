var dbutil = require('../utils/dbutil')
    // TODO to node_modules
var graphutil = require('../../../assets/js/graphutil')
var formatutil = require('../utils/formatutil')
var genedesc = require('../utils/genedesc')

module.exports = function(req, res) {

    var genesQ = req.params.id.toUpperCase().trim().split(/[\s,;]+/)
    var genes = []
    var geneColors = []
    var colors = sails.config.colors.getSecondaryColors()

    for (var i = 0; i < genesQ.length; i++) {
        var gene = genedesc.get(genesQ[i].trim())
        if (gene && genes.indexOf(gene) < 0) {
            genes.push(gene)
            if (genesQ[i].indexOf(':') > -1) {
                var givenColorIndex = Number(genesQ[i].substring(genesQ[i].indexOf(':') + 1))
                if (givenColorIndex < colors.length) {
                    geneColors.push(colors[givenColorIndex])
                } else {
                    geneColors.push(sails.config.colors.default_node)
                }
            } else {
                geneColors.push(sails.config.colors.default_node)
            }
        }
    }

    var dbs = req.query.db.trim().toUpperCase().split(/[\s,;]+/)

    if (genes.length === 1) {

        return res.json({
            todo: 'TODO single gene'
        })

    }

    if (genes.length > sails.config.api.maxNumGenesCofunction) {
        return res.send(400, {
            status: 400,
            message: 'Limit: ' + sails.config.api.maxNumGenesCofunction + ' genes'
        })
    }

    //TODO why are there two different ways of getting the same data
    if (!req.query.format || req.query.format.toLowerCase() === 'json') {

        dbutil.getPairwiseCofunctionsJSON(genes, dbs, function(err, result) {
            if (err) {
                res.send(err.status, err)
            } else {
                res.json(result)
            }
        })

        // TODO 'cytoscape' --> 'network'
    } else if (req.query.format.toLowerCase() === 'cytoscape') {

        dbutil.getCofunctionMatrix(genes, dbs, function(err, results) {

            var correlationThreshold = sails.config.api.defaultCofunctionCorrelationThreshold || 0.3
            var network = formatutil.cytoscape(genes, results, {
                correlate: false,
                correlationThreshold: correlationThreshold,
                geneColors: geneColors
            })

            var finalThreshold = graphutil.sparsify(network, 10, correlationThreshold)
            network.threshold = Math.round(100 * finalThreshold) / 100
            var neighborLists = graphutil.neighborLists(network.elements.nodes, network.elements.edges)
            var groups = graphutil.disconnectedSubgraphs(network.elements.nodes, neighborLists)
            network.elements.groups = groups

            network.href = req.protocol + '://' + req.get('host') + req.originalUrl
            return res.json(network)
        })
    } else {
        res.send(400, "Unsupported 'format' parameter")
    }
}