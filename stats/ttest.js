var stats = require('./stats')
var probability = require('./probability')

var exp = module.exports

exp.test = function(a1, a2, debug) {

    var n1 = a1.length
    var n2 = a2.length
    var mean1 = stats.mean(a1)
    var mean2 = stats.mean(a2)
    var var1 = stats.variance(a1, mean1)
    var var2 = stats.variance(a2, mean2)

    var sx1x2 = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
    var t = (mean1 - mean2) / (sx1x2 * Math.sqrt(1 / n1 + 1 / n2));
    var df = n1 + n2 - 2;
    
    if (t < 0) {
        return 2 * probability.studentTCDF(df, t)
    } else {
        return 2 * probability.studentTCDF(df, -t)
    }
}

exp.welch = function(a1, a2) {

    var n1 = a1.length
    var n2 = a2.length
    var mean1 = stats.mean(a1)
    var mean2 = stats.mean(a2)
    var var1 = stats.variance(a1, mean1)
    var var2 = stats.variance(a2, mean2)

//    if (debug) {
//        console.log(mean1, mean2, var1, var2)
//    }

    var t = (mean1 - mean2) / Math.sqrt(var1 / n1 + var2 / n2);
    var df = ((var1 / n1 + var2 / n2) * (var1 / n1 + var2 / n2)) / (((var1 / n1) * (var1 / n1)) / (n1 - 1) + ((var2 / n2) * (var2 / n2)) / (n2 - 1));
    var p
    
    if (t < 0) {
        p = probability.studentTCDF(df, t)
    } else {
        p = probability.studentTCDF(df, -t)
    }
    return {t: t, p: p, df: df}
}
