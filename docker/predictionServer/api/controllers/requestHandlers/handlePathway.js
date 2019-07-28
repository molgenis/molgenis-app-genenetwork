var dbutil = require('../utils/dbutil');

module.exports = function(req, res) {

    if (!req.params.id) {
        return res.json({
            todo: 'TODO pathway list'
        })
    } else {
        var pathwayObj = dbutil.pathwayObject(req.params.id);
        if (!pathwayObj) {
            return res.notFound({
                status: 404,
                message: 'Pathway \'' + req.params.id + '\' not found'
            })
        }
        sails.log.debug('getting data for ' + pathwayObj.name);
        dbutil.getPathwayJSON(pathwayObj, req, function(err, json) {
            if (err) {
                return res.send(err.status, err)
            } else {
                return res.json(json)
            }
        })
    }

};