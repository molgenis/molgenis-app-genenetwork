var elasticsearch = require('elasticsearch')
// var memwatch = require('memwatch')
var request = require('request')
var level = require('level')
var dbutil = require('./utils/dbutil')

var handleGene = require('./requestHandlers/handleGene')
var handleTranscript = require('./requestHandlers/handleTranscript')
var handlePathway = require('./requestHandlers/handlePathway')
var handleCoregulation = require('./requestHandlers/handleCoregulation')
var handleCofunction = require('./requestHandlers/handleCofunction')
var handlePrioritization = require('./requestHandlers/handlePrioritization')
var handleGeneScores = require('./requestHandlers/handleGeneScores')
var handleSVG2PDF = require('./requestHandlers/handleSVG2PDF')
var handleTabdelim = require('./requestHandlers/handleTabdelim')
//var handleSVG2PDF = require('./requestHandlers/handleUpload')
var handleEigentest = require('./requestHandlers/handleEigentest')
//var handlePC = require('./requestHandlers/handlePC')

var handleTemp = require('./requestHandlers/handleTemp')

// memwatch.on('leak', function(info) {
//     sails.log.warn('memwatch: leak: ' + info.growth + ': ' + info.reason)
//     sails.log.verbose(info)
// })

// memwatch.on('stats', function(stats) {
//     sails.log.verbose('memwatch: usage trend: ' + stats.usage_trend)
//     sails.log.verbose(stats)
// })

module.exports = {

    doc: function(req, res) {
        res.view('apidoc')
    },

    gene: function(req, res) {
        try {
            handleGene(req, res)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    },

    transcript: function(req, res) {
        sails.log.debug('transcript request')
        try {
            handleTranscript(req, res)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    },

    pathway: function(req, res) {
        try {
            handlePathway(req, res)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    },

    coregulation: function(req, res) {
        try {
            handleCoregulation(req, res)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    },

    cofunction: function(req, res) {
        try {
            handleCofunction(req, res)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    },

    prioritization: function(req, res) {
        try {
            handlePrioritization(req, res)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    },

    genescores: function(req, res) {
        handleGeneScores(req, res)
    },
    
    svg2pdf: function(req, res) {
        try {
            handleSVG2PDF(req, res)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
//        handleSVG2PDF.upload(req, res)
    },

    tabdelim: function(req, res) {
        handleTabdelim(req, res)
    },

    eigentest: function(req, res) {
        try {
            handleEigentest(req, res, correlationdb, geneIDs)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    },

    hier: function(req, res) {
        try {
            res.view('hier')
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    },

    temp: function(req, res) {
        handleTemp(req, res)
    }

//    pc: function(req, res) {
//        handlePC(req, res)
//    }
}
