var _ = require('lodash')
var fs = require('fs')
var zlib = require('zlib')
var async = require('async')
var crypto = require('crypto')
var bs62 = require('base62')
var exec = require('child_process').exec

module.exports = function(req, res) {

    if (!req.body.data) {
        return res.badRequest()
    }

    var format = (req.body.format || 'pdf').toLowerCase()
    if (!_.includes(['pdf', 'png'], format)) {
        return res.badRequest()
    }
    
    var svg = req.body.data.replace('\n', '').replace('><', '>\n<') // split svg to two lines
    var sha = crypto.createHash('sha1').update(req.body.data).digest('hex')
    var vanity = bs62.encode(parseInt(sha.substring(0, 8), 16))
    
    var filenameSVG = sails.config.svgUploadDir + vanity + '.svg'
    var filenameOut = sails.config.svgUploadDir + vanity + '.' + format

    async.series([
        // function(callback) {
        //     console.log('gzipped length ' + req.body.data.length)
        //     console.log(req.body.data[0], req.body.data[1])
        //     fs.writeFile(filenameSVG + '.gz', req.body.data, {encoding: 'binary'}, function(err) {
        //         if (err) {
        //             return callback(err)
        //         }
        //         sails.log.debug('gzipped svg file written to ' + filenameSVG + '.gz')
        //         callback(null)
        //     })
        // },
        // function(callback) {
        //     zlib.deflate(req.body.data, function(err, buffer) {
        //         if (err) {
        //             return callback(err)
        //         }
        //         svg = buffer.toString()
        //         callback(null)
        //     })
        // },
        // inject font to the svg
        function(callback) {

            svg = svg.replace('\n', '').replace('><', '>\n<') // split svg to two lines
            fs.readFile(sails.config.networkFontFile, function(err, data) {
                if (err) {
                    return callback(err)
                }
                split = svg.split('\n')
                svg = split[0] + '\n<defs>\n' + data + '</defs>\n' + split[1]
                callback(null)
            })
        },
        // write the svg to a file
        function(callback) {
            fs.writeFile(filenameSVG, svg, function(err) {
                if (err) {
                    return callback(err)
                }
                sails.log.debug('svg file written to ' + filenameSVG)
                callback(null)
            })
        },
        // convert svg to pdf
        function(callback) {
            var opts = (format === 'pdf') ? '-f pdf' : '-f png -z 2'
            exec('rsvg-convert ' + opts + ' -o ' + filenameOut + ' ' + filenameSVG, function(err, stdout, stderr) {
                if (err) {
                    window.alert('rsvg-convert ' + opts + ' -o ' + filenameOut + ' ' + filenameSVG)
                    window.alert(err.toString())
                    return callback(err)
                } else {
                    sails.log.debug(format + ' file written to ' + filenameOut)
                    //res.setHeader('Content-type', 'application/pdf')
                    callback(null)
                }
            })
        }
    ],
                 // finally send pdf as attachment
                 function(err) {
                     if (err) {
                         sails.log.error(err)
                         return res.serverError()
                     }
                     return res.download(filenameOut, 'MetaBrainNetwork-'  + vanity + '.' + format)
                 }
                )
};
