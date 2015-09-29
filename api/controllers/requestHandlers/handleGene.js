var dbutil = require('../utils/dbutil')
var genedesc = require('../utils/genedesc')

module.exports = function(req, res) {

    if (!req.params.id) {
        res.header('Content-Type', 'application/json')
        return res.send(genedesc.getAllJSONStr())
    }

    var gene = genedesc.get(req.params.id)
    if (gene) {
        dbutil.getGeneJSON(gene, req.query.db, req, function(err, json) {
            if (err) {
                res.send(err.status, err)
            } else {
                res.json(json)
            }
        })
    } else {
        res.notFound({
            status: 404,
            message: 'Gene \'' + req.params.id + '\' not found'
        })
    }
}
