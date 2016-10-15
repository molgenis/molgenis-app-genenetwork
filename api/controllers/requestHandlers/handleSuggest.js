var elasticsearch = require('elasticsearch')

if (sails.config.useElastic === true) {
    var CLIENT = new elasticsearch.Client({
        host: sails.config.elasticHost,
        log: sails.config.elasticLogLevel
    })
}

module.exports = function(req, res) {

    if (!CLIENT) {
        return res.notFound()
    }

    if (!req.body || !req.body.q || !req.socket) {
        return res.badRequest()
    }

    var query = req.body.q

    CLIENT.search({
        index: 'search',
        from: 0,
        size: 100,
        q: 'name:' + query.replace(/\:/g, '\:') + '*'
    }, function(err, result) {
        if (err) {
            sails.log.warn(err)
            return res.serverError()
        } else {
            sails.log.debug('Suggest options for %s: %d', query, result.hits.total)
            // sails.sockets.emit(req.socket.id, 'suggestions', result.hits.hits)
            if (result.hits.total > 0) {
                return res.json(result.hits.hits)
            } else {
                return res.notFound()
            }
        }
    })
}
