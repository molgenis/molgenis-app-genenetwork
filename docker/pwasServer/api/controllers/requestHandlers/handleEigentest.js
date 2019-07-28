var dbutil = require('../utils/dbutil')
var genedesc = require('../utils/genedesc')
var numeric = require('numeric')

module.exports = function(req, res, corrdb, geneIDs) {

    var genesQ = req.params.id.toUpperCase().trim().split(/[\s,;]+/)
    var genes = genedesc.getArray(genesQ)

    if (genes.length < 5) {

        res.send(400, {
            status: 400,
            message: 'At least five genes are needed.'
        })

    } else {

        dbutil.getCorrelationMatrix(corrdb, genes, function(corrMatrix) {

            var eigen = numeric.eig(corrMatrix)
            var eigenvalues = eigen.lambda.x

            var entropy = 0
            for (var i = 0; i < eigenvalues.length; i++) {
                console.log(eigenvalues[i] * Math.log(eigenvalues[i]))
                entropy -= eigenvalues[i] * Math.log(eigenvalues[i])
            }

            res.json({
                entropy: entropy,
                eigenvalues: eigenvalues
            })
        })

    }
}