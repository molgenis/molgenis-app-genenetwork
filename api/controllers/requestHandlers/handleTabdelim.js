var _ = require('lodash')
var fs = require('fs')
var async = require('async')
var genedesc = require('../utils/genedesc')
var dbutil = require('../utils/dbutil')

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString()
    var mm = (this.getMonth()+1).toString()
    var dd  = this.getDate().toString()
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0])
}

module.exports = function(req, res) {

    if (req.body.what === 'pwa' && req.body.data && req.body.db && req.body.testType) {

        var geneIds = JSON.parse(req.body.genes)
        var geneNames = _.map(geneIds, function(geneId) { var gene = genedesc.get(geneId); return gene ? gene.name : 'unknown' })
        
        var geneSets = JSON.parse(req.body.data)
        var db = req.body.db
        var testType = req.body.testType

        var rows = []
        rows.push('# ' + sails.config.version.comment())
        rows.push('#')
        rows.push('# Gene set analysis results')
        rows.push('# Downloaded ' + new Date().yyyymmdd())
        rows.push('#')
        rows.push('# Gene set name: ' + req.body.name)
        rows.push('# Number of genes: ' + geneIds.length)
        rows.push('# Gene names: ' + geneNames.join(','))
        rows.push('# Gene ids: ' + geneIds.join(','))
        rows.push('# Database: ' + db)
        rows.push('# Test type: ' + testType)
        rows.push('#')
        rows.push('gene_set_id\tgene_set_name\tp-value')
        rows.push.apply(rows, _.map(geneSets, function(geneSet) { return geneSet.pathway.id + '\t' + geneSet.pathway.name + '\t' + geneSet.p }))

        res.setHeader('Content-disposition', 'attachment; filename=GeneNetwork-GeneSetAnalysis-' + geneIds.length + '-Genes.txt')
        res.setHeader('Content-type', 'text/plain')
        res.charset = 'UTF-8'
        res.write(rows.join('\n'))

        return res.end()
        
    } else if (req.body.what === 'prediction' && req.body.data && req.body.name) {

        var geneIds = JSON.parse(req.body.genes)
        var geneNames = _.map(geneIds, function(geneId) { var gene = genedesc.get(geneId); return gene ? gene.name : 'unknown' })

        var data = JSON.parse(req.body.data)

        var rows = []
        rows.push('# ' + sails.config.version.comment())
        rows.push('#')
        rows.push('# Gene prediction results')
        rows.push('# Downloaded ' + new Date().yyyymmdd())
        rows.push('#')
        rows.push('# Gene set name: ' + req.body.name)
        rows.push('# Number of genes: ' + geneIds.length)
        rows.push('# Gene names: ' + geneNames.join(','))
        rows.push('# Gene ids: ' + geneIds.join(','))
        rows.push('#')
        rows.push('gene_id\tgene_name\tp-value')
        for (var i = 0; i < data.length; i++) {
            var str = data[i].gene.id + '\t' + data[i].gene.name + '\t' + data[i].p
            rows.push(str)
        }

        res.setHeader('Content-disposition', 'attachment; filename=GeneNetwork-GenePrediction-' + geneIds.length + '-Genes.txt')
        res.setHeader('Content-type', 'text/plain')
        res.charset = 'UTF-8'
        res.write(rows.join('\n'))

        return res.end()
        
    } else if (req.body.what === 'groups' && req.body.groups) {

        var geneIds = JSON.parse(req.body.genes)
        var geneNames = _.map(geneIds, function(geneId) { var gene = genedesc.get(geneId); return gene ? gene.name : 'unknown' })

        var groups = JSON.parse(req.body.groups)
        
        var rows = []
        rows.push('# ' + sails.config.version.comment())
        rows.push('#')
        rows.push('# Gene list')
        rows.push('# Downloaded ' + new Date().yyyymmdd())
        rows.push('#')
        rows.push('# Number of genes: ' + geneIds.length)
        rows.push('#')
        rows.push('gene_id\tgene_name\tcluster')       
        var genesIncluded = false
        _.forEach(groups, function(group) {
            if (group.type === 'cluster') {
                rows.push.apply(rows, _.map(group.nodes, function(node) {
                    return node + '\t' + ((genedesc.get(node) && genedesc.get(node).name) || 'unknown') + '\t' + group.name
                }))
                genesIncluded = true
            }
        })
        
        if (!genesIncluded) {
            rows.push.apply(rows, _.map(groups[0].nodes, function(node) {
                return node + '\t' + ((genedesc.get(node) && genedesc.get(node).name) || 'unknown') + '\tnone'
            }))
        }

        res.setHeader('Content-disposition', 'attachment; filename=GeneNetwork-GeneList-' + geneIds.length + '-Genes.txt')
        res.setHeader('Content-type', 'text/plain')
        res.charset = 'UTF-8'
        res.write(rows.join('\n'))

        return res.end()
        
    } else if (req.body.what === 'termprediction') {

        var rows = []
        rows.push('# ' + sails.config.version.comment())
        rows.push('#')
        rows.push('# Gene function predictions')
        rows.push('# Downloaded ' + new Date().yyyymmdd())
        rows.push('#')
        rows.push('# Gene set name: ' + req.body.term)
        rows.push('# Database: ' + req.body.db)
        rows.push('#')
        rows.push('gene_id\tgene_name\tp-value')

        res.setHeader('Content-disposition', 'attachment; filename=GeneNetwork-GenePrediction-' + geneIds.length + '-Genes.txt')
        res.setHeader('Content-type', 'text/plain')
        res.charset = 'UTF-8'
        res.write(rows.join('\n'))

        return res.end()
        
    } else if (req.body.what === 'geneprediction' && req.body.geneId && req.body.db) {

        var geneName = genedesc.get(req.body.geneId) && genedesc.get(req.body.geneId).name
        var rows = []
        rows.push('# ' + sails.config.version.comment())

        if (req.body.type === 'prediction'){
            var predictions = JSON.parse(req.body.predictions)   
            rows.push('#')
            rows.push('# Gene function predictions')
            rows.push('# Downloaded ' + new Date().yyyymmdd())
            rows.push('#')
            rows.push('# Gene name: ' + geneName)
            rows.push('# Gene id: ' + req.body.geneId)
            rows.push('# Database: ' + req.body.db)
            rows.push('#')
            rows.push('term_id\tterm_name\tp-value\tdirection\tannotated')
            for (var i = 0; i < predictions.length; i++) {
                rows.push(predictions[i].id + '\t' + predictions[i].name + '\t' + predictions[i].pValue + '\t' + predictions[i].direction + '\t' + predictions[i].annotated)
            }
        } else if (req.body.type == 'similar'){
            rows.push('#')
            rows.push('# Co-regulated genes')
            rows.push('# Downloaded ' + new Date().yyyymmdd())
            rows.push('#')
            rows.push('# Gene name: ' + geneName)
            rows.push('# Gene id: ' + req.body.geneId)
            rows.push('#')
            rows.push('gene\tdescription\tp-value')
        } else {
            rows.push('#')
            rows.push('Tissue-specific expression')
            rows.push('# Downloaded ' + new Date().yyyymmdd())
            rows.push('#')
            rows.push('# Gene name: ' + geneName)
            rows.push('# Gene id: ' + req.body.geneId)
            rows.push('#')
            rows.push('tissue\tsamples\tp-value')
        }

        // rows.push(data)
        // rows.push('\ntissue\taverage\tstandard deviation\tauc\tz-score')
        // for (var i = 0; i < tissues.length; i++){
        //     rows.push(tissues[i].toLowerCase() + '\t' + avg[i] + '\t' + stdev[i] + '\t' + auc[i] + '\t' + z[i])
        // }
        res.setHeader('Content-disposition', 'attachment; filename=GeneNetwork-' + geneName + '-' + req.body.db + '.txt')
        res.setHeader('Content-type', 'text/plain')
        res.charset = 'UTF-8'
        res.write(rows.join('\n'))

        return res.end()
        
    } else {
        
        return res.badRequest()
    }
}
