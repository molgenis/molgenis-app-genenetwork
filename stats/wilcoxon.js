var _ = require('lodash')
var quicksort = require('../api/controllers/utils/quicksort')
var heapsort = require('../api/controllers/utils/heapsort')
var mergesort = require('../api/controllers/utils/mergesort')
var insertionsort = require('../api/controllers/utils/insertionsort')

function normalZ(z) {
    var x = z
    var b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429]
    var p = 0.2316419
    var t = 1/(1+p*x)
    var fact = t
    var sum = 0
    for(var i=0; i <= b.length - 1; i++) {
        sum += b[i]*fact
        fact *= t
    }
    p = 2 * sum * Math.exp(-x*x/2.0) / (Math.sqrt(2*Math.PI))
    return p
}

module.exports = function(a1, a2, totalList) {

    a1 = _.clone(a1)
    heapsort(a1)
    if (a2) {
        a2 = _.clone(a2)
        quicksort(a2)
    }

    if (!totalList) {
        totalList = []
        // TODO sorting not necessary, lists already sorted
        for (var x=0; x<a1.length; x++) totalList.push(a1[x])
        for (var y=0; y<a2.length; y++) totalList.push(a2[y])
        insertionsort(totalList)
    } else {
        quicksort(totalList)
    }

    var nA = a1.length
    var n = totalList.length
    var nB = n - nA
    var maxSum = n * (n + 1) / 2
    var h0 = maxSum / 2

    var previous = -Number.MAX_VALUE
    var start = 0
    var totalRank = []
    for (var i = 0; i<totalList.length; i++) {
        if (totalList[i]==previous) {
            var meanRank = (start + i + 2) / 2
            for (var j = start; j<=i; j++) {
                totalRank[j] = meanRank
            }
        } else {
            totalRank[i] = i + 1
            previous = totalList[i]
            start = i
        }
    }

    var shortest = a1
    if (a2 && a2.length < a1.length) shortest = a2
    var nShortest = shortest.length
    var w = 0

    var r1 = 0
    var index = 0
    for (var a = 0; a < shortest.length; a++) {
        for (var j = index; j < totalList.length; j++) {
            if (shortest[a] === totalList[j]) {
                r1 += (j+1)
                break
            }
            index++
        }
        w += totalRank[index]
    }

//        var index = 0
//        while (1 == 1) {
//            if (index >= totalList.length - 1 || shortest[a] === totalList[index]) break
//            index++
//        }
//        w+=totalRank[index]
//    }

    var nZ = nShortest
    if (w > h0) {
        nZ = n - nShortest
        w = maxSum - w
    }

//    var r1 = 0
//    var place = 0
//    for (var i=0; i<a1.length; i++) {
//        for (var j=place; j<totalList.length; j++) {
//            if (a1[i]==totalList[j]) {
//                r1+=(j + 1)
//                place = j + 1
//                break
//            }
//        }
//    }
    var uA = r1 - nA * (nA + 1) / 2
    var auc = uA / (nA * nB)

    var k = nA
    var n0 = n
    var permutations = 1
    while (k > 0) {
        k--
        n0--
        permutations *= n0/k
    }
    if (permutations >= 25000 || shortest.length >= 10) {
        var continuity = 0.5
        if (w>=h0) continuity = -0.5
        var z = Math.abs((w + continuity - nZ * (n + 1) / 2) / Math.sqrt(nA * nB * (n + 1) / 12))
        var p = normalZ(z)

        return {p: p, auc: auc}
    }

    return {p: -1, auc: -1}
    
}
