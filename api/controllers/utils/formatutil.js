var stats = require('../../../stats/stats')
var prob = require('../../../stats/probability')
var genedesc = require('./genedesc')

var exp = module.exports

exp.cytoscape = function(genes, values, options) {

    if (!genes || !values || !options) {
        throw {
            name: 'ArgumentError',
            message: "'cytoscape' requires three arguments ('genes', 'values' and 'options')"
        }
    }

    var ts = new Date()
    var network = {}
    var nodes = []
    var edges = []
    var genesIn = {}

    for (var g1 = 0; g1 < genes.length; g1++) {
        for (var g2 = g1 + 1; g2 < genes.length; g2++) {

            var corr = null
            if (options.correlate) {
                corr = stats.correlation(values[g1], values[g2])
            } else if (options.indices) {
                corr = values[g1][options.indices[g2]]
            } else {
                corr = values[g1][g2]
            }

            //            sails.log.debug(genes[g1].name + '/' + genes[g2].name + ' correlation: ' + corr)
            if (!options.correlationThreshold || corr > options.correlationThreshold) {
                if (!genesIn[g1]) {
                    nodes.push(createNode(genes[g1], {color: options.geneColors && options.geneColors[g2], pValue: options.pValues && options.pValues[g2]}))
                    genesIn[g1] = true
                }
                if (!genesIn[g2]) {
                    nodes.push(createNode(genes[g2], {color: options.geneColors && options.geneColors[g2], pValue: options.pValues && options.pValues[g2]}))
                    genesIn[g2] = true
                }
                edges.push({
                    data: {
                        source: genes[g1].id,
                        target: genes[g2].id,
                        color: sails.config.colors.cytoscape_edge,
                        weight: Number(corr.toPrecision(4))
                    }
                })
            }
        }
    }

    network.comment = sails.config.version.comment()
    network.elements = {
        nodes: nodes,
        edges: edges
    }

    sails.log.verbose((new Date() - ts) + 'ms formatutils.cytoscape')

    return network
}

function createNode(gene, options) {
    var node = {
        data: gene
    }
    node.data.width = 50 + node.data.name.length * 10
    if (options && options.color) {
        node.data.color = options.color
    } else {
        node.data.color = sails.config.colors[node.data.biotype]
        if (!node.data.color) {
            node.data.color = sails.config.colors.default_biotype
        }
    }
    if (options && options.pValue) {
        node.data.pValue = options.pValue
        node.data.zScore = prob.pToZ(options.pValue / 2)
    }
    return node
}