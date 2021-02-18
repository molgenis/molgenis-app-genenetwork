var _ = require('lodash')
var fs = require('fs')
var async = require('async')

module.exports = function(req, res) {

    req.file('genelist').upload({maxBytes: 10000000}, function(err, files){
        if (err) {
            return res.serverError
        }
        var file = '.tmp/uploads/'+files[0].fd
        fs.readFile(file, 'utf8', function(err, data){
            if (err) {
                sails.log.error(err)
                // premature exit
                return res.serverError
            }
            data = data.trim().replace(/ /g, '')
            data = data.replace(/(\r\n|\n|\r|\t|\s|;)/g, ',')
            fs.unlink(file, function(err){
                if (err){
                    sails.log.error(err)
                    // premature exit
                    return res.serverError
                }
                else {
                    sails.log.info('deleted file ' + file)
                }
            })
            return res.json(data)
        })
    })
}
