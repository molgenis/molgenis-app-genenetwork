'use strict'

var _ = require('lodash')
var level = require('level')
var crypto = require('crypto')
var bs62 = require('base62')
var dbutil = require('../utils/dbutil')
var query2genes = require('../utils/query2genes')

var networkShortURLDB = level(sails.config.networkShortURLDBPath, {valueEncoding: 'json'})

var createGroups = function(groupNumToName, tissue, genes, group2genes, callback) {

    var groups = []
    var groupStr = ''

    if (groupNumToName) {

        var groupHash = {}
        for (var i = 0; i < group2genes.length; i++) {
            var num = group2genes[i].groupNum
            if (groupHash[num] == undefined) {
                var group = {
                    id: num,
                    name: groupNumToName[num],
                    genes: []
                }
                groupHash[num] = group
                groups.push(group)
            }
            groupHash[num].genes.push.apply(groupHash[num].genes, _.map(group2genes[i].genes, function(gene) { return gene.id }))
        }
        
        var groupKeys = _.sortBy(_.keys(groupHash))
        groupStr = _.map(groupKeys, function(key) {
            var group = groupHash[key]
            return group.id + '!' + group.name + '!' + group.genes.join(',')
        }).join(';') + '|'
    }

    // create short url
    var ensgs = _.map(genes, function(gene) { return gene.id })
    var sha = crypto.createHash('sha1').update(groupStr + ensgs.join(',')).digest('hex')
    var shortURL = bs62.encode(parseInt(sha.substring(0, 8), 16))

    callback(null, genes, groups, tissue, shortURL)
}

var checkDB = function(query, callback) {

    networkShortURLDB.get(query, function(err, result) {

        if (err) {
            if (err.name === 'NotFoundError') {
                return callback(null, null)
            } else {
                return callback(err)
            }
        } else {
            return callback(null, result)
        }
    })
}

var handle = function(groupNumToName, geneQuery, tissue, callback) {

    async.waterfall([
        
        query2genes.bind(this, geneQuery, null),
        createGroups.bind(this, groupNumToName, tissue),
        dbutil.getCoregulationBuffer
        
    ], function(err, genes, groups, shortURL, buffer) {

        if (err) {
            
            return callback(err)
            
        } else {
            
            var network = {
                tissue: tissue,
                genes: genes,
                groups: groups,
                shortURL: shortURL,
            }
          
            networkShortURLDB.put(shortURL, network, function(err) {
                
                if (err) {
                    network.shortURL = null
                }
                
                network.buffer = buffer
                
                return callback(null, network)
            })
        }
    })
}

module.exports = function(req, res) {

    var query = req.body.genes.trim().split('|')
    if (query.length > 2) {
        return res.badRequest()
    }

    var tissue = req.body.tissue ? req.body.tissue : undefined
    var groupNumToName = (query.length !== 2) ? null : _.zipObject(_.map(query[0].split(/[,;]+/), function(group) { return group.split('!') }))
    var geneQuery = query[query.length-1].split(/[\s,;]+/)

    checkDB(query, function(err, result) {
        
        if (err) {
            
            sails.log.error(err)
            return res.serverError()
            
        } else {
            
            if (result) { // genes and groups got from database
              
                dbutil.getCoregulationBuffer(result.genes, result.groups, tissue, null, function(err, genes, groups, shortURL, buffer) {
                    if (err) {
                        sails.log.error(err)
                        return res.serverError()
                    } else {
                        result.buffer = buffer
                        sails.sockets.emit(req.socket.id, 'network', result)
                        return res.end()
                    }
                })
                
            } else {
             
                handle(groupNumToName, geneQuery, tissue, function(err, network) {
                    if (err) {
                        sails.log.error(err)
                        return res.serverError()
                    } else {
                        sails.sockets.emit(req.socket.id, 'network', network)
                        return res.end()
                    }
                })
                
            }
        }
    })
}