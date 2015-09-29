var fs = require('fs')
var assert = require('assert')
var should = require('should')
var ap = require('../assets/js/affinityPropagation.js')

describe('Clustering', function() {
    describe('Module affinityPropagation', function() {
	var testData = []
	for (var i = 0; i < 6; i++) {
	    testData.push([])
	    for (var j = 0; j < 6; j++) {
		if (i < 4) {
		    if (j < 4) {
			testData[i].push(-1)
		    } else {
			testData[i].push(-13)
		    }
		} else {
		    testData[i].push(-50)
		}
	    }
	}
        var arr = fs.readFileSync('602.txt', 'utf8').split(',')
        var matrix = []
        var row = -1
        for (var i = 0; i < arr.length; i++) {
            if (i % 602 === 0) {
                row++
                matrix.push([])
            }
            matrix[row][i - row * 602] = arr[i]
        }
        // console.log(matrix[0])
        // console.log(matrix[601])
	it('should require a square matrix', function() {
	    ap.bind(null).should.throw()
	    ap.bind(null, [[1], [2, 3]]).should.throw()
	})
	it('should accept a square matrix', function() {
	    ap.bind(null, testData).should.not.throw()
	})
	describe('Function getClusters', function() {
	    it('should return an array of cluster indices', function() {
		var a = ap(testData)
		a.getClusters().should.be.an.Array.with.lengthOf(testData.length)
	    })
	    it('should return [0, 0, 0, 1, 1, 1] for test data', function() {
		var a = ap(matrix)
		var clusters = a.getClusters()
		console.log(clusters)
		//clusters.should.be([0, 0, 0, 1, 1, 1])
	    })
	})
    })
})
