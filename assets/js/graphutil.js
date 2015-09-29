var exp = module.exports
var _ = require('lodash')
var matrix = require('../../stats/matrix')
var quicksortobj = require('./sort/quicksortobj.js')

var browserdebug = false
var verbose = (typeof(window) === 'undefined' && sails && sails.log && sails.log.verbose) || (browserdebug && console && console.log) || function(){}

// TODO group2vertice always array

exp.neighborLists = function(vertices, edges) {

    var ts = new Date()
    var hashNodes = {}
    var neighbors = []
    for (var n = 0; n < vertices.length; n++) {
        var node = vertices[n]
        hashNodes[node.data.id] = n
        neighbors.push([])
    }
    for (var e = 0; e < edges.length; e++) {
        var si = hashNodes[edges[e].data.source]
        var ti = hashNodes[edges[e].data.target]
        neighbors[si].push(ti)
        neighbors[ti].push(si)
    }
    verbose((new Date() - ts) + 'ms graphutil.neighborLists')
    return neighbors
}

exp.groupToOneAndRemoveLone = function(vertices, neighborlists) {

    var ts = new Date()
    for (var i = 0; i < vertices.length; i++) {
        vertices[i].data.group = 0
    }


    var numLone = 0
    for (var i = 0; i < neighborlists.length; i++) {
        if (neighborlists[i].length === 0) {
            vertices[i].data.group = -1
            numLone++
	}
    }
    
    verbose('removing ' + numLone + ' lone nodes from ' + vertices.length + ' input nodes')
    while (numLone > 0) {
        for (var i = 0; i < vertices.length; i++) {
            if (vertices[i].data.group === -1) {
                vertices.splice(i, 1)
//                neighborlists.splice(i, 1)
                numLone--
                break
            }
        }
    }

    group2vertices = {}
    group2vertices[0] = []
    for (var i = 0; i < vertices.length; i++) {
	group2vertices[0].push(i)
    }
    // quicksortobj(vertices, function(d) { return d.data.group })
    // if (numLone > 0) {
    //     verbose('removing ' + numLone + ' lone nodes from ' + vertices.length + ' input nodes')
    //     vertices.splice(0, numLone)
    // }
    verbose((new Date() - ts) + 'ms graphutil.groupToOneAndRemoveLone: ' + vertices.length + ' nodes')
    return group2vertices
}

exp.connectedVsLone = function(vertices, neighborlists) {

    var ts = new Date()
    for (var i = 0; i < vertices.length; i++) {
        vertices[i].groups = []
    }

    var group2vertices = []
    // lone nodes to group 1, all nodes to group 0
    group2vertices.push({name: 'All genes', type: 'auto', nodes: []})
    group2vertices.push({name: 'Lone genes', type: 'auto', nodes: []})

    for (var i = 0; i < vertices.length; i++) {
        vertices[i].groups.push(0)
        group2vertices[0].nodes.push(vertices[i].data.id)
        if (neighborlists[i].length === 0) {
            vertices[i].groups.push(1)
            group2vertices[1].nodes.push(vertices[i].data.id)
        }
    }

    verbose((new Date() - ts) + 'ms graphutil.connectedVsLone')
    return group2vertices
}

exp.disconnectedSubgraphs = function(vertices, neighborlists) {

    if (vertices.length !== neighborlists.length) {
        throw {name: 'ArgumentError', message: 'arguments to disconnectedSubgraphs have to be of the same length'}
    }

    var ts = new Date()
    for (var i = 0; i < vertices.length; i++) {
        vertices[i].data.group = undefined
    }

    var group2vertices = {}

    // lone nodes to group -1, all nodes to group 0
    group2vertices[-1] = []
    group2vertices[0] = []
    for (var i = 0; i < neighborlists.length; i++) {
        group2vertices[0].push(i)
        if (neighborlists[i].length === 0) {
            vertices[i].data.group = -1
            group2vertices[-1].push(i)
        }
    }

    var group = 1
    var i = 0
    while (i < vertices.length) {
        if (vertices[i].data.group === undefined) { // breadth-first search: group defined by this vertex
            var queue = []
            queue.push(i)
            vertices[i].data.group = group
            group2vertices[group] = []
            group2vertices[group].push(i)
            while (queue.length > 0) {
                var v = queue.splice(0, 1)
                var neighs = neighborlists[v]
                for (var j = 0; j < neighs.length; j++) {
                    if (vertices[neighs[j]].data.group === undefined) {
                        queue.push(neighs[j])
                        vertices[neighs[j]].data.group = group
                        group2vertices[group].push(neighs[j])
                    }
                }
            }
            group++
        }
        i++
    }

    verbose((new Date() - ts) + 'ms graphutil.disconnectedSubgraphs')
    return group2vertices
}

// https://gist.github.com/jkschneider/c7660044fe74ab9ee53e
exp.floydWarshall = function(vertices, edges, accessor) {

    var ts = new Date()
    var accessor = accessor || function(d) {
        return d
    }

    var dm = new function() { // the all pairs shortest path distance matrix
        var self = this
        this.distMatrix = matrix.zeroMatrix(vertices.length)
        this.nextMatrix = matrix.zeroMatrix(vertices.length)
        this.max = 0

        this.vertexHash = {}
        for (var i = 0; i < vertices.length; i++) {
            self.vertexHash[accessor(vertices[i])] = i
        }

        this.dist = function(v1, v2) {
            return self.distMatrix[self.vertexHash[v1]][self.vertexHash[v2]]
        }

        this.getIndex = function(v) {
            return self.vertexHash[v]
        }

        this.set = function(v1, v2, val) {
            if (val > self.max && val != Infinity)
                self.max = val
            self.distMatrix[self.vertexHash[v1]][self.vertexHash[v2]] = val
        }

        this.setNext = function(v1, v2, v) {
            self.nextMatrix[self.vertexHash[v1]][self.vertexHash[v2]] = v
        }

        this.next = function(v1, v2) {
            return self.nextMatrix[self.vertexHash[v1]][self.vertexHash[v2]]
        }

        this.path = function(u, v) {
            if (!self.next(accessor(vertices[u]), accessor(vertices[v]))) return []
            var path = []
            for (; u != v; u = self.next(accessor(vertices[u]), accessor(vertices[v]))) {
                path.push(u)
            }

            for (var i = 0; i < path.length; i++)
                path[i] = {
                    source: path[i],
                    target: i == path.length - 1 ? v : path[i + 1]
                }

            return path
        }
    }()

    var dist = function(i, j) {
        return dm.dist(accessor(vertices[i]), accessor(vertices[j]))
    }

    for (var i = 0; i < vertices.length; i++) {
        var v1 = accessor(vertices[i])
        for (var j = 0; j < vertices.length; j++) {
            var v2 = accessor(vertices[j])
            if (v1 != v2) {
                dm.set(v1, v2, Infinity)
                dm.set(v2, v1, Infinity)
            }
        }
        dm.set(v1, v1, 0)
    }

    for (var i = 0; i < edges.length; i++) {
        var u = edges[i].source.id,
            v = edges[i].target.id
        dm.set(u, v, edges[i].weight)
        dm.set(v, u, edges[i].weight)
        dm.setNext(u, v, dm.getIndex(v))
        dm.setNext(v, u, dm.getIndex(u))
    }

    for (var k = 0; k < vertices.length; k++) {
        for (var i = 0; i < vertices.length; i++) {
            for (var j = 0; j < vertices.length; j++) {
                if (dist(i, j) > dist(i, k) + dist(k, j)) {
                    dm.set(accessor(vertices[i]), accessor(vertices[j]), dist(i, k) + dist(k, j))
                    dm.setNext(accessor(vertices[i]), accessor(vertices[j]), dm.next(accessor(vertices[i]), accessor(vertices[k])))
                }
            }
        }
    }

    verbose((new Date() - ts) + 'ms graphutil.floydWarshall')
    return dm
}

// make network sparse so that number of edges <= factor * number of vertices
exp.sparsify = function(network, factor, minThreshold, thresholdChange) {

    var nodes = network.elements.nodes
    var edges = network.elements.edges
    var ts = new Date()
    var threshold = minThreshold
    var numIntact = edges.length
    //var numRemoved = 0

    quicksortobj(edges, function(d) { return Math.abs(d.data.weight) })
    edges.reverse()
    while (numIntact > factor * nodes.length) {
        threshold += thresholdChange || 0.05
        verbose('threshold ' + threshold, 'numIntact', numIntact)
        for (var i = edges.length - 1; i >= 0; i--) {
            if (edges[i].data.discarded !== true && Math.abs(edges[i].data.weight) < threshold) {
                edges[i].data.discarded = true
                numIntact--
            }
        }
    }
    edges.splice(numIntact, edges.length - numIntact)

    verbose((new Date() - ts) + 'ms graphutil.sparsify (' + nodes.length + ' nodes, threshold from ' + minThreshold + ' to ' + threshold + ')')
    return threshold
}
