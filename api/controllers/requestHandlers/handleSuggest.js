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
    
    CLIENT.suggest({
        index: '',
        body: {
            molestorSuggester: {
                text: query,
                completion: {
                    field: 'suggest',
                    size: 100000
                }
            }
        }
    }, function(err, result) {
        if (err) {
            sails.log.warn(err)
            return res.serverError()
        } else {
            // TODO remove if
            if (req.socket && req.socket.id) {
                sails.sockets.emit(req.socket.id, 'suggestions', {
                    options: result.molestorSuggester[0].options
                    //options: []
                })
            }
            sails.log.debug('Suggest options for %s: %d', query, result.molestorSuggester[0].options.length)
            console.log(result.molestorSuggester[0])
            return res.json(result.molestorSuggester[0].options)
        }
    })
}
