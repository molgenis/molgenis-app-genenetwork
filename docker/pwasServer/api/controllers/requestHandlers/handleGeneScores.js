var _ = require('lodash')
var dbutil = require('../utils/dbutil')

module.exports = function(req, res) {

    //console.log(req.body.term)
    //console.log(typeof req.body.term)
    
    var term = req.body.term
    var geneIndices = req.body.geneIndices

    // here geneIndices contains strings instead of numbers because of json serialization
    // with sockets they would be numbers
    if (!geneIndices || !_.isArray(geneIndices) || geneIndices.length == 0 || !term || !term.database || !term.id) {
        return res.badRequest()
    }

    async.series([
        function(cb) {
            dbutil.getGivenGenesAnnotationArrayForTerm(term, geneIndices, function(err, result) {
                cb(err, result)
            })
        },
        function(cb) {
            dbutil.getGivenGenesZScoreArrayForTerm(term, geneIndices, function(err, result) {
                cb(err, result)
            })
        }
    ], function(err, results) {
        if (err) {
            sails.log.error(err)
            return err.name == 'NotFoundError' ? res.notFound() : res.serverError()
        }
        var r = {annotations: results[0], zScores: results[1]}
        sails.sockets.emit(req.socket.id, 'genescores.result', r)
        return res.json(r)
    })
}
