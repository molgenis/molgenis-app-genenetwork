const _ = require('lodash');
const fs = require('fs');
const level = require('level');
const genedesc = require('./genedesc');
const genstats = require('genstats');
const descriptives = genstats.descriptives;
const probability = genstats.probability;
const wilcoxon = genstats.wilcoxon;
const quicksort = require('./quicksort');
const quicksortobj = require('./quicksortobj');
const sortby = require('./sort').sortby;
const lookup = function (value) {
    return (value - 32768) / 1000
};

var exp = module.exports;

////////////

var genedb = level(sails.config.geneDBPath, {
    valueEncoding: 'binary'
});
var pathwaydb = level(sails.config.pathwayDBPath, {
    valueEncoding: 'binary'
});
var celltypedb = level(sails.config.celltypeDBPath, {
    valueEncoding: 'binary'
});

var transcriptbardb = level(sails.config.transcriptBarsDBpath, {
    valueEncoding: 'binary'
});
//var pathwayrankdb = level(sails.config.pathwayRankDBPath, {valueEncoding: 'binary'})
// var pcdb = level(sails.config.pcDBPath, {
//     valueEncoding: 'binary'
// })
var correlationdb = level(sails.config.correlationDBPath, {
    valueEncoding: 'binary'
});

var tissuecorrelationdb = level(sails.config.tissuecorrelationDBPath, {
    valueEncoding: 'binary'
});

var transcriptdb = level(sails.config.transcriptDBpath, {
    valueEncoding: 'binary'
});

//TODO this data to the database
var getPathwayDatabasesFromDB = function(db, callback) {
    var databases = [
        {id: 'REACTOME',
         name: 'Reactome',
         fullName: 'Reactome',
         description: 'A curated pathway database',
         url: 'http://www.reactome.org/',
         inMemory: true},
        // {id: 'GO-BP',
        //  name: 'GO biological process',
        //  fullName: 'Gene Ontology - Biological process',
        //  description: 'Consistent description of gene products',
        //  url: 'http://geneontology.org/',
        //  inMemory: false},
        // {id: 'GO-MF',
        //  name: 'GO molecular function',
        //  fullName: 'Gene Ontology - Molecular function',
        //  description: 'Consistent description of gene products',
        //  url: 'http://geneontology.org/',
        //  inMemory: false},
        // {id: 'GO-CC',
        //  name: 'GO cellular component',
        //  fullName: 'Gene Ontology - Cellular component',
        //  description: 'Consistent description of gene products',
        //  url: 'http://geneontology.org/',
        //  inMemory: true},
        {id: 'HPO',
         name: 'Human Phenotype Ontology',
         fullName: 'Human Phenotype Ontology',
         description: 'A human phenotype database and tool',
         url: 'http://www.human-phenotype-ontology.org/',
         inMemory: true},
    ];
    callback(null, databases)
};

//TODO genes also to db
var getPathwaysFromDB = function(db, callback) {
    sails.log.debug('Getting available external databases');
    var dbArray = [];
    var pathways = {};
    db.createReadStream({
            start: '!RNASEQ!',
            end: '!RNASEQ!~',
            valueEncoding: 'json'
        })
        .on('data', function(data) {
            sails.log.debug(data.key);
            var dbname = data.key.substring(data.key.lastIndexOf('!') + 1);
            dbArray.push(dbname);
            if (data.value[0].index_ === undefined) {
                sails.log.info('No index_ field set for terms in ' + data.key + ', setting it now');
                _.forEach(data.value, function(term, i) {
                    term.index_ = i
                })
            }
            pathways[dbname] = data.value
        })
        .on('end', function() {
            if (dbArray.length === 0) {
                throw {name: 'DatabaseError', message: 'No gene set databases found from db!'}
            }
            sails.log.info('Databases: ' + dbArray);
            callback(null, dbArray, pathways)
        })
        .on('error', function(err) {
            callback(err)
        })
};

var DBUTIL = {
    pathways: null,
    dbIds: null
};
exp.DBUTIL = DBUTIL;

getPathwaysFromDB(pathwaydb, function(err, dbs, pathways) {
    if (err) sails.log.error(err);
    else {
        DBUTIL.pathways = pathways;
        DBUTIL.dbIds = dbs
    }
});
getPathwayDatabasesFromDB(pathwaydb, function(err, databases) {
    if (err) sails.log.error(err);
    else {
        DBUTIL.databases = databases
    }
});

///////////////

var handleDBError = function(err, callback) {
    sails.log.debug(err);
    if (err.name === 'NotFoundError') {
        callback({
            status: 404,
            message: 'Not found'
        })
    } else {
        sails.log.error(err);
        callback({
            status: 500,
            message: 'Database error'
        })
    }
};

var getAnnotations = function(buffer, pathway, dbname, options) {

    var result = [];
    var numAnnotations = buffer.length / 2;
    if (dbname) { // pathway annotations
        sails.log.debug('getting annotations for ' + dbname);
        if (!DBUTIL.pathways[dbname]) {
            throw {name: 'ArgumentError', message: 'Not in pathway database: ' + dbname}
        }
        for (var a = 0; a < numAnnotations; a++) {
            var pwIndex = buffer.readUInt16BE(a * 2);
            // TODO fix verbose, now term is subsequently deleted
            if (options && (options.verbose === '' || options.verbose === 'true')) {
                result.push({
                    href: sails.config.version.apiUrl + '/pathway/' + DBUTIL.pathways[dbname][pwIndex].id,
                    term: DBUTIL.pathways[dbname][pwIndex]
                })
            } else {
                result.push({
                    href: sails.config.version.apiUrl + '/pathway/' + DBUTIL.pathways[dbname][pwIndex].id,
                    term: DBUTIL.pathways[dbname][pwIndex]
                })
            }
            if (options && (options.verbose === '' || options.verbose === 'true')) {
                //TODO sort..
                //quicksortobj(result, 'term.auc')
            }
        }
        sails.log.debug(result.length + ' pathway annotations read (' + dbname + ')')
    } else { // gene annotations

        //GET P-VALUES FOR ANNOTATIONS
        // solve this in a neat way
        // var predictions = []
        // pathwaydb.get('RNASEQ!PREDICTIONS!' + pathway.database.toUpperCase() + '!' + pathway.id, function(err, data) {
            
            // if (err) {
            //     handleDBError(err)
            // } else {
            //     for (var i = 1; i < data.length / 2; i++){
            //         var z = lookup(data.readUInt16BE(i * 2))
            //         predictions.push(z)
            //     }
            // }
            ////////// 
            for (var a = 0; a < numAnnotations; a++) {
                var geneIndex = buffer.readUInt16BE(a * 2);
                var gene = genedesc.get(geneIndex);
                // var z = predictions[geneIndex] //
                // var p = probability.zToP(z) //
                if (options && (options.verbose === '' || options.verbose === 'true')) {
                    result.push({
                        href: sails.config.version.apiUrl + '/gene/' + gene.id,
                        gene: gene,
                        // zScore: z, //
                        // pValue: p //
                    })
                } else {
                    result.push({
                        href: sails.config.version.apiUrl + '/gene/' + gene.id,
                        //zScore: z, //
                        // pValue: p //
                    })
                }
            }
            sails.log.debug(result.length + ' gene annotations read')
            // })
        
    }
    return result
};

// TODO significant pws/genes
var getPredictions = function(buffer, dbname, options) {

    // if (!DBUTIL.pathways[dbname]) {
    //     throw {name: 'ArgumentError', message: 'dbutil.getPredictions: Unknown gene set database: ' + dbname}
    // }

    options = options || {};
    var result = [];
    var numSignificant = buffer.readUInt16BE(0);
    //sails.log.debug('Will prepare ' + (dbname ? dbname : 'gene') + ' Z-scores (buffer length / 2 ' + buffer.length / 2 + ', numSignificant ' + numSignificant + ', start ' + options.start + ', stop ' + options.stop + ')')

    var ts = new Date();
    if (dbname) { // pathway z scores
        for (var i = 1; i < buffer.length / 2; i++) {
            var z;
            // TODO
	    if ('OMIM' === dbname) {
		z = buffer.readUInt16BE(i * 2) / 65535
	    } else {
		z = (buffer.readUInt16BE(i * 2) - 32768) / 1000
	    }
            if (options.verbose === '' || options.verbose === 'true') {
                result.push({
                    href: sails.config.version.apiUrl + '/pathway/' + DBUTIL.pathways[dbname][i - 1].id,
                    term: DBUTIL.pathways[dbname][i - 1],
                    zScore: z,
                })
            } else {
                result.push({
                    href: sails.config.version.apiUrl + '/pathway/' + DBUTIL.pathways[dbname][i - 1].id,
                    zScore: z,
                })
            }
        }

        if (options.annotations) { // add Z-scores for annotated genes, as they might not be included in the sliced list of predicted genes
            _.forEach(options.annotations, function(obj) {
                if (obj.term.database === dbname) {
                    obj.zScore = result[obj.term.index_].zScore;
	            if (options.pvalue) {
                        obj.pValue = probability.zToP(obj.zScore)
	            }
                }
            })
        }
        //sails.log.debug((new Date() - ts) + ' ms reading ' + result.length + ' ' + dbname + ' z-scores')
    } else { // gene z scores
        for (var i = 1; i < buffer.length / 2; i++) {
            var z = lookup(buffer.readUInt16BE(i * 2));
            var gene = genedesc.get(i - 1);
            if (options.array) {
                result.push(z)
            } else {
                if (options.verbose === '' || options.verbose === 'true') {
                    result.push({
                        gene: gene,
                        href: sails.config.version.apiUrl + '/gene/' + gene.id,
                        zScore: z,
                    })
                } else {
                    result.push({
                        href: sails.config.version.apiUrl + '/gene/' + gene.id,
                        zScore: z,
                    })
                }
            }
        }
        //sails.log.debug((new Date() - ts) + ' ms preparing ' + result.length + ' gene z-scores')
    }

    ts = new Date();

    if (options.sort === true) {
        if (options.array) {
            quicksort(result);
            result.reverse()
        } else {
            quicksortobj(result, 'zScore', Math.abs);
            result.reverse();
            sails.log.debug((new Date() - ts) + ' ms sorting');
            ts = new Date()
        }
    }

    if (options.start != undefined) {
        var start = options.start;
        var stop = options.stop || start + sails.config.api.maxNumEntries;
        result = result.slice(start, Math.min(Number(stop), start + sails.config.api.maxNumEntries))
    } else if (!options.array) { // don't slice if array is returned
        result = result.slice(0, sails.config.api.maxNumEntries)
    }

    if (!options.array) {
        for (var i = 0; i < result.length; i++) {
	    result[i].zScore = Number(result[i].zScore.toPrecision(4));
	    if (options.pvalue) {
		if (dbname && dbname == 'OMIM') {
		    result[i].pValue = result[i].zScore
		} else {
                    result[i].pValue = probability.zToP(result[i].zScore) //Number(Number(probability.zToP(result[i].zScore).toPrecision(2)).toExponential())
		}
	    }

        }
    }

    // sails.log.debug((new Date() - ts) + ' ms slicing and all the rest')

    return result
};

///////////////

exp.getPathways = function(db) {
    return DBUTIL.pathways[db.toUpperCase()]
};

// TODO better search
exp.pathwayObject = function(pwname) {
    pwname = pwname.trim().toUpperCase();
    var pathway = null;
    for (var db in DBUTIL.pathways) {
        for (var i = 0; i < DBUTIL.pathways[db].length; i++) {
            if (DBUTIL.pathways[db][i].id === pwname) {
                pathway = DBUTIL.pathways[db][i];
                break
            }
        }
        if (pathway) break
    }
    return pathway
};

exp.getPC = function(pc, callback) {
    pcdb.get('RNASEQ!PC' + pc, function(err, data) {
        if (err) {
            handleDBError(err, callback)
        } else {
            // var arr = []
            // for (var i = 0; i < data.length / 4; i++) {
            //     arr.push(data.readFloatBE(i * 4))
            // }
            callback(null, data)
        }
    })
};

exp.getGeneJSON = function(gene, db, req, callback) {

    var r = {
        comment: sails.config.version.comment(),
        version: sails.config.version.version,
        gene: gene,
        databases: DBUTIL.databases,
        pathways: {
            annotated: [],
            predicted: []
        },
        celltypes: {
            fixed: {
                header: [],
                indices: {},
            },        	
            values: {
                avg: [], 
                stdev: [], 
                z: [], 
                auc: [],
            },
            transcriptBars: {}
        }
    };

    if (db) { // pathway database given, get all its pathways

        sails.log('getting ' + db + ' annotations and predictions for ' + gene.id);
        db = db.toUpperCase();
        async.series([
            function(cb) {
                genedb.get('RNASEQ!ANNOTATIONS!' + gene.id + '!' + db, function(err, data) {
                    if (err) {
                        if (err.name != 'NotFoundError') { // not all genes have annotations, omit not founds
                            handleDBError(err, cb)
                        }
                    } else {
                        r.pathways.annotated = getAnnotations(data, null, db, {
                            verbose: req.query.verbose
                        })
                    }
                    cb()
                })
            },
            function(cb) {
                genedb.get('RNASEQ!PREDICTIONS!' + gene.id + '!' + db, function(err, data) {
                    if (err) {
                        handleDBError(err, cb)
                    } else {
                        sails.log.debug(data.length / 2 + ' ' + db + ' predictions read for ' + gene.id);
                        r.pathways.predicted = getPredictions(data, db, {
                            verbose: req.query.verbose,
                            start: req.query.start,
                            stop: req.query.stop,
                            sort: true,
                            pvalue: true,
                            array: req.query.array
                        });
                        //TODO fix
                        if (req.query.verbose !== '' && req.query.verbose !== 'true') {
                            _.forEach(r.pathways.annotated, function(obj) {
                                delete obj.term
                            })
                        }
                    }
                    cb()
                })
            }
        ], function(err) {
            callback(err, r)
        })

    } else { // no pathway database given, get a limited number of pathways for each database

        sails.log.debug('getting annotations and predictions in all databases for ' + gene.id);
        async.series([
            function(cb) {
                genedb.createReadStream({
                    start: 'RNASEQ!ANNOTATIONS!' + gene.id + '!',
                    end: 'RNASEQ!ANNOTATIONS!' + gene.id + '!~'
                })
                    .on('data', function(data) {
                        var db = data.key.substring(data.key.lastIndexOf('!') + 1, data.key.length);
                        var annotationsThisDB = getAnnotations(data.value, null, db, {
                            verbose: req.query.verbose
                        });
                        r.pathways.annotated.push.apply(
                            r.pathways.annotated,
                            annotationsThisDB);
                        sails.log.debug('got ' + db + ' annotations for ' + gene.id)
                    })
                    .on('end', function() {
                        cb(null)
                    })
            },
            function(cb) {
                genedb.createReadStream({
                    start: 'RNASEQ!PREDICTIONS!' + gene.id + '!',
                    end: 'RNASEQ!PREDICTIONS!' + gene.id + '!~'
                })
                    .on('data', function(data) {
                        var db = data.key.substring(data.key.lastIndexOf('!') + 1, data.key.length);
                        sails.log.debug('got ' + db + ' predictions for ' + gene.id);
                        var zScoresThisDB = getPredictions(data.value, db, {
                            verbose: req.query.verbose,
                            start: 0,
                            stop: sails.config.api.numPathwaysLimit || 10,
                            sort: true,
                            pvalue: true,
                            annotations: r.pathways.annotated
                        });
                        r.pathways.predicted.push.apply(r.pathways.predicted, zScoresThisDB)
                        // r.pathways.predicted.push.apply(
                        //     r.pathways.predicted,
                        //     zScoresThisDB.splice(0, pwLimit))
                    })
                    .on('end', function() {
                        if (req.query.verbose !== '' && req.query.verbose !== 'true') {
                            _.forEach(r.pathways.annotated, function(obj) {
                                delete obj.term
                            })
                        }
                        cb(null)
                    })
            },
            function(cb) {
                celltypedb.get('!RNASEQ!CELLTYPE', {valueEncoding: 'json'}, function(err, data) {
                    if (err) sails.log.error(err);
                    else {
                    	r.celltypes.fixed['header'] = JSON.parse(data.toString());
                    	var i = 0;
                    	_.forEach(r.celltypes.fixed['header'], function(item){
                            r.celltypes.fixed['indices'][item.name] = i;
                            i ++;
                    	    if (item.children) {
                    			_.forEach(item.children, function(child){
                    				r.celltypes.fixed['indices'][child.name] = i;
                    				i++ 
                    			});
                    		}                		
                    	})
                    }
                });

                celltypedb.createReadStream({
                    start: 'RNASEQ!' + gene.id + '!CELLTYPE!',
                    end: 'RNASEQ!' + gene.id + '!CELLTYPE!~'
                })

                .on('data', function(buffer) {
                	if (_.endsWith(buffer.key, 'AVG')){
                		for (var i = 0; i < buffer.value.length; i += 2) {
							r.celltypes.values['avg'].push(Math.round((buffer.value.readUInt16BE(i) - 32768) / 10) / 100)
						}
                	} else if (_.endsWith(buffer.key, 'STDEV')){
                		for (var i = 0; i < buffer.value.length; i += 2) {
							r.celltypes.values['stdev'].push(Math.round((buffer.value.readUInt16BE(i)) / 10) / 100)
						}
                	} else if (_.endsWith(buffer.key, 'AUC')){
                		for (var i = 0; i < buffer.value.length; i += 2) {
							r.celltypes.values['auc'].push(Math.round((buffer.value.readUInt16BE(i)) / 10) / 100)
						}
                	} else if (_.endsWith(buffer.key, 'Z')){
                		for (var i = 0; i < buffer.value.length; i += 2) {
							r.celltypes.values['z'].push(Math.round((buffer.value.readUInt16BE(i) - 32768) / 10) / 100)
						}
                	}
                })

                .on('end', function() {
                    cb(null)
                })
            },
            function(cb) {
            	// get transcript bars if gene has transcripts
                //TODO
                if (gene.transcripts){
                    var tissues;
                    var transcripts = gene.transcripts.length <= 10 ? gene.transcripts : gene.transcripts.slice(0,10);
                    transcriptbardb.get('!RNASEQ!TISSUES', [{valueEncoding: 'json'}], function(err, data) {
                        if (err){
                            sails.log.error(err)
                        } else {
                            tissues = JSON.parse(data);
                            for (var i = 0; i < tissues.length; i++){
                                r.celltypes.transcriptBars[tissues[i]] = Array(transcripts.length)
                            }
                        }
                    });

                    transcriptbardb.createReadStream({
                        start: 'RNASEQ!' + gene.id + '!TRANSCRIPTBARS!',
                        end: 'RNASEQ!' + gene.id + '!TRANSCRIPTBARS!~'
                    })

                    .on('data', function(buffer) {
                        if (_.includes(transcripts, buffer.key.split('!')[3])){
                            for (var i = 0; i < buffer.value.length; i += 2) {
                                r.celltypes.transcriptBars[tissues[i/2]][transcripts.indexOf(buffer.key.split('!')[3])] = ((buffer.value.readUInt16BE(i) - 32768) / 1000) + 0.1
                            }
                        }
                    })

                    .on('end', function(){
                        cb(null)
                    })

                } else {
                    cb(null)
                } 
            }
        ],
        function(err) {
            var ann = {};
            for (var i = 0; i < r.pathways.annotated.length; i++) {
                if (r.pathways.annotated[i].term) {
                    ann[r.pathways.annotated[i].term.id] = true
                }
            }
            for (var i = 0; i < r.pathways.predicted.length; i++) {
                if (r.pathways.predicted[i].term) {
                    if (ann[r.pathways.predicted[i].term.id] === true) {
                        r.pathways.predicted[i].annotated = true
                    } else {
                        r.pathways.predicted[i].annotated = false
                    }
                }
            }
            callback(err, r)
        })
    }
};

exp.getTranscriptJSON = function(transcript, callback) {
    var transcripts = {
        name: transcript,
        avg: [],
        stdev: [],
        auc: [],
        z: []
    };

    sails.log.debug('getting expression per tissue for ' + transcript);
    async.series([
        function(cb) {
            transcriptdb.createReadStream({
                start: 'RNASEQ!' + transcript + '!CELLTYPE!',
                end: 'RNASEQ!' + transcript + '!CELLTYPE!~'
            })

            .on('data', function(buffer) {
                if (_.endsWith(buffer.key, 'AVG')){
                    for (var i = 0; i < buffer.value.length; i += 2) {
                        transcripts['avg'].push((buffer.value.readUInt16BE(i) - 32768) / 1000);

                        //remove when database is up to date
                        transcripts['stdev'].push('-');
                        transcripts['auc'].push('-');
                        transcripts['z'].push('-')
                    }
                } else if (_.endsWith(buffer.key, 'STDEV')){
                    for (var i = 0; i < buffer.value.length; i += 2) {
                        transcripts['stdev'].push((buffer.value.readUInt16BE(i)) / 1000)
                    }
                } else if (_.endsWith(buffer.key, 'AUC')){
                    for (var i = 0; i < buffer.value.length; i += 2) {
                        transcripts['auc'].push((buffer.value.readUInt16BE(i) - 32768) / 1000)
                    }
                } else if (_.endsWith(buffer.key, 'Z')){
                    for (var i = 0; i < buffer.value.length; i += 2) {
                        transcripts['z'].push((buffer.value.readUInt16BE(i) - 32768) / 1000)
                    }
                }
            })
            .on('end', function() {
                cb(null)
            })
        }
    ],
    function(err) {
        callback(err, transcripts)
    })  
};

exp.getNewTranscriptBars = function(transcripts, callback) {
    var transcriptBars = {transcripts: Array(transcripts.length)};
    gene = transcripts.split(',')[0];
    transcripts = transcripts.split(',').slice(1);
    sails.log.debug('getting new transcript bars for gene ' + gene + ' for transcripts ' + transcripts);
    async.series([
        function(cb) {
            var tissues;
            transcriptbardb.get('!RNASEQ!TISSUES', [{valueEncoding: 'json'}], function(err, data) {
                if (err) sails.log.error(err);
                else {
                    tissues = JSON.parse(data);
                    for (var i = 0; i < tissues.length; i++){
                        transcriptBars[tissues[i]] = Array(transcripts.length)
                    }
                }
            });

            transcriptbardb.createReadStream({
                start: 'RNASEQ!' + gene + '!TRANSCRIPTBARS!',
                end: 'RNASEQ!' + gene + '!TRANSCRIPTBARS!~'
            })

            .on('data', function(buffer) {
                if (_.contains(transcripts, buffer.key.split('!')[3])){
                    for (var i = 0; i < buffer.value.length; i += 2) {
                       transcriptBars[tissues[i/2]][transcripts.indexOf(buffer.key.split('!')[3])] = ((buffer.value.readUInt16BE(i) - 32768) / 1000) + 0.1
                    }
                }
            })

            .on('end', function() {
                cb(null)
            })
        }

    ], function(err) {
        callback(err, transcriptBars)
    })
};

exp.getGivenGenesCoregArrayForGene = function(gene, geneIndices, callback) {
    correlationdb.get('RNASEQ!' + gene.id, function(err, data) {
        if (err) return callback(err);
        var arr = _.map(geneIndices, function(index) {
            return lookup(data.readUInt16BE((index + 1) * 2))
        });
        return callback(null, arr)
    })
};

exp.getGivenGenesAnnotationArrayForTerm = function(termObj, geneIndices, callback) {
    if (!termObj || !termObj.database || !termObj.id) {
        return callback({name: 'ArgumentError', message: 'dbutil.getGivenGenesAnnotationArrayForTerm requires a term object'})
    }
    if (!_.isArray(geneIndices) || geneIndices.length == 0) {
        return callback({name: 'ArgumentError', message: 'dbutil.getGivenGenesAnnotationArrayForTerm requires an array of gene indices'})
    }
    pathwaydb.get('RNASEQ!ANNOTATIONS!' + termObj.database + '!' + termObj.id, function(err, buffer) {
        if (err) {
            handleDBError(err, callback)
        } else {
            var termAnnotations = [];
            for (var i = 0; i < buffer.length / 2; i++) {
                termAnnotations.push(buffer.readUInt16BE(i * 2))
            }
            var annotations = _.map(geneIndices, function(geneIndex) { return _.contains(termAnnotations, +geneIndex) });
            callback(null, annotations)
        }
    })
};

exp.getGivenGenesZScoreArrayForTerm = function(termObj, geneIndices, callback) {
    if (!termObj || !termObj.database || !termObj.id) {
        return callback({name: 'ArgumentError', message: 'dbutil.getGivenGenesZScoreArrayForTerm requires a term object'})
    }
    if (!_.isArray(geneIndices) || geneIndices.length == 0) {
        return callback({name: 'ArgumentError', message: 'dbutil.getGivenGenesZScoreArrayForTerm requires an array of gene indices'})
    }
    pathwaydb.get('RNASEQ!PREDICTIONS!' + termObj.database + '!' + termObj.id, function(err, buffer) {
        if (err) {
            handleDBError(err, callback)
        } else {
            var arr = _.map(geneIndices, function(index) { index = +index; var z = lookup(buffer.readUInt16BE((index + 1) * 2)); return z});
            callback(null, arr)
        }
    })
};

exp.getGeneZScoresForTerm = function(term, options, callback) {
    pathwaydb.get('RNASEQ!PREDICTIONS!' + term.database + '!' + term.id, function(err, buffer) {
        if (err) {
            if (err.name == 'NotFoundError') {
                callback(null, null)
            } else {
                handleDBError(err, callback)
            }
        } else {
            callback(null, getPredictions(buffer, null, options))
        }
    })
};

exp.getAnnotatedPathwayIDsForGene = function(gene, dbname, callback) {

    if (dbname) {
        sails.log.info('TODO getAnnotatedPathwayIDsForGene with given dbname');
        callback({
            status: 404,
            message: 'TODO'
        })
    }

    var result = [];
    genedb.createReadStream({
            start: 'RNASEQ!ANNOTATIONS!' + gene.id + '!',
            end: 'RNASEQ!ANNOTATIONS!' + gene.id + '!~'
        })
        .on('data', function(data) {
            var db = data.key.substring(data.key.lastIndexOf('!') + 1);
            var numAnnotations = data.value.length / 2;
            for (var a = 0; a < numAnnotations; a++) {
                var pwIndex = data.value.readUInt16BE(a * 2);
                result.push(DBUTIL.pathways[db][pwIndex].id)
            }
        })
        .on('end', function() {
            callback(null, result)
        })
};

exp.getAnnotatedGenes = function(pathway, callback) {
    
    pathwaydb.get('RNASEQ!ANNOTATIONS!' + pathway.database.toUpperCase() + '!' + pathway.id, function(err, buffer) {
        if (err) {
            handleDBError(err, callback)
        } else {
	    var numAnnotations = buffer.length / 2;
	    var genes = [];
            for (var a = 0; a < numAnnotations; a++) {
		var geneIndex = buffer.readUInt16BE(a * 2);
		var gene = genedesc.get(geneIndex);
                genes.push(gene)
            }
            sails.log.debug('annotations read from db for ' + pathway.name);
	    callback(null, genes)
        }
    })
};

exp.getPathwayJSON = function(pathway, req, callback) {

    var r = {
        comment: sails.config.version.comment(),
        version: sails.config.version.version,
        pathway: pathway,
        genes: {
            annotated: [],
            predicted: []
        }
    };

    async.waterfall([
            function(cb) {
                sails.log.debug('reading annotations for ' + pathway.id);
                pathwaydb.get('RNASEQ!ANNOTATIONS!' + pathway.database.toUpperCase() + '!' + pathway.id, function(err, data) {
                    if (err) {
                        if (err.name != 'NotFoundError') { // omit not founds, TODO should we?
                            handleDBError(err, cb)
                        } else {
                            cb()
                        }
                    } else {
                        sails.log.debug('annotations read from db for ' + pathway.name);
                        r.genes.annotated = getAnnotations(data, pathway, null, {
                        // r.genes.annotated = getAnnotations(data, null, {
                            verbose: req.query.verbose,
                            pValue: true
                        });
                        cb()
                    }
                })
            },
            function(cb) {
                pathwaydb.get('RNASEQ!PREDICTIONS!' + pathway.database.toUpperCase() + '!' + pathway.id, function(err, data) {
                    if (err) {
                        handleDBError(err, cb)
                    } else {
                        r.genes.predicted = getPredictions(data, null, {
                            start: req.query.start,
                            stop: req.query.stop,
                            verbose: req.query.verbose,
                            sort: true,
                            pvalue: true
                        });
                        cb()
                    }
                })
            }
        ],
        function(err) {
            var ann = {};
            for (var i = 0; i < r.genes.annotated.length; i++) {
                if (r.genes.annotated[i].gene) {
                    ann[r.genes.annotated[i].gene.id] = true
                }
            }
            for (var i = 0; i < r.genes.predicted.length; i++) {
                if (r.genes.predicted[i].gene) {
                    if (ann[r.genes.predicted[i].gene.id] === true) {
                        r.genes.predicted[i].annotated = true
                    } else {
                        r.genes.predicted[i].annotated = false
                    }
                }
            }

            callback(err, r)
        })
};

exp.getCorrelationsJSON = function(gene, options, callback) {

    correlationdb.get('RNASEQ!' + gene.id, function(err, data) {

        if (err) {
            handleDBError(err, callback)
        } else {

            var arr = [];
            for (var i = 0; i < data.length / 2; i++) {
                arr.push(lookup(data.readUInt16BE(i * 2)))
            }
            var r = {
                comment: sails.config.version.comment(),
                version: sails.config.version.version,
                data: []
            };
            var verbose = (options.verbose === '' || options.verbose === 'true');
            for (var i = 0; i < arr.length; i++) {
                var otherGene = genedesc.get(i);
                if (otherGene !== gene) {
                    if (verbose) {
                        r.data.push({
                            gene: otherGene,
                            zScore: arr[i]
                        })
                    } else {
                        r.data.push({
                            gene: otherGene.id,
                            zScore: arr[i]
                        })
                    }
                }
            }

            r.data.sort(sortby('zScore', true, Math.abs));

            if (options.limit) {
                var rnew = {};
                rnew.comment = r.comment;
                rnew.gene = gene;
                rnew.data = [];
                for (var i = 0; i < options.limit; i++) {
                    rnew.data[i] = r.data[i]
                }
                r = rnew
            }

            for (var i = 0; i < r.data.length; i++) {
                var p = probability.zToP(r.data[i].zScore);
                r.data[i].pValue = Number(Number(p.toPrecision(2)).toExponential())
                // r.data[i].zScore = Number(r.data[i].zScore.toPrecision(4))
            }

            callback(null, r)
        }
    })
};

exp.getPairwiseCorrelationsJSON = function(genes, callback) {

    async.map(genes, function(gene, cb) {
        correlationdb.get('RNASEQ!' + gene.id, function(err, data) {
            if (err) cb(err);
            var arr = [];
            for (var i = 0; i < genes.length; i++) {
                arr.push(lookup(data.readUInt16BE(genes[i].index_ * 2)))
            }
            cb(null, arr)
        })
    }, function(err, results) {
        if (err) {
            handleDBError(err, callback)
        } else {
            var r = {
                comment: sails.config.version.comment(),
                version: sails.config.version.version,
                data: []
            };
            for (var g1 = 0; g1 < results.length; g1++) {
                for (var g2 = g1 + 1; g2 < results.length; g2++) {
                    var z = results[g1][g2];
                    var p = probability.zToP(z);
                    r.data.push({
                        genes: [genes[g1], genes[g2]],
                        pValue: Number(Number(p.toPrecision(2)).toExponential()),
                        zScore: Number(z.toPrecision(4))
                    })
                }
            }
            r.data.sort(sortby('zScore', true, Math.abs));
            callback(null, r)
        }
    })
};

exp.getPairwiseCofunctionsJSON = function(genes, dbs, callback) {

    async.map(genes, function(gene, cb) {

        var arr = [];
        genedb.createReadStream({
                start: 'RNASEQ!PREDICTIONS!' + gene.id + '!',
                end: 'RNASEQ!PREDICTIONS!' + gene.id + '!~'
            })
            .on('data', function(data) {
                if (dbs.indexOf(data.key.substring(data.key.lastIndexOf('!') + 1)) > -1) {
                    var numSignificant = data.value.readUInt16BE(0);
                    for (var i = 1; i < data.value.length / 2; i++) {
                        arr.push(lookup(data.value.readUInt16BE(i * 2)))
                    }
                }
            })
            .on('end', function() {
                cb(null, arr)
            })
    }, function(err, results) {
        if (err) {
            handleDBError(err, callback)
        }
        var r = {
            comment: sails.config.version.comment(),
            version: sails.config.version.version,
            data: []
        };
        for (var g1 = 0; g1 < genes.length; g1++) {
            for (var g2 = g1 + 1; g2 < genes.length; g2++) {
                var corr = Number(descriptives.correlation(results[g1], results[g2]).toPrecision(4));
                r.data.push({
                    genes: [genes[g1].id, genes[g2].id],
                    correlation: corr
                })
            }
        }
        ts = new Date();
        quicksortobj(r.data, 'correlation');
        r.data.reverse();
        sails.log.debug((new Date() - ts) + ' ms sorting');
        callback(null, r)
    })
};

exp.getCofunctionMatrix = function(genes, dbs, callback) {

    async.map(genes, function(gene, cb) {

        var arr = [];
        genedb.createReadStream({
                start: 'RNASEQ!PREDICTIONS!' + gene.id + '!',
                end: 'RNASEQ!PREDICTIONS!' + gene.id + '!~'
            })
            .on('data', function(data) {
                if (dbs.indexOf(data.key.substring(data.key.lastIndexOf('!') + 1)) > -1) {
                    var numSignificant = data.value.readUInt16BE(0);
                    for (var i = 1; i < data.value.length / 2; i++) {
                        arr.push(lookup(data.value.readUInt16BE(i * 2)))
                    }
                }
            })
            .on('end', function() {
                cb(null, arr)
            })
    }, function(err, results) {
        var matrix = [];
        for (var g1 = 0; g1 < genes.length; g1++) {
            matrix.push([]);
            for (var g2 = g1 + 1; g2 < genes.length; g2++) {
                var corr = descriptives.correlation(results[g1], results[g2]);
                matrix[g1][g2] = corr
            }
            //            sails.log.debug(genes[g1].name + ' correlations: ' + matrix[g1])
        }
        callback(null, matrix)
    })
};

exp.getCoregulationMatrixAndGenePValues = function(genes, callback) {

    quicksortobj(genes, 'index_');
    var allGenes = genedesc.getAll();
    async.map(genes, function(gene, cb) {
        correlationdb.get('RNASEQ!' + gene.id, function(err, data) {
            if (err) cb(err);
            var a1 = [];
            var a2 = [];
            var curA1 = 0;
            for (var i = 0; i < data.length / 2; i++) {
                var value = lookup(data.readUInt16BE(i * 2));
                if (curA1 < genes.length && i === genes[curA1].index_) {
                    a1.push(value);
                    curA1++
                } else if (allGenes[i].biotype === 'protein_coding') {
                    a2.push(value)
                }
            }
            if (curA1 != genes.length) {
                console.err('something\'s wrong in getCoregulationMatrixAndGenePValues')
            }
            //            console.log(gene.name, a1)
            var p = wilcoxon(a1, a2).p;
            cb(null, {
                correlations: a1,
                p: p
            })
        })
    }, function(err, results) {

        if (err) {
            handleDBError(err, callback)
        } else {
            var matrix = [];
            var pValues = [];
            for (var i = 0; i < results.length; i++) {
                matrix.push(results[i].correlations);
                pValues.push(results[i].p)
            }
            callback(null, {
                matrix: matrix,
                pValues: pValues
            })
        }
    })
};

exp.getCoregulationBuffer = function(genes, groups, tissue, shortURL, callback) {

    var hash = {};
    for (var i = 0; i < genes.length; i++) {
        hash[genes[i].id] = i
    }

    async.map(genes, function(gene, cb) {
        var db = tissue ? tissuecorrelationdb : correlationdb;
        var key = tissue ? ('RNASEQ!' + tissue.toUpperCase() + '!') : 'RNASEQ!';

        db.get(key + gene.id, function(err, data) {
            if (err) return cb(err);
            var hashI = hash[gene.id];
            var buffer = new Buffer((genes.length - hashI - 1) * 2);
            for (var i = hashI + 1; i < genes.length; i++) {
                buffer.writeUInt16BE(data.readUInt16BE(genes[i].index_ * 2), (i - hashI - 1) * 2)             
            }
            cb(null, buffer)
        })
    }, function(err, results) {
        if (err) {
            handleDBError(err, callback)
        } else {         
            var totalBuffer = Buffer.concat(results, results.length * (results.length - 1));
            callback(null, genes, groups, shortURL, totalBuffer)
        }
    })
};

exp.getCoregulationMatrix = function(genes, callback) {

    async.map(genes, function(gene, cb) {
        correlationdb.get('RNASEQ!' + gene.id, function(err, data) {
            if (err) cb(err);
            var arr = [];
            for (var i = 0; i < genes.length; i++) {
                arr.push(lookup(data.readUInt16BE(genes[i].index_ * 2)))
            }
            cb(null, arr)
        })
    }, function(err, results) {

        if (err) {
            handleDBError(err, callback)
        } else {
            callback(null, results)
        }
    })
};

exp.getCoregulationJSON = function(genes, threshold, options, callback) {

    var edges = [];
    var nodes = [];
    var hashGenes = {};
    for (var i = 0; i < genes.length; i++) {
        hashGenes[genes[i].id] = i
    }
    // var totalData = _.map(genes, function() { return [] })
    var allGenes = genedesc.getAll();
    async.map(genes, function(gene, cb) {
        correlationdb.get('RNASEQ!' + gene.id, function(err, data) {
            if (err) return cb(err);
            nodes.push({
                data: gene
            });
            if (options && options.zScore === true) {
		_.last(nodes).data.zScore = geneZScore(data, genes, allGenes).z
	    }
            // totalData[hashGenes[gene.id]][hashGenes[gene.id]] = 1
            for (var i = hashGenes[gene.id] + 1; i < genes.length; i++) {
                var value = lookup(data.readUInt16BE(genes[i].index_ * 2));
                if (Math.abs(value) >= threshold) {
                //if (value >= threshold) {
                    edges.push({
                        data: {
                            source: gene.id,
                            target: genes[i].id,
                            weight: value,
                            included: true
                        }
                    })
		}
            }
            // fs.writeFileSync(genes.length + '.txt', totalData)
            cb(null, null)
        })
    }, function(err, nullResults) {

        if (err) {
            handleDBError(err, callback)
        } else {
            callback(null, {
                nodes: nodes,
                edges: edges
            })
        }
    })
};

exp.getTermCorrelationMatrix = function(terms, options, callback) {

    async.map(terms, function(term, cb) {

        var arr = [];
        pathwaydb.get('RNASEQ!PREDICTIONS!' + term.database + '!' + term.id, function(err, data) {
            if (err) {
                handleDBError(err, cb)
            } else {
                for (var i = 1; i < data.length / 2; i++) {
                    arr.push(lookup(data.readUInt16BE(i * 2)))
                }
                if (options && options.standardnormalize) {
                    descriptives.standardNormalize(arr)
                }
                cb(null, arr)
            }
        })
    }, function(err, results) {
        var matrix = [];
        for (var t1 = 0; t1 < terms.length; t1++) {
            matrix.push([])
        }
        for (var t1 = 0; t1 < terms.length; t1++) {
            matrix[t1][t1] = 1;
            for (var t2 = t1 + 1; t2 < terms.length; t2++) {
                var corr = descriptives.correlation(results[t1], results[t2]);
                matrix[t1][t2] = corr;
                matrix[t2][t1] = corr
            }
            sails.log.debug(terms[t1].name + ' correlations: ' + matrix[t1])
        }
        callback(null, matrix)
    })
};

var geneZScore = function(data, genes, allGenes) {

    var a1 = [];
    var a2 = [];
    var curA1 = 0;

    for (var i = 0; i < data.length / 2; i++) {
        var value = lookup(data.readUInt16BE(i * 2));
        if (curA1 < genes.length && i === genes[curA1].index_) {
            a1.push(value);
            curA1++
        } else if (allGenes[i].biotype === 'protein_coding') {
            a2.push(value)
        }
    }

    if (curA1 != genes.length) {
        sails.log.error('dbutil.geneZScore: array length ' + curA1 + ', expected ' + genes.length)
    }
    
    // console.log(gene.name, a1)
    var p = wilcoxon(a1, a2).p;
    var z = probability.pToZ(p);
    
    return {
        correlations: a1,
        p: p,
	   z: z
    }
};
