var _ = require('lodash')
var exp = module.exports

exp.prettyNumber = function(n) {
    if (!_.isNumber(n)) {
        return n
    }
    var ugly = n.toString()
    var pretty = ''
    var index = 0
    for (var i = ugly.length - 1; i >=0; i--) {
        pretty += ugly.substring(i, i+1)
        if (++index % 3 === 0 && index < ugly.length) {
            pretty += ','
        }
    }
    return pretty.split('').reverse().join('')
}

exp.pValueToReadable = function(p) {
    if (!_.isNumber(p)) {
        return NaN
    }
    var pReadable = p
    //negative P-value is impossible; javascript flips to negative zero if the minimum value is exceeded, so need to state it is smaller than the min value in JS
    if(p <= 0){
        pReadable = '<' + Number.MIN_VALUE;
    }
    else if (p < 0.01) {
        pReadable = pReadable.toExponential(1)
        var expIndex = pReadable.indexOf('e')
        var base = pReadable.substring(0, expIndex)
        var exponent = pReadable.substring(expIndex + 1)
        // TODO vertically align 'x' to middle (vertical-align, line-height, padding don't seem to work)
        pReadable = base + ' <span style="font-size: 0.675em">x</span> 10<sup>' + exponent + '</sup>'
        if (p === Number.MIN_VALUE) {
            pReadable = '< ' + pReadable
        }
    }
    else {
        pReadable = pReadable.toPrecision(1)
    }
    return pReadable
}

exp.intToStr = function(value) {
    if (!_.isNumber(value)) {
        return value
    }
    if (value === 10) {
        return 'ten'
    } else if (value === 9) {
        return 'nine'
    } else if (value === 8) {
        return 'eight'
    } else if (value === 7) {
        return 'seven'
    } else if (value === 6) {
        return 'six'
    } else if (value === 5) {
        return 'five'
    } else if (value === 4) {
        return 'four'
    } else if (value === 3) {
        return 'three'
    } else if (value === 2) {
        return 'two'
    } else if (value === 1) {
        return 'one'
    } else if (value === 0) {
        return 'zero'
    }
    else return value + ''
}

exp.intToOrdinalStr = function(value) {
    if (!_.isNumber(value)) {
        return value
    }
    if (value === 10) {
        return 'tenth'
    } else if (value === 9) {
        return 'ninth'
    } else if (value === 8) {
        return 'eighth'
    } else if (value === 7) {
        return 'seventh'
    } else if (value === 6) {
        return 'sixth'
    } else if (value === 5) {
        return 'fifth'
    } else if (value === 4) {
        return 'fourth'
    } else if (value === 3) {
        return 'third'
    } else if (value === 2) {
        return 'second'
    } else if (value === 1) {
        return 'first'
    } else if (value === 0) {
        return 'immediately preceding what is regarded as first in a series'
    }
    else if (value < 20) {
        return value + 'th'
    } else {
        value = value + ''
        if (value.endsWith('1')) {
            return value + 'st'
        } else if (value.endsWith('2')) {
            return value + 'nd'
        } else if (value.endsWith('3')) {
            return value + 'rd'
        } else {
            return value + 'th'
        }
    }
    return value + 'th'
}
