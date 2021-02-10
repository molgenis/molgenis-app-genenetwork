var _ = require('lodash');
var fs = require('fs');
var async = require('async');
var genedesc = require('../utils/genedesc');
var dbutil = require('../utils/dbutil');
var getprioritizedgenes = require('../utils/getprioritizedgenes');
var mim2gene = require('../utils/mim2gene');

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString();
    var dd  = this.getDate().toString();
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0])
};

module.exports = function(req, res) {

    if (req.body.what === 'pwa' && req.body.data && req.body.db && req.body.testType) {

        var geneIds = JSON.parse(req.body.genes);
        var geneNames = _.map(geneIds, function(geneId) { var gene = genedesc.get(geneId); return gene ? gene.name : 'unknown' });
        
        var geneSets = JSON.parse(req.body.data);
        var db = req.body.db;
        var testType = req.body.testType;

        var rows = [];
        rows.push('# ' + sails.config.version.comment());
        rows.push('#');
        rows.push('# Gene set analysis results');
        rows.push('# Downloaded ' + new Date().yyyymmdd());
        rows.push('#');
        rows.push('# Gene set name: ' + req.body.name);
        rows.push('# Number of genes: ' + geneIds.length);
        rows.push('# Gene names: ' + geneNames.join(','));
        rows.push('# Gene ids: ' + geneIds.join(','));
        rows.push('# Database: ' + db);
        rows.push('# Test type: ' + testType);
        rows.push('#');
        rows.push('gene_set_id\tgene_set_name\tp-value');
        rows.push.apply(rows, _.map(geneSets, function(geneSet) { return geneSet.pathway.id + '\t' + geneSet.pathway.name + '\t' + geneSet.p }));

        res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-GeneSetAnalysis-' + geneIds.length + '-Genes.txt');
        res.setHeader('Content-type', 'text/plain');
        res.charset = 'UTF-8';
        res.write(rows.join('\n'));

        return res.end()
        
    } else if (req.body.what === 'prediction' && req.body.data && req.body.name) {

        var geneIds = JSON.parse(req.body.genes);
        var geneNames = _.map(geneIds, function(geneId) { var gene = genedesc.get(geneId); return gene ? gene.name : 'unknown' });

        var data = JSON.parse(req.body.data);

        var rows = [];
        rows.push('# ' + sails.config.version.comment());
        rows.push('#');
        rows.push('# Gene prediction results');
        rows.push('# Downloaded ' + new Date().yyyymmdd());
        rows.push('#');
        rows.push('# Gene set name: ' + req.body.name);
        rows.push('# Number of genes: ' + geneIds.length);
        rows.push('# Gene names: ' + geneNames.join(','));
        rows.push('# Gene ids: ' + geneIds.join(','));
        rows.push('#');
        rows.push('gene_id\tgene_name\tp-value');
        for (var i = 0; i < data.length; i++) {
            var str = data[i].gene.id + '\t' + data[i].gene.name + '\t' + data[i].p;
            rows.push(str)
        }

        res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-GenePrediction-' + geneIds.length + '-Genes.txt');
        res.setHeader('Content-type', 'text/plain');
        res.charset = 'UTF-8';
        res.write(rows.join('\n'));

        return res.end()
        
    } else if (req.body.what === 'groups' && req.body.groups) {

        var geneIds = JSON.parse(req.body.genes);
        var geneNames = _.map(geneIds, function(geneId) { var gene = genedesc.get(geneId); return gene ? gene.name : 'unknown' });

        var groups = JSON.parse(req.body.groups);
        
        var rows = [];
        rows.push('# ' + sails.config.version.comment());
        rows.push('#');
        rows.push('# Gene list');
        rows.push('# Downloaded ' + new Date().yyyymmdd());
        rows.push('#');
        rows.push('# Number of genes: ' + geneIds.length);
        rows.push('#');
        rows.push('gene_id\tgene_name\tcluster');
        var genesIncluded = false;
        _.forEach(groups, function(group) {
            if (group.type === 'cluster') {
                rows.push.apply(rows, _.map(group.nodes, function(node) {
                    return node + '\t' + ((genedesc.get(node) && genedesc.get(node).name) || 'unknown') + '\t' + group.name
                }));
                genesIncluded = true
            }
        });
        
        if (!genesIncluded) {
            rows.push.apply(rows, _.map(groups[0].nodes, function(node) {
                return node + '\t' + ((genedesc.get(node) && genedesc.get(node).name) || 'unknown') + '\tnone'
            }))
        }

        res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-GeneList-' + geneIds.length + '-Genes.txt');
        res.setHeader('Content-type', 'text/plain');
        res.charset = 'UTF-8';
        res.write(rows.join('\n'));

        return res.end()
        
    } else if (req.body.what === 'termprediction') {

        var pathwayObj = dbutil.pathwayObject(req.body.termId);

        var rows = [];
        rows.push('# ' + sails.config.version.comment());
        rows.push('#');
        rows.push('# Gene term predictions');
        rows.push('# Downloaded ' + new Date().yyyymmdd());
        rows.push('#');
        rows.push('# Gene set name: ' + req.body.termId);
        rows.push('# Database: ' + req.body.db);
        rows.push('#');
        rows.push('gene_id\tgene_name\tp-value\tz-score');

        dbutil.getPathwayPredictionsJSON(pathwayObj, function (err, json) {
            _.forEach(json, function(prediction) {
                rows.push(prediction.gene.id + '\t' + prediction.gene.name + '\t' + prediction.pValue + '\t' + prediction.zScore);
            });
            res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-' + req.body.termId + '-GenePrediction.txt');
            res.setHeader('Content-type', 'text/plain');
            res.charset = 'UTF-8';
            res.write(rows.join('\n'));

            return res.end()
        });
        
    } else if (req.body.what === 'geneprediction' && req.body.geneId && req.body.db) {
        var gene = genedesc.get(req.body.geneId);
        var geneName = gene && gene.name;
        var rows = [];
        rows.push('# ' + sails.config.version.comment());

        if (req.body.type === 'prediction'){
            rows.push('#');
            rows.push('# Gene function predictions');
            rows.push('# Downloaded ' + new Date().yyyymmdd());
            rows.push('#');
            rows.push('# Gene name: ' + geneName);
            rows.push('# Gene id: ' + req.body.geneId);
            rows.push('# Database: ' + req.body.db);
            rows.push('#');
            rows.push('term_id\tterm_name\tz-score\tannotated');
            dbutil.getGeneJSON(gene, req.body.db, {query: {verbose: 'true', array: true}}, function(err, json) {
                if (err) {
                    res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-' + geneName + '-' + req.body.db + '.txt');
                    res.setHeader('Content-type', 'text/plain');
                    res.charset = 'UTF-8';
                    res.write(rows.join('\n'));
                    return res.end()
                } else {
                    var predictions = json.pathways.predicted;
                    for (var i = 0; i < predictions.length; i++){
                        //TODO add annotated
                        rows.push(predictions[i].term.id + '\t' + predictions[i].term.name + '\t' + predictions[i].zScore)
                    }
                }
                res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-' + geneName + '-' + req.body.db + '.txt');
                res.setHeader('Content-type', 'text/plain');
                res.charset = 'UTF-8';
                res.write(rows.join('\n'));
                return res.end()
            })
            // for (var i = 0; i < predictions.length; i++) {
            //     rows.push(predictions[i].id + '\t' + predictions[i].name + '\t' + predictions[i].pValue + '\t' + predictions[i].zScore + '\t' + predictions[i].annotated)
            // }
            
        } else if (req.body.type == 'similar'){
            rows.push('#');
            rows.push('# Co-regulated genes');
            rows.push('# Downloaded ' + new Date().yyyymmdd());
            rows.push('#');
            rows.push('# Gene name: ' + geneName);
            rows.push('# Gene id: ' + req.body.geneId);
            rows.push('#');
            rows.push('gene_id\tgene_name\tp-value');
            dbutil.getCorrelationsJSON(gene, {limit: sails.config.api.numGenesTotal - 2, verbose: false}, function(err, result) {
                for (var i = 0; i < result.data.length; i++) {
                    if (result.data[i]) {
                        rows.push(result.data[i].gene + '\t' + genedesc.get(result.data[i].gene).name + '\t' + result.data[i].pValue)
                    } else {
                        rows.push("EMPTY RECORD")
                    }
                }
                res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-' + geneName + '-' + req.body.db + '.txt');
                res.setHeader('Content-type', 'text/plain');
                res.charset = 'UTF-8';
                res.write(rows.join('\n'));
                return res.end()
            })

        } else {
            var tissues = JSON.parse(req.body.tissues);
            rows.push('#');
            rows.push('# Tissue-specific expression');
            rows.push('# Downloaded ' + new Date().yyyymmdd());
            rows.push('#');
            rows.push('# Gene name: ' + geneName);
            rows.push('# Gene id: ' + req.body.geneId);
            rows.push('#');
            rows.push('tissue\tsamples\tavg\tauc');
            for (var i = 0; i < tissues.length; i++){
                rows.push(tissues[i].tissue + '\t' + tissues[i].samples + '\t' + tissues[i].avg + '\t' + tissues[i].auc)
            }
            res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-' + geneName + '-' + req.body.db + '.txt');
            res.setHeader('Content-type', 'text/plain');
            res.charset = 'UTF-8';
            res.write(rows.join('\n'));
            return res.end()
        }
        
        
    } else if (req.body.what === 'diagnosis') {
        var rows = [];
        var terms = req.body.terms;
        rows.push('# ' + sails.config.version.comment());
        rows.push('#');
        rows.push('# Diagnosis');
        rows.push('# Downloaded ' + new Date().yyyymmdd());
        rows.push('#');
        rows.push('# HPO terms used:');
        
        getprioritizedgenes(terms, true, function(err, result){
            for (var i = 0; i < result.terms.length; i++){
                rows.push('# ' + result.terms[i].term.id + ' ' + result.terms[i].term.name)
            }

            if (result.termsNotFound.length != 0){
                rows.push('#');
                rows.push('# Terms not found: ');
                for (var i = 0; i < result.termsNotFound.length; i++){
                    rows.push('# ' + result.termsNotFound[i])
                }
                rows.push('#')
            } else {
                rows.push('#')
            }
            rows.push('Name\tID\tRank\tWeightedZscore' + '\t' + terms.split(',').join('\t'));
            var linesTop = rows.length;

            for (var i = 0; i < result.results.length; i++){
                var hpoZscores = result.results[i].predicted.join('\t')
                rows.push(
                    result.results[i].gene.name + '\t' + //name
                    result.results[i].gene.id + '\t' + //id
                    parseInt(i+1) + '\t' + //rank
                    // (mim2gene.get(result.results[i].gene.name) !== undefined ? ('=HYPERLINK("http://omim.org/entry/' + mim2gene.get(result.results[i].gene.name) + '")') : '') + '\t' + //omimURL
                    // '=HYPERLINK("http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + result.results[i].gene.name + '")\t' + //genecardsURL
                    // '=HYPERLINK("https://www.ncbi.nlm.nih.gov/pubmed/?term=' + result.results[i].gene.name + '")\t' + //pubmedURL
                    result.results[i].weightedZScore //weightedZscore 
                    + '\t' + hpoZscores
                )
            }
            res.setHeader('Content-disposition', 'attachment; filename=KidneyNetwork-Diagnosis-' + terms.split(',').join('-') + '.txt');
            res.setHeader('Content-type', 'text/plain');
            res.charset = 'UTF-8';
            res.write(rows.join('\n'));
            return res.end()
        })


        

    } else {
        
        return res.badRequest()
    }
};
