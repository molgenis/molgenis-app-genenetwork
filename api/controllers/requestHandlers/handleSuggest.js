const { Client } = require('@elastic/elasticsearch')

if (sails.config.useElastic === true) {
    var CLIENT = new Client({
        node: sails.config.elasticHost
    })
}

module.exports = function(req, res) {

    if (!CLIENT) {
        return res.notFound()
    }

    if (!req.body || !req.body.q || !req.socket) {
        return res.badRequest()
    }
    
    var query = req.body.q;
    console.log(query)
    CLIENT.search({
        index: 'search',
        from: 0,
        size: 100,
        body: {
            query: {
                query_string : {
                    fields : ["name", "id"],
                    query: query.replace(/\:/g, '\\\:') + '*',
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
            console.log(result[0])
            sails.log.debug('Suggest options for %s: %d', query, result.hits.total);
            if (result.hits.total > 0) {
                return res.json(result.hits.hits)
            } else {
                return res.notFound()
            }
        }
    })

};
