module.exports = function hasBodyParamDB(req, res, next) {
    if (!req.body.db) {
        return res.send(400, {status: 400, message: 'Body parameter \'db\' required'})
    } else {
        next()
    }
}
