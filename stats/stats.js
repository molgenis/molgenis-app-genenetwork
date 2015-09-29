var exp = module.exports

exp.mean = function(a) {

    var sum = 0
    for (var i = 0; i < a.length; i++) {
        sum += a[i]
    }

    return sum / a.length
}

exp.variance = function(a, m) {

    m = m || this.mean(a)
    var ans = 0
    for (var i = 0; i < a.length; i++) {
        ans += (a[i] - m) * (a[i] - m)
    }

    return ans / (a.length - 1)
}

exp.stdev = function(a, m) {

    return Math.sqrt(this.variance(a, m))
}

exp.covariance = function(a1, a2, m1, m2) {

    m1 = m1 || this.mean(a1)
    m2 = m2 || this.mean(a2)
    var ans = 0
    for (var i = 0; i < a.length; i++) {
        ans += (a1[i] - m1) * (a2[i] - m2)
    }

    return ans / (a1.length - 1)
}

exp.correlationStdNorm = function(a1, a2) {

    var ans = 0
    for (var i = 0; i < a1.length; i++) {
        ans += a1[i] * a2[i]
    }
    return ans / (a1.length - 1)
}

exp.correlation = function(a1, a2, m1, m2, v1, v2) {

    m1 = m1 || this.mean(a1)
    m2 = m2 || this.mean(a2)
    v1 = v1 || this.variance(a1)
    v2 = v2 || this.variance(a2)

    var denom = Math.sqrt(v1 * v2)
    var ans = 0
    if (denom != 0) {
        for (var i = 0; i < a1.length; i++) {
            ans += (a1[i] - m1) * (a2[i] - m2)
        }
    } else if (v1 === v2 === 0) {
        ans = 1
    }

    return ans / (a1.length - 1) / denom
}

exp.standardNormalize = function(a) {

    var mean = this.mean(a)
    var stdev = this.stdev(a, mean)
    for (var i = 0; i < a.length; i++) {
        a[i] -= mean
        a[i] /= stdev
    }
}

exp.standardNormalizeClone = function(a) {

    var a1 = s.slice(0)
    var mean = this.mean(a1)
    var stdev = this.stdev(a1, mean)
    for (var i = 0; i < a1.length; i++) {
        a1[i] -= mean
        a1[i] /= stdev
    }
    return a1
}
