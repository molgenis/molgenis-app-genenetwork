var handleGene = require('../requestHandlers/handleGene')
var handleGenes = require('../requestHandlers/handleGenes')
var handleTranscript = require('../requestHandlers/handleTranscript')
var handleTranscriptBars = require('../requestHandlers/handleTranscriptBars')
var handlePathway = require('../requestHandlers/handlePathway')
var handleCoregulation = require('../requestHandlers/handleCoregulation')
var handleCofunction = require('../requestHandlers/handleCofunction')
var handlePrioritization = require('../requestHandlers/handlePrioritization')
var handleGeneScores = require('../requestHandlers/handleGeneScores')
var handleSVG2PDF = require('../requestHandlers/handleSVG2PDF')
var handleTabdelim = require('../requestHandlers/handleTabdelim')
var handleEigentest = require('../requestHandlers/handleEigentest')
var handleVCF = require('../requestHandlers/handleVCF')
var handleFileUpload = require('../requestHandlers/handleFileUpload')

var handleTemp = require('../requestHandlers/handleTemp')


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

    genes: function (req, res) {
        try {
            handleGenes(req, res);
        } catch (e) {
            sails.log.error(e);
            res.serverError();
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

    transcriptBars: function(req, res) {
        sails.log.debug('transcript bars request')
        try {
            handleTranscriptBars(req, res)
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

    vcf: function(req, res) {

        try {
            handleVCF(req, res)
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
    },

    fileupload: function(req, res) {
        try {
            handleFileUpload(req, res)
        } catch (e) {
            sails.log.error(e)
            res.serverError()
        }
    }

//    pc: function(req, res) {
//        handlePC(req, res)
//    }
}
