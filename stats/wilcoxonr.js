var quicksort = require('../api/controllers/utils/quicksort')

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

module.exports = function(a1, a2) {

//    sails.log.debug('wilcoxon rank test: array lengths', a1.length, a2.length)

    if (a2.length < a1.length) {
        var temp = a1
        a1 = a2
        a2 = temp
    }

    var nA = a1.length
    var nB = a2.length
    var n = nA + nB
    var maxSum = n * (n + 1) / 2
    var h0 = maxSum / 2
    var w = 0

    var r1 = 0
    var index = 0
    for (var a = 0; a < nA; a++) {
        r1 += a1[a]
        // TODO w on total ranks
        w += a1[a]
    }

    var nZ = nA
    if (w>h0) {
        nZ = n - nA
        w = maxSum - w
    }

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
    if (permutations >= 25000 || a1.length >= 10) {
        var continuity = 0.5
        if (w>=h0) continuity = -0.5
        var z = Math.abs((w + continuity - nZ * (n + 1) / 2) / Math.sqrt(nA * nB * (n + 1) / 12))
        var p = Math.max(Number.MIN_VALUE, normalZ(z))

        return {p: p, auc: auc}
    }

    return {p: -1, auc: -1}
    
}
