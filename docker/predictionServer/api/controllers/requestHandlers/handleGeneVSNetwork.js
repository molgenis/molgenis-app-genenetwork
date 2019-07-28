var _ = require('lodash')
var genedesc = require('../utils/genedesc')
var dbutil = require('../utils/dbutil')

module.exports = function(req, res) {

    var geneIndex = +req.body.geneIndex
    var geneIndices = req.body.geneIndices

    // sails.log.debug('handleGeneVSNetwork', geneIndex, geneIndices[0])
    
    // with a normal request, geneIndices contains strings instead of numbers because of json serialization
    // with sockets, geneIndices are numbers
    var numGenes = genedesc.getNumGenes()
    if (!geneIndices || !_.isArray(geneIndices) || geneIndices.length == 0 || !_.isNumber(geneIndex) || geneIndex < 0 || geneIndex >= numGenes) {
        return res.badRequest()
    }
    var numOOB = _.reduce(geneIndices, function(oob, i) { return oob + (i < 0 || i >= numGenes) ? 1 : 0 }, 0)
    if (numOOB > 0) {
        return res.badRequest()
    }

    var gene = genedesc.get(geneIndex)
    dbutil.getGivenGenesCoregArrayForGene(gene, geneIndices, function(err, result) {
        if (err) {
            sails.log.error(err)
            sails.sockets.emit(req.socket.id, 'genevsnetwork.error', err.name)
            return err.name == 'NotFoundError' ? res.notFound() : res.serverError()
        }
        sails.sockets.emit(req.socket.id, 'genevsnetwork.result', {gene: gene, zScores: result})
        return res.json(result)
    })
}
