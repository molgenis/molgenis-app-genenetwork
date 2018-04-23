'use strict'

var _ = require('lodash')
var d3 = require('d3')
var color = require('./color.js')


function D3Heatmap(elem, props) {

    this.elem = elem
    this._props = props || {}
    this._initScales()
    this._addDOMElements()

}

D3Heatmap.prototype._initScales = function(){
    this._colorscale = d3.scale.linear()
        .domain([-1, 0, 1])
        .range([color.colors.gnblue, color.colors.gnlightgray, color.colors.gnred])
        .clamp(true)

    // this._colorscale = d3.scale.linear()
    //     .domain([-1, -0.5, 0, 0.5, 1])
    //     .range(['#0056a6', '#0085ff', '#b3b3b3', '#ff3c00', '#a62700'])
    //     .clamp(true)

}

D3Heatmap.prototype._addDOMElements = function(){
    var maxCellsize = 30
    var maxWidth = maxCellsize * this._props.numTerms
    var cellsize = (this._props.size - 150) / this._props.numTerms 
    var width = this._props.size

    if (maxWidth < this._props.size) {
        cellsize = 30
        width = maxWidth
    }

    this._vis = d3.select(this.elem).append('svg:svg')
        .attr('id', 'heatmapsvg')
        .attr('width', width)
        .attr('height', width)

    console.log('maxWidth, cellsize')
    console.log(maxWidth, cellsize)

    console.log('size, width, height')
    console.log(this._props.size, this._props.width, this._props.height)

    this._vis.selectAll('rect')
        .data(this._props.data)
        .enter()
        .append('rect')
        .attr('x', function(d){
            return d.col * cellsize
        })
        .attr('y', function(d){
            return d.row * cellsize
        })
        .attr('width', cellsize - 2)
        .attr('height', cellsize - 2)
        .attr('fill', function(d){
            return this._colorscale(d.value)
        }.bind(this))
}

module.exports = D3Heatmap