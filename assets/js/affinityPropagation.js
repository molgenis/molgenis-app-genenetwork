var _ = require('lodash')
var matrix = require('../../stats/matrix.js')

var NAME = 'AffinityPropagation'

module.exports = function(S, options) {

    if (!S || !S[0] || !_.isArray(S) || S.length !== S[0].length) {
	throw Error(NAME + ' takes a square matrix.')
    }

    options = options || {}
    this.n = S.length
    this.S = options.copy === true ? S.slice(0) : S // similarity matrix

    this.getClusters = function(options) {

	options = options || {}
	var maxIter = options.maxIter || 250
	var damping = options.damping || 0.5
	
	var R = matrix.zeroMatrix(this.n) // responsibility matrix
	var A = matrix.zeroMatrix(this.n) // availability matrix

        console.log(this.n)
	for (var iter = 0; iter < maxIter; iter++) {
            console.log('ir' + iter)
	    updateResponsibility(this.S, R, A, damping)
            console.log('ia' + iter)
	    updateAvailability(R, A, damping)
	}

	// console.log(R)
	// console.log(A)

	var exemplars = exemplarify(R, A) // cluster exemplar points
        // console.log(exemplars)
	var clusters = assign(S, exemplars) // items assigned to clusters (exemplar indices)
	
	this.R_ = R
	this.A_ = A
	
	return clusters
    }
    
    return this
}

var exemplarify = function(R, A) {

    var indices = []
    for (var i = 0; i < this.n; i++) {
	if (R[i][i] + A[i][i] > 0) {
	    indices.push(i)
	}
    }
    return indices
}

var assign = function(S, exemplars) {
    var clusters = []
    for (var i = 0; i < this.n; i++) {
	var index = -1
	var max = -Number.MAX_VALUE
	exemplars.forEach(function(e) {
	    if (S[i][e] > max) {
		index = e
		max = S[i][e]
	    }
	})
	clusters.push(index)
    }
    return clusters
}

var updateResponsibility = function(S, R, A, damping) {
    var n = this.n
    for (var i = 0; i < n; i++) {
	for (var k = 0; k < n; k++) {
	    var max = -Number.MAX_VALUE
	    for (var k_ = 0; k_ < n; k_++) {
		if (k_ !== k && A[i][k_] + S[i][k_] > max) {
		    max = A[i][k_] + S[i][k_]
		}
	    }
	    R[i][k] = damping * R[i][k] + (1 - damping) * (S[i][k] - max)
	}
    }
}

var updateAvailability = function(R, A, damping) {
    // for (var i = 0; i < n; i++) {
    // 	for (var k = 0; k < n; k++) {
    // 	    var sum = 0
    // 	    for (var i_ = 0; i_ < n; i_++) {
    // 		if (i_ !== k && (i === k || i_ !== i)) {
    // 		    sum += Math.max(0, R[i_][k])
    // 		}
    // 	    }
    // 	    if (i !== k) {
    // 		A[i][k] = damping * A[i][k] + (1 - damping) * Math.min(0, R[k][k] + sum)
    // 	    } else {
    // 		A[i][k] = damping * A[k][k] + (1 - damping) * sum
    // 	    }
    // 	}
    // }
    for (var i = 0; i < n; i++) {
	for (var k = 0; k < n; k++) {
	    if (k !== i) {
		var sum = 0
		for (var i_ = 0; i_ < n; i_++) {
		    if (i_ !== k && i_ !== i) {
			sum += Math.max(0, R[i_][k])
		    }
		}
		A[i][k] = damping * A[i][k] + (1 - damping) * Math.min(0, R[k][k] + sum)
	    } else {
		var sum = 0
		for (var i_ = 0; i_ < n; i_++) {
		    if (i_ !== k) {
			sum += Math.max(0, R[i_][k])
		    }
		}
		A[i][k] = damping * A[k][k] + (1 - damping) * sum
	    }
	}
    }
}
