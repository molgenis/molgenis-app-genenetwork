var _ = require('lodash')
var fs = require('fs')
var async = require('async')

module.exports = function(req, res) {

    req.file('vcffile').upload(function(err, files) {

        if (err) return res.serverError(err)
        if (files.length === 0) {
            return res.badRequest('No file uploaded')
        }
        
        fs.readfiles[0].fd
        
        console.log(file)
    })

    res.attachment('KidneyNetwork-Diagnosis.vcf')
    return res.send('jee')
    //return res.download(filenameOut, 'GeneNetwork-Diagnosis.vcf')
}
