var handlePathwayAnalysis = require('../requestHandlers/handlePathwayAnalysis');
var handlePrediction = require('../requestHandlers/handlePrediction');
var handleNetwork = require('../requestHandlers/handleNetwork');
var handleGeneScores = require('../requestHandlers/handleGeneScores');
var handleGeneVSNetwork = require('../requestHandlers/handleGeneVSNetwork');
var handleSuggest = require('../requestHandlers/handleSuggest');
var handleDiagnosisSuggest = require('../requestHandlers/handleDiagnosisSuggest');
var handleDiagnosisParentTerms = require('../requestHandlers/handleDiagnosisParentTerms');
//var handlePC = require('./requestHandlers/handlePC')

module.exports = {

    pathwayanalysis: function(req, res) {
        handlePathwayAnalysis(req, res)
    },

    geneprediction: function(req, res) {
        handlePrediction(req, res)
    },

    genescores: function(req, res) {
        handleGeneScores(req, res)
    },

    genevsnetwork: function(req, res) {
        handleGeneVSNetwork(req, res)
    },

    network: function(req, res) {
        handleNetwork(req, res)
    },

    suggest: function(req, res) {
        handleSuggest(req, res)
    },

    diagnosisSuggest: function(req, res) {
        handleDiagnosisSuggest(req, res)
    },

    diagnosisParentTerms: function(req, res) {
        handleDiagnosisParentTerms(req, res)
    }
    // pc: function(req, res) {

    //     console.log(req.socket)
    //     handlePC(req, res)
    // }

};
