var elasticsearch = require('elasticsearch');

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
    
    var query = req.body.q.replace(/\:/g, '\\\:') + '*';

    CLIENT.search({
        index: 'diagnosis',
        from: 0,
        size: 100,
        body: {
            query: {
                query_string : {
                    fields : ["name", "id"],
                    query: query,
                    analyze_wildcard: true,
                    default_operator: 'AND'
                }
            }
        }
    }, function(err, result) {
        if (err) {
            sails.log.warn(err);
            return res.serverError()
        } else {
            sails.log.debug('Suggest options for %s: %d', query, result.hits.total);
            if (result.hits.total > 0) {
                return res.json(result.hits.hits)
            } else {
                return res.notFound()
            }
        }
    })
};
