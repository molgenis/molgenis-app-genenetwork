var fs = require('fs')
var os = require('os')
var elasticsearch = require('elasticsearch')
var sortby = require('../utils/sort').sortby

var PUBMINE = {}
PUBMINE.elasticHostOK = false

var initialise = function() {

    PUBMINE.startYear = sails.config.pubmine.startYear || 2000
    PUBMINE.stopYear = sails.config.pubmine.stopYear || 2014

    PUBMINE.numArticles = []
    PUBMINE.overallLabel = 'Overall'
    PUBMINE.numArticles[PUBMINE.overallLabel] = []

    PUBMINE.ifBins = sails.config.pubmine.impactFactorBins.reverse()
    for (var i = 0; i < PUBMINE.ifBins.length; i++) {
        PUBMINE.numArticles['IFBin' + i] = []
        for (var y = PUBMINE.startYear; y <= PUBMINE.stopYear; y++) {
            PUBMINE.numArticles[PUBMINE.overallLabel][y] = 0
            PUBMINE.numArticles['IFBin' + i][y] = 0
        }
    }
    
    PUBMINE.journalIFBins = {}
    fs.readFileSync(sails.config.pubmine.journalFile, 'utf8').split(/\r\n|\r|\n/).forEach(function(line, i) {
        var fields = line.split('\t')
        if (fields.length > 1) {
            for (var ib = 0; ib < PUBMINE.ifBins.length; ib++) {
                if (fields[1] > PUBMINE.ifBins[ib]) {
                    PUBMINE.journalIFBins[fields[0]] = ib
                    break
                }
                }
        }
    })
    
    PUBMINE.client = new elasticsearch.Client({
        host: sails.config.elasticHost,
            log: sails.config.elasticLogLevel
    })
    
    // get total number of articles per journal per year, also making sure elasticsearch is fine
    PUBMINE.client.search({

        search_type: 'count',
        index: 'pubmine',
        size: 0,
        body: {
            aggs: {
                group_by_journal: {
                    terms: {
                        field: 'journal',
                        size: 0,
                        order: {
                            '_term': 'asc'
                        }
                    },
                    aggs: {
                        group_by_year: {
                            terms: {
                                field: 'year',
                                size: 0,
                                order: {
                                    '_term': 'asc'
                                }
                            },
                        }
                    }
                }
            }
        }

    }).then(function(result) {

        var journals = result.aggregations.group_by_journal.buckets
        for (var i = 0; i < journals.length; i++) {

            PUBMINE.numArticles[journals[i].key] = []
            PUBMINE.numArticles[journals[i].key]['total'] = 0

            var ifBin = PUBMINE.journalIFBins[journals[i].key]
            if (ifBin == undefined) {
                sails.log.info('No impact factor for journal ' + journals[i].key)
            }

            sails.log.debug(journals[i].key + ' impact factor bin ' + ifBin)
            var buckets = journals[i].group_by_year.buckets
            for (var yi = 0; yi < buckets.length; yi++) {
                var year = buckets[yi].key
                if (year >= PUBMINE.startYear && year <= PUBMINE.stopYear) {
                    var cnt = buckets[yi].doc_count
                    PUBMINE.numArticles[journals[i].key][year] = cnt
                    PUBMINE.numArticles[journals[i].key]['total'] += cnt
                    PUBMINE.numArticles[PUBMINE.overallLabel][year] += cnt
                    if (ifBin != undefined) {
                        PUBMINE.numArticles['IFBin' + ifBin][year] += cnt
                    }
                }
            }
        }

        PUBMINE.elasticHostOK = true
        sails.log.info('Elasticsearch cluster ok at ' + sails.config.elasticHost)
    }, function(err) {
        sails.log.error('Elasticsearch error:', err)
    })
}

if (sails.config.useElastic === true) {
    try {
        initialise()
    } catch (e) {
        sails.log.error('Could not initialise elasticsearch: ' + e.name + ': ' + e.message)
    }
}

module.exports = {

    chartjs: function(req, res) {

        if (!PUBMINE.elasticHostOK) {
            return res.send(500)
        }

        if (!req.params.id) {
            return res.view('pubminechart')
        }

        var queries = req.params.id.split(',')

        async.map(queries, function(query, cb) {

                PUBMINE.client.search({
                    search_type: 'count',
                    index: 'pubmine',
                    size: 0,
                    body: {
                        query: {
                            multi_match: {
                                query: query,
                                type: 'phrase',
                                fields: ['title', 'text', 'authors']
                            }
                        },
                        aggs: {
                            group_by_journal: {
                                terms: {
                                    field: 'journal',
                                    size: 0,
                                    order: {
                                        '_term': 'asc'
                                    }
                                },
                                aggs: {
                                    group_by_year: {
                                        terms: {
                                            field: 'year',
                                            size: 0,
                                            order: {
                                                '_term': 'asc'
                                            }
                                        },
                                    }
                                }
                            }
                        }
                    }

                }).then(function(result) {

                        var journals = result.aggregations.group_by_journal.buckets
                        if (journals.length < sails.config.pubmine.numTopJournals) {
                            res.view('pubminechart', {
                                error: '"' + query + '" does not occur frequently enough'
                            })
                            return
                        }

                        var colors = sails.config.colors.getChartColors()
                        var chartData = {}
                        chartData.query = query
                        chartData.labels = []
                        for (var y = PUBMINE.startYear; y <= PUBMINE.stopYear; y++) {
                            chartData.labels.push(y)
                        }
                        chartData.datasets = []

                        // a dataset summing all journals
                        var overall = {}
                        overall.strokeColor = colors[0]
                        overall.pointColor = colors[0]
                        overall.pointHighlightStroke = colors[0]
                        overall.pointHighlightFill = 'rgba(255,255,0,1)'
                        overall.pointStrokeColor = '#fff'
                        overall.label = PUBMINE.overallLabel
                        overall.counts = []
                        overall.data = []
                        for (var y = PUBMINE.startYear; y <= PUBMINE.stopYear; y++) {
                            overall.counts.push(0)
                            overall.data.push(0)
                        }
                        if (req.query.overall != undefined) {
                            chartData.datasets.push(overall)
                            chartData.overall = true
                        }

                        // datasets for ranges of journal impact factors
                        var ifDatasets = []
                        for (var ifBin = 0; ifBin < PUBMINE.ifBins.length; ifBin++) {
                            var ifDataset = {}
                            ifDataset.strokeColor = colors[ifBin + 1]
                            ifDataset.pointColor = colors[ifBin + 1]
                            ifDataset.pointHighlightStroke = colors[ifBin + 1]
                            ifDataset.pointHighlightFill = 'rgba(255,255,0,1)'
                            ifDataset.pointStrokeColor = '#fff'
                            if (ifBin == 0) {
                                ifDataset.label = 'Impact factor ' + PUBMINE.ifBins[ifBin] + '-'
                            } else {
                                ifDataset.label = 'Impact factor ' + PUBMINE.ifBins[ifBin] + '-' + PUBMINE.ifBins[ifBin - 1]
                            }
                            ifDataset.counts = []
                            ifDataset.data = []
                            for (var y = PUBMINE.startYear; y <= PUBMINE.stopYear; y++) {
                                ifDataset.counts.push(0)
                                ifDataset.data.push(0)
                            }
                            ifDatasets.push(ifDataset)
                            if (req.query.overall != undefined) {
                                chartData.datasets.push(ifDataset)
                            }
                        }

                        journals.sort(sortby('doc_count', true))

                        for (var i = 0; i < sails.config.pubmine.numTopJournals; i++) {

                            var dataset = {}
                            dataset.label = journals[i].key
                            dataset.strokeColor = colors[i]
                            dataset.pointColor = colors[i]
                            dataset.pointHighlightStroke = colors[i]
                            dataset.pointHighlightFill = 'rgba(255,255,0,1)'
                            dataset.pointStrokeColor = '#fff'
                            dataset.counts = []
                            dataset.data = []
                            dataset.totalPerc = 0
                            var data = journals[i].group_by_year.buckets
                            var ifBinThisJournal = PUBMINE.journalIFBins[journals[i].key]
                            var index = 0

                            for (var y = PUBMINE.startYear; y <= PUBMINE.stopYear; y++) {
                                if (index < data.length && data[index].key === y) {
                                    var cnt = data[index].doc_count
                                    dataset.counts.push(cnt)
                                    dataset.data.push(Math.round(1000 * cnt / PUBMINE.numArticles[journals[i].key][y]) / 10)
                                    dataset.totalPerc += cnt / PUBMINE.numArticles[journals[i].key][y]
                                    overall.counts[y - PUBMINE.startYear] += cnt
                                    ifDatasets[ifBinThisJournal].counts[y - PUBMINE.startYear] += cnt
                                    index++
                                } else {
                                    dataset.counts.push(0)
                                    dataset.data.push(0)
                                }
                            }

                            if (req.query.overall == undefined) {
                                chartData.datasets.push(dataset)
                            }
                        }

                        //                        if (req.query.overall == undefined) {
                        //                            chartData.datasets.sort(sortby('totalPerc', true))
                        //                            for (var i = 0; i < chartData.datasets.length; i++) {
                        //                                chartData.datasets[i].strokeColor = colors[i]
                        //                                chartData.datasets[i].pointColor = colors[i]
                        //                                chartData.datasets[i].pointHighlightStroke = colors[i]
                        //                            }
                        //                        }

                        for (var y = PUBMINE.startYear; y <= PUBMINE.stopYear; y++) {
                            overall.data[y - PUBMINE.startYear] += Math.round(10000 * overall.counts[y - PUBMINE.startYear] / PUBMINE.numArticles[PUBMINE.overallLabel][y]) / 100
                            for (var i = 0; i < ifDatasets.length; i++) {
                                ifDatasets[i].data[y - PUBMINE.startYear] += Math.round(10000 * ifDatasets[i].counts[y - PUBMINE.startYear] / PUBMINE.numArticles['IFBin' + i][y]) / 100
                            }
                        }

                        cb(null, chartData)

                    },

                    function(error) {
                        cb(error)
                    })
            },

            function(err, results) {

                if (err) {
                    sails.log.error('Elasticsearch error:', err)
                    res.send(500)
                } else {
                    if (req.query.json != undefined) {
                        res.json(results)
                    } else {
                        res.view('pubminechart', {
                            data: results
                        })
                    }
                }
            })
    }
}
