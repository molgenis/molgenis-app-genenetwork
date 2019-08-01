var dbutil = require('../utils/dbutil')
var genedesc = require('../utils/genedesc')

module.exports = function(req, res) {

    if (!req.params.id) {
        return res.notFound()
    }

    var transcript = req.params.id
    sails.log.debug('getting transcript ' + transcript)
    dbutil.getTranscriptJSON(transcript, function(err, json) {
        if (err) {
            sails.log.debug('not got transcript bars')
            // handle not found and other errors differently
            res.notFound({
                status: 404,
                message: 'Transcript \'' + req.params.id + '\' not found'
            })
        } else {
            sails.log.debug('got transcript')
            res.json(json)
        }
    })
}
