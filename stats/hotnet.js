// HotNet2 algorithm
// http://www.nature.com/ng/journal/v47/n2/full/ng.3168.html#methods

var exp = module.exports
var math = require('mathjs')
var matrix = require('./matrix')

exp.heatDiffusion = function(neighborlists, beta) {

    var n = neighborlists.length
    // var Wb = math.matrix()
    // Wb.resize([n, n])

    var Wb = matrix.zeroMatrix(n, n)
    for (var i = 0; i < n; i++) {
        for (var k = 0; k < neighborlists[i].length; k++) {
            var j = neighborlists[i][k]
            var w = 1 / neighborlists[j].length
            Wb[i][j] = (1 - beta) * w
            // math.subset(Wb, math.index(i, j), (1 - beta) * w)
        }
    }
//    var Wbm = math.matrix(Wb)

    return math.multiply(beta, math.inv(math.subtract(math.eye(n), math.matrix(Wb))))
}

exp.heatExchange = function(F, Dh) {

    console.log(math.matrix(Dh))
    return math.multiply(F, math.matrix(Dh))
}
