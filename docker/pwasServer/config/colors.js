var gnred = '#ff3c00'
var gngreen = '#a0d200'
var gnblue = '#00a0d2'
var gnpurple = '#7a18ec'
var gnorange = '#ffae00'
var gnpink = '#ff52d4'

var gndarkgray = '#4d4d4d'
var gngray = '#999999'
var gnlightgray = '#dcdcdc'

module.exports.colors = {
    default_color: gngray,
    default_biotype: gnpurple,
    protein_coding: gnblue,
    default_node: gnblue,
    cytoscape_edge: gngray,
    getSecondaryColors: function() {
        return [gnred, gngreen, gnblue, gnpurple, gnorange, gnpink, gndarkgray]
    },
    getChartColors: function() {
        return [gnpurple, gngreen, gnblue, gnred, gnorange, gnpink, gndarkgray]
    }
}
