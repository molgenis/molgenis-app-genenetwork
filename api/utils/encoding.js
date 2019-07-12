// Empirically derived precision for values based on the Z-score distributions .. problem is that the distributions differ
var valueBins = [10,20,30,40,50,60,70,80,90,100,250,500,2000,7000,14000,16936,14000,7000,2000,500,250,100,90,80,70,60,50,40,30,20,10]
var binStarts = []
binStarts.push(0)
for (var bin = 1; bin < valueBins.length; bin++) {
    binStarts.push(binStarts[bin-1] + valueBins[bin-1])
}

module.exports = {

    valueBins: valueBins,
    binStarts: binStarts,

    getLookupArray: function() {
        var start = -15.5
        var lookup = []
        for (var bin = 0; bin < this.valueBins.length; bin++) {
            var step = 1/this.valueBins[bin]
            for (var i = 0; i < this.valueBins[bin]; i++) {
                lookup.push(start + bin + i * step)
            }
        }
        console.log(lookup.length + ' values in ' + this.valueBins.length + ' bins between [' + start + ', ' + lookup[lookup.length-1] + ']')
        return lookup
    },

    getIndex: function(value) {
        if (value < -15.5) value = -15.5
        if (value > 15.4) value = 15.4
        var bin = Math.round(value) + 15
        return Math.floor(this.binStarts[bin] + (value - bin + 15.5) * this.valueBins[bin])
    }
}
