module.exports = function hasID(req, res, next) {
    if (!req.params.id) {
        return res.send(400, {status: 400, message: 'Resource id required'})
    } else {
        next()
    }
}
