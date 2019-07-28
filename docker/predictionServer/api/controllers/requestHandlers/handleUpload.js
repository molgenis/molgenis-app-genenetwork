var fs = require('fs')
var zlib = require('zlib')
var async = require('async')
var crypto = require('crypto')
var exec = require('child_process').exec

module.exports = {

    upload: function(req, res) {
        req.file('network.gz').upload({maxBytes: 10000000}, function whenDone(err, files) {
            console.log('uploaded')
            console.log(files)
            console.log(err)
        })
    }
}
