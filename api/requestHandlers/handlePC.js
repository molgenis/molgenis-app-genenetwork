var fs = require('fs')
var _ = require('lodash')
var level = require('level')
var dbutil = require('../utils/dbutil')

var pcdata = null
fs.readFile('/data/genenetwork/datafiles/expression_table.genelevel.v71.htseq.QuantileNormalized.Log2Transformed.ProbesCentered.SamplesZTransformed.CovariatesRemoved.PCAOverSamplesEigenvalues.121Components.txt', 'utf8', function(err, data) {
    if (err) {
        throw err
    } else {
        var lines = data.split(/\r?\n/)
        lines.splice(0, 1) // header off
        if (_.last(lines) === '') {
            lines.splice(lines.length - 1, 1)
        }
        pcdata = lines.map(function(line) {
            var split = line.split('\t')
            return {
                index: +split[0],
                ev: +split[1],
                expvar: +split[2],
                cumexpvar: +split[3]
            }
        })
    }
})

module.exports = function(req, res) {

    if (!req.params.id) {
        return res.json(pcdata)
    } else {
        var pc = +req.params.id
        if (_.isNumber(pc)) {
            dbutil.getPC(pc, function(err, data) {
                if (err) {
                    return res.send(err.status, err)
                } else {
                    // sails.sockets.emit(req.socket.id, 'pc.pcscores', {
                    //     pc: pc,
                    //     data: data
                    // })
                    // return res.json({
                    //     message: 'done'
                    // })
                    var arr = []
                    for (var i = 0; i < data.length / 4; i++) {
                        arr.push(data.readFloatBE(i * 4))
                    }
                    return res.json({index: pc, data: arr})
                }
            })
        } else {
            return res.send(200, {
                status: 200,
                message: 'Id must be a number'
            })
        }
    }
}