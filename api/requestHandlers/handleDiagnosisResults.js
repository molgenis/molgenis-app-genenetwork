var _ = require('lodash')
var dbutil = require('../utils/dbutil')
var mim2gene = require('../utils/mim2gene')
sails.log.debug("calling genesdesc from handleDiagnosisResults.js");
var genedesc = require('../utils/genedesc')
var quicksort = require('../utils/quicksort')
var quicksortobj = require('../utils/quicksortobj')
var cholesky = require('../../stats/cholesky')
var ziggurat = require('../../stats/ziggurat')
var crypto = require('crypto')
var bs62 = require('base62')
var json2csv = require('json2csv');
var fs = require('fs')

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString()
    var mm = (this.getMonth()+1).toString()
    var dd  = this.getDate().toString()
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0])
}

module.exports = function(req, res) {
    var termsQ = req.body.terms.trim().split(/[\s,;]+/)
    var terms = [] // objects
    var termsFound = []
    var termsNotFound = []
    var pathwayDBs = []

    var genesToGet = []
    // if (req.query.genes) {
    //     var genesQ = req.query.genes.split(/[\s,;]+/)
    //     for (var i = 0; i < genesQ.length; i++) {
    //         var gene = genedesc.get(genesQ[i])
    //         if (gene) {
    //             genesToGet.push(gene)
    //         }
    //     }
    // }

    for (var i = 0; i < termsQ.length; i++) {
        var pathwayObj = dbutil.pathwayObject(termsQ[i])
        console.log(pathwayObj)
        if (pathwayObj) {
            terms.push(pathwayObj)
            termsFound.push({id: pathwayObj.id, name: pathwayObj.name})
            if (pathwayDBs.indexOf(pathwayObj.database) < 0) {
                pathwayDBs.push(pathwayObj.database)
            }
        } else {
            termsNotFound.push(termsQ[i])
        }
    }

    // if (terms.length === 0) {
    //     return res.notFound({
    //         status: 404,
    //         message: 'No pathways/phenotypes found for \'' + req.params.id + '\''
    //     })
    // }

    async.map(terms, function(term, cb) {
        dbutil.getGeneZScoresForTerm(term, {
            array: true,
            sort: false
        }, function(err, result) {
            if (err) {
                cb(err)
            } else {
                cb(null, result)
            }
        })
    }, function(err, results) {

        if (err) {
            return res.send(err.status, err)
        }

        var ts = new Date()

        var r = {}
        r.href = req.protocol + '://' + req.get('host') + req.originalUrl
        r.termsNotFound = termsNotFound
        r.terms = []
        for (var i = 0; i < terms.length; i++) {
            r.terms.push({
                href: sails.config.version.apiUrl + '/pathway/' + terms[i].id
            })
            if (req.query.verbose === '' || req.query.verbose === 'true') {
                r.terms[i].term = terms[i]
            }
        }
        r.results = []
        for (var j = 0; j < results[0].length; j++) {
            var gene = genedesc.get(j)
            if (genesToGet.length == 0 || genesToGet.indexOf(gene) >= 0) {
                r.results.push({
                    href: sails.config.version.apiUrl + '/gene/' + gene.id,
                    predicted: [],
                    weightedZScore: 0
                })
                // if (req.query.verbose === '' || req.query.verbose === 'true') {
                    _.last(r.results).gene = gene
                // }
            }
        }
        var sq = Math.sqrt(results.length)
        for (var i = 0; i < results.length; i++) {
            for (var j = 0; j < results[i].length; j++) {
                r.results[j].weightedZScore += results[i][j] / sq
                r.results[j].predicted[i] = results[i][j]
            }
        }

        sails.log.debug((new Date() - ts) + ' ms creating result array')
        ts = new Date()
        quicksortobj(r.results, 'weightedZScore')
        r.results.reverse()
        sails.log.debug((new Date() - ts) + ' ms sorting')

        //create downloadable file
        //TODO put code in function
        var sha = crypto.createHash('sha1').update(termsQ.join()).digest('hex')
        var vanity = bs62.encode(parseInt(sha.substring(0, 8), 16))
        var filename = sails.config.diagnosisUploadDir + vanity + '.txt'

        var downloadinfo = []

        downloadinfo.push('#')
        downloadinfo.push('# Diagnosis')
        downloadinfo.push('# Downloaded ' + new Date().yyyymmdd())
        downloadinfo.push('#')
        downloadinfo.push('# HPO terms used:')

        for (var i = 0; i < termsFound.length; i++){
            downloadinfo.push('# ' + termsFound[i].id + ' ' + termsFound[i].name)
        }

        if (termsNotFound.length != 0){
            downloadinfo.push('# Terms not found: ')
            for (var i = 0; i < termsNotFound.length; i++){
                downloadinfo.push('# ' + termsNotFound[i])
            }
            downloadinfo.push('#')
        } else {
            downloadinfo.push('#')
        }
        downloadinfo.push('Name\tID\tRank\tOmimURL\tGeneCardsURL\tPubmedUrl\tWeightedZscore\n')

        fs.writeFile(filename, downloadinfo.join('\n'), function(err){
            if (err){
                sails.log.debug(err)
            }
        })

        linesTop = downloadinfo.length

        downloadcontent = []

        for (var i = 0; i < r.results.length; i++){
            downloadcontent.push(
                r.results[i].gene.name + '\t' + //name
                r.results[i].gene.id + '\t' + //id
                parseInt(i+1) + '\t' + //rank
                (mim2gene.get(r.results[i].gene.name) !== undefined ? ('=HYPERLINK("http://omim.org/entry/' + mim2gene.get(r.results[i].gene.name) + '")') : '') + '\t' + //omimURL
                '=HYPERLINK("http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + r.results[i].gene.name + '")\t' + //genecardsURL
                '=HYPERLINK("https://www.ncbi.nlm.nih.gov/pubmed/?term=' + r.results[i].gene.name + '")\t' + //pubmedURL
                r.results[i].weightedZScore //weightedZscore 
            )
        }

        fs.appendFile(filename, downloadcontent.join('\n'), function(err){
            if (err){
                sails.log.debug(err)
            }
            sails.log.debug('diagnosis file written to ' + filename)
            return res.download(filename, 'GeneNetwork-Diagnosis.txt')
        })
    })
}

