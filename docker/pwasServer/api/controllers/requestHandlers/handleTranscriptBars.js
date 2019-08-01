var dbutil = require('../utils/dbutil')
var genedesc = require('../utils/genedesc')

module.exports = function(req, res) {

    if (!req.params.id) {
        return res.notFound()
    }

    var transcripts = req.params.id
    var gene = transcripts.split(',')[0]
    sails.log.debug('getting transcript bars for ' + gene)
    dbutil.getNewTranscriptBars(transcripts, function(err, json) {
        if (err) {
            sails.log.debug('not got transcripts for ' + gene)
            // handle not found and other errors differently
            res.notFound({
                status: 404,
                message: 'Transcript \'' + req.params.id + '\' not found'
            })
        } else {
            sails.log.debug('got transcript bars for ' + gene)
            res.json(json)
            
        }
    })
}
