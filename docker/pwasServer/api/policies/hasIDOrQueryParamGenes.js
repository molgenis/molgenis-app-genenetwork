module.exports = function hasIDOrQueryParamGenes(req, res, next) {
    if (!(req.params.id || req.query.genes)) {
        return res.send(400, {status: 400, message: 'Resource id required'})
    } else {
        next()
    }
}
