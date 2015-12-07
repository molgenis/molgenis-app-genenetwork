'use strict'

var _ = require('lodash')
var dbutil = require('../utils/dbutil')
var query2genes = require('../utils/query2genes')

module.exports = function(req, res) {

    var query = req.body.genes.trim().split('|')
    if (query.length > 2) {
        return res.badRequest()
    }

    var groupNumToName = (query.length !== 2) ? null : _.zipObject(_.map(query[0].split(/[,;]+/), function(group) { return group.split('!') }))
    var geneQuery = query[query.length-1].split(/[\s,;]+/)
    
    async.waterfall([
        query2genes.bind(this, geneQuery, null),
        dbutil.getCoregulationBuffer
    ], function(err, genes, group2genes, buffer) {

        if (err) {
            return res.serverError()
        } else {

            // create groups
            var groups = []

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
            }
            
            sails.sockets.emit(req.socket.id, 'network', {
                genes: genes,
                groups: groups,
                buffer: buffer
            })
            
            return res.end()
        }
    })
}
