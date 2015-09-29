var matrix = require('./matrix')

module.exports = function(m) {

//    if (!matrix.isSquare(m) || !matrix.isSymmetric(m)) {
//        throw {
//            name: 'ArgumentError',
//            message: 'Cholesky decomposition needs a square symmetric matrix'
//        }
//    }

    var L = matrix.zeroMatrix(m.length)

    for (var i = 0; i < m.length; i++) {
        for (var j = 0; j <= i; j++) {
            var sum = 0
            for (var k = 0; k < j; k++) {
                sum += L[i][k] * L[j][k]
            }
            if (i === j) {
                L[i][i] = Math.sqrt(m[i][i] - sum)
            } else {
                L[i][j] = 1.0 / L[j][j] * (m[i][j] - sum)
            }
        }
        if (L[i][i] <= 0) {
            throw {
                name: 'ArgumentError',
                message: 'Matrix not positive definite'
            }
        }
    }

    return L
}