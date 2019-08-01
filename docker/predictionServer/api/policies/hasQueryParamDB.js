module.exports = function hasQueryParamDB(req, res, next) {
    if (!req.query.db) {
        return res.send(400, {status: 400, message: 'Query parameter \'db\' required'})
    } else {
        next()
    }
}
