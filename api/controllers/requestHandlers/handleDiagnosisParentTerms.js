const elasticsearch = require('elasticsearch');
const _ = require('lodash');

if (sails.config.useElastic === true) {
    var CLIENT = new elasticsearch.Client({
        host: sails.config.elasticHost,
        log: sails.config.elasticLogLevel
    })
}

module.exports = async function (req, res) {

    if (!CLIENT) {
        return res.notFound()
    }

    if (!req.body || !req.body.id || !req.socket) {
        return res.badRequest()
    }

    var allTerms = [];

    CLIENT.search({
        index: 'diagnosis',
        scroll: '30s',
        size: '10000',
        search_type: 'scan',
        query: {match_all : {}}
    }, function getMoreUntilDone(error, response) {
        response.hits.hits.forEach(function (term) {
            allTerms[term._id] = term._source ;
        });
        if (response.hits.total !== Object.keys(allTerms).length) {
            CLIENT.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        } else {
            doParentLookUp();
        }
    });

    function doParentLookUp() {

        var parentTerms = [];

        function getParents(termId, depth = 0) {
            var term = allTerms[termId];
            if (term.isSignificantTerm) {
                term.depth = depth;
                parentTerms.push(term);
            } else {
                depth++;
                _.forEach(term.parents, function (parent) {
                    getParents(parent, depth)
                });
            }
        }

        getParents(req.body.id);

        res.json(parentTerms);
    }

};
