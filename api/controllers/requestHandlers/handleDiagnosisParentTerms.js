const elasticsearch = require('elasticsearch');
const _ = require('lodash');

if (sails.config.useElastic === true) {
    var CLIENT = new elasticsearch.Client({
        host: sails.config.elasticHost,
        log: sails.config.elasticLogLevel
    })
}

module.exports = function (req, res) {

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
        query: {match_all: {}}
    }, getMoreUntilDone(error, response));
    // }, function getMoreUntilDone(error, response) {
        // response.hits.hits.forEach(function (term) {
        //     allTerms[term._id] = term._source ;
        // });
        // if (response.hits.total !== Object.keys(allTerms).length) {
        //     CLIENT.scroll({
        //         scrollId: response._scroll_id,
        //         scroll: '30s'
        //     }, getMoreUntilDone);
        // } else {
        //     doParentLookUp();
        // }
        // if('hits' in response && 'hits' in response.hits){
        //     handleHits(response);
        // }
        // else{
        //     // TODO what to do when these are undefined?
        // }
    // });

    function getMoreUntilDone(error, response){
        if('hits' in response && 'hits' in response.hits){
            handleHits(response);
        }
        else{
            // TODO what to do when these are undefined?
        }
    }

    function handleHits(response){
        response.hits.hits.forEach(function (term) {
            allTerms[term._id] = term._source ;
        });
        if (response.hits.total !== Object.keys(allTerms).length) {
            CLIENT.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        }
        else {
            doParentLookUp();
        }
    }

    function doParentLookUp() {

        var parentTerms = [];

        function getParents(termId) {
            var term = allTerms[termId];
            if (term.isSignificantTerm) {
                term.depth = 0;
                parentTerms.push(term);
            } else {
                _.forEach(term.parents, function (parent) {
                    getParents(parent)
                });
            }
        }

        getParents(req.body.id);

        res.json(parentTerms);
    }

};
