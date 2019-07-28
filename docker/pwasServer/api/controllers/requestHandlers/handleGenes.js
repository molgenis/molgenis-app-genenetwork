var query2genes = require('../utils/query2genes');

module.exports = function(req, res) {

    var genes = query2genes(req.params.id.split(','), function (err, json, complete) {
        if (err) {
            res.send(err.status, err)
        } else {
            res.json(complete)
        }
    });
};
