var dbutil = require('../utils/dbutil')
// TODO to node_modules
var graphutil = require('../../../assets/js/graphutil')
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

    //TODO nwtwork format
    if (!req.query.format || req.query.format.toLowerCase() === 'json') {

        dbutil.getPairwiseCofunctionsJSON(genes, dbs, function(err, result) {
            if (err) {
                res.send(err.status, err)
            } else {
                res.json(result)
            }
        })

    } else {
        res.send(400, "Unsupported 'format' parameter")
    }
}
