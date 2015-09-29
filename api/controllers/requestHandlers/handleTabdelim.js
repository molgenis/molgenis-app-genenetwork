var _ = require('lodash')
var fs = require('fs')
var async = require('async')
var genedesc = require('../utils/genedesc')

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString()
    var mm = (this.getMonth()+1).toString()
    var dd  = this.getDate().toString()
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0])
}

module.exports = function(req, res) {

    if (!req.body.data || !req.body.genes) {
        return res.badRequest()
    }

    var geneIds = JSON.parse(req.body.genes)
    var geneNames = _.map(geneIds, function(geneId) { var gene = genedesc.get(geneId); return gene ? gene.name : 'unknown' })

    if (req.body.db && req.body.testType) {
        var geneSets = JSON.parse(req.body.data)
        var db = req.body.db
        var testType = req.body.testType

        var rows = []
        rows.push('# ' + sails.config.version.comment())
        rows.push('#')
        rows.push('# Gene set analysis results')
        rows.push('# ' + new Date().yyyymmdd())
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
    } else if (!req.body.db && !req.body.testType) {
        var data = JSON.parse(req.body.data)

        var rows = []
        rows.push('# ' + sails.config.version.comment())
        rows.push('#')
        rows.push('# Gene prediction results')
        rows.push('# ' + new Date().yyyymmdd())
        rows.push('#')
        rows.push('# Gene set name: ' + req.body.name)
        rows.push('# Number of genes: ' + geneIds.length)
        rows.push('# Gene names: ' + geneNames.join(','))
        rows.push('# Gene ids: ' + geneIds.join(','))
        rows.push('#')
        // rows.push('coding_gene_id\tcoding_gene_name\tp-value\tnoncoding_gene_id\tnoncoding_gene_name\tp-value')
        // for (var i = 0; i < data.coding.length; i++) {
        //     var str = data.coding[i].gene.id + '\t' + data.coding[i].gene.name + '\t' + data.coding[i].p
        //     if (data.noncoding[i]) {
        //         str += '\t' + data.noncoding[i].gene.id + '\t' + data.noncoding[i].gene.name + '\t' + data.noncoding[i].p
        //     // } else {
        //     //     str += '\t' + data.noncoding[i].gene.id + '\t' + data.noncoding[i].gene.name + '\t' + data.noncoding[i].p
        //     }
        //     rows.push(str)
        // }
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
        
        return res.end()
    } else {
        return res.badRequest()
    }
}
