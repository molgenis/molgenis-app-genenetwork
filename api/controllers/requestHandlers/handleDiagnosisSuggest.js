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
        index: 'diagnosis',
        q: 'name:' + query + '*'
    }, function(err, result) {
        if (err) {
            sails.log.warn(err)
            return res.serverError()
        } else {
            if (result.hits.total > 0) {
                sails.sockets.emit(req.socket.id,
                                   'suggestions',
                                   result.hits.hits
                                  )
                return res.ok() //json(result.hits.hits)
            } else {
                return res.notFound()
            }
            sails.log.debug('Suggest options for %s: %d', query, result && result.hits.total)
        }
    })
}
