var _ = require('lodash');
var async = require('async');
var dbutil = require('./dbutil');
var genedesc = require('./genedesc');
var quicksortobj = require('./quicksortobj');

/**
* Returns an array of gene objects according to the given query.
*
* Query can be a string (gene name or ensg id)
* or an array containing any combination of:
* + gene names
* + ensg ids
* + pathway ids (get genes annotated to pathway)
*
* @method getGenes
* @param {String|Array} query Query string or array
* @param {Object} [options] Options, optional. Default: {sortField: 'index_'}
* @param {Function} callback Callback function
*/
var getGenes = function(query, options, callback) {

    if (!callback) {
        callback = options;
        options = {}
    } else {
        options = options || {}
    }

    if (!_.isFunction(callback)) callback({name: 'ArgumentError', message: 'getGenes: Last argument has to be a callback function'});
    if (_.isString(query)) query = [query];
    if (!_.isArray(query)) callback({name: 'ArgumentError', message: 'getGenes: Query has to be a string or an array'});
    if (query.length === 0) callback(null, []);

    async.map(query, function(q, cb) {
        var groupNum = null;
        var ei = q.indexOf('!');
        if (ei > 0) {
            var ci = +(q.substring(0, ei));
            if (_.isNumber(ci)) {
                groupNum = ci;
                q = q.substring(ei + 1)
            }
        }
    	var gene = genedesc.get(q);
    	if (gene) {
    	    return cb(null, {genes: [gene], groupNum: groupNum})
    	} else {
    	    var pw = dbutil.pathwayObject(q);
    	    if (pw) {
    	        dbutil.getAnnotatedGenes(pw, function(err, genes) {
    		        sails.log.debug(JSON.stringify(genes))
    	            return err ? cb(err) : cb(null, {genes: genes, groupNum: groupNum})
    		})
    	    } else {
    	        return cb(null, {not_found: q})
    	    }
    	}
    }, function(err, genesNGroups) {
        if (err) return callback(err);
        var uniqueGenes = _.uniq(_.compact(_.flatten(_.map(genesNGroups, 'genes'))));
        quicksortobj(uniqueGenes, options.sortField || 'index_');
        sails.log.debug(uniqueGenes.length + ' genes found, query length was ' + query.length);
        callback(null, uniqueGenes, _.compact(genesNGroups))
    })
};

module.exports = getGenes;
