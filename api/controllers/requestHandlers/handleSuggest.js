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
    // console.log(query)
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
    }, (err, { body, statusCode, headers, warnings }) => {
        if (err) {
            sails.log.warn(err);
            return res.serverError()
        } else {
            // console.log("body: "+body)
            // console.log(statusCode)
            // console.log(headers)
            // console.log(warnings)
            // console.log("body: "+body)
            // // console.log(body.hits.hits)
            // console.log(body.hits.total.value)
            sails.log.debug('Suggest options for %s: %d', query, body.hits.total.value);
            if (body.hits.total.value > 0) {
                return res.json(body.hits.hits)
            } else {
                return res.notFound()
            }
        }
    })
  // 
      // function(err, result) {
};
