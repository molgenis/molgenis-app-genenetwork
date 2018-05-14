'use strict'

var _ = require('lodash')
var d3 = require('d3')
var color = require('./color.js')
var hcluster = require('./hcluster')
var d3tip = require('d3-tip')

function D3Heatmap(elem, props) {

    this.elem = elem
    this._props = props || {}
    this._props.numTerms = props.terms.length
    this._props.hoverRow = null
    this._props.hoverCol = null
    this._clusterData()
    this._initScales()
    this._calculateProperties()
    this._drawHeatmap()
    this._addLabels()

}

D3Heatmap.prototype._clusterData = function(){
    var terms = this._props.terms
    var cormat = this._props.cormat

    var data = []
    for (var i = 0; i < terms.length; i++){
        data.push({
            term: terms[i],
            values: cormat[i]
        })
    }

    var cluster = hcluster()
        .distance('euclidean')
        .linkage('avg')
        .posKey('values')
        .data(data)

    var indices = _.flatMap(cluster.orderedNodes(), 'indexes')
    
    var orderedData = []
    var orderedTerms = []
    for (var i = 0; i < indices.length; i++){
        for (var e = 0; e < indices.length; e++){
            orderedData.push({
                row: i,
                col: e,
                value: cormat[indices[i]][indices[e]]
            })
        }
        orderedTerms.push(terms[indices[i]])
    }

    this._props.orderedData = orderedData
    this._props.orderedTerms = orderedTerms

}

D3Heatmap.prototype._initScales = function(){
    this._colorscale = d3.scale.linear()
        .domain([-1, 0, 1])
        .range(['#000080', '#FFFFFF', '#CD2626'])
        .clamp(true)
    // this._colorscale = d3.scale.linear()
    //     .domain([-1, 0, 1])
    //     .range([color.colors.gnblue, color.colors.gnlightgray, color.colors.gnred])
    //     .clamp(true)

    // this._colorscale = d3.scale.linear()
    //     .domain([-1, -0.5, 0, 0.5, 1])
    //     .range(['#0056a6', '#0085ff', '#b3b3b3', '#ff3c00', '#a62700'])
    //     .clamp(true)

}

D3Heatmap.prototype._calculateProperties = function(){
    this._props.size = this.elem.clientWidth > this.elem.clientHeight ? this.elem.clientHeight : this.elem.clientWidth
    var maxCellsize = 20
    var maxWidth = maxCellsize * this._props.numTerms
    this._props.cellsize = (this._props.size) / this._props.numTerms 
    
    if (maxWidth < this._props.size) {
        this._props.cellsize = 20
        this._props.width = maxWidth
    }
}

D3Heatmap.prototype._drawHeatmap = function(){
    
    var cellsize = this._props.cellsize
    var that = this

    var orderedTerms = this._props.orderedTerms

    var tip = d3tip()
          .attr('class', 'd3-tip')
          .offset([0, 0])
          .html(function(d) {
            return d.value
          })

    console.log('SIZE')
    console.log(this._props.size)

    this._vis = d3.select(this.elem).append('svg:svg')
        .attr('id', 'heatmapsvg')
        .attr('width', this._props.size + 80)
        .attr('height', this._props.size)

    this._vis.call(tip)

    // var div = d3.select("body").append("div")   
    //     .attr("class", "tooltip")               
    //     .style("visibility", 0);

    var rect = this._vis.selectAll('rect')
        .data(that._props.orderedData)
        .enter()
        .append('rect')
        .attr('x', function(d){
            return d.col * cellsize
        })
        .attr('y', function(d){
            return d.row * cellsize
        })
        .attr('width', cellsize - 1)
        .attr('height', cellsize - 1)
        .attr('fill', function(d){
            return that._colorscale(d.value)
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)


        // .on('mouseover', function(d){
        //     var matrix = this.getScreenCTM()
        //         .translate(+ this.getAttribute("x"), + this.getAttribute("y"));
        //     div.html(d.value)
        //         .style('visibility', 'visible')
        //         .style("left", (window.pageXOffset + matrix.e - 17) + "px")
        //         .style("top", (window.pageYOffset + matrix.f - 30) + "px");  

        //     that._props.handleHover(orderedTerms[d.row], orderedTerms[d.col])

        // })
        // .on('mouseout', function(d){
        //     div.style('visibility', 'hidden')
        //     that._props.handleHover(null, null)
        // })
}

D3Heatmap.prototype._addLabels = function(){
    var terms = this._props.orderedTerms
    var cellsize = this._props.cellsize 
    var numTerms = this._props.numTerms

    this._vis.selectAll('text.right')
        .data(terms)
        .enter()
        .append('text')
        .text(function(d){
            return d
        })
        .attr('x', function(d){
            return cellsize * numTerms + 5
        })
        .attr('y', function(d){
            return (terms.indexOf(d) * cellsize + cellsize) - cellsize / 2.5
            // return 20
            // terms.indexOf(d) * 20
        })
        // .attr('font-family', 'helvetica')
        .attr('font-size', 12)

    this._vis.selectAll('text.bottom')
        .data(terms)
        .enter()
        .append('text')
        .text(function(d){
            return d
        })
        // .attr('x', function(d){
        //     return (terms.indexOf(d) * cellsize + cellsize) - cellsize / 2.5
        //     // return cellsize * numTerms + 5
        // })
        // .attr('y', function(d){
        //     return cellsize * numTerms
        // })
        .attr('transform', function(d){
            var x = (terms.indexOf(d) * cellsize + cellsize) - cellsize / 1.5
            var y = cellsize * numTerms + 10
            return 'translate(' + x + ',' + y + ') rotate(45)'
        })
        // .attr('font-family', 'helvetica')
        .attr('font-size', 12)



}

module.exports = D3Heatmap