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
    }, (err, { result, statusCode, headers, warnings }) => {
        if (err) {
            sails.log.warn(err);
            return res.serverError()
        } else {
            sails.log.debug('Suggest options for %s: %d', query, result.hits.total.value);
            if (result.hits.total.value > 0) {
                return res.json(result.hits.hits)
            } else {
                return res.notFound()
            }
        }
    })
};
