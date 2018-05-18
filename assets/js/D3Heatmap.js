'use strict'

var _ = require('lodash')
var d3 = require('d3')
var color = require('./color.js')
var hcluster = require('hclusterjs')
var d3tip = require('d3-tip')

function D3Heatmap(elem, props) {

    this.elem = elem
    this._props = props || {}
    this._props.numTerms = props.terms.length
    this._props.hoverRow = null
    this._props.hoverCol = null
    this._props.colorscale = this._props.colorscale ? this._props.colorscale : [color.colors.gnblue, color.colors.gnlightgray, color.colors.gnred]
    this._props.distance = this._props.distance ? this._props.distance : 
    this._props.linkage = this._props.linkage ? this._props.linkage : 'avg'
    this._props.cellsize = this._props.cellsize ? this._props.cellsize : 30
    this._props.strokeWidth = this._props.strokeWidth ? this._props.strokeWidth : 1

    this._props.labelsizeBottom = 60
    this._props.labelsizeRight = 75

    this._clusterData()
    this._initScales()
    this._calculateProperties()
    this._drawHeatmap()
    this._addLabels()

}

D3Heatmap.prototype._clusterData = function(){
    var terms = this._props.terms
    var cormat = this._props.cormat

    //transform data to right format
    var data = []
    for (var i = 0; i < terms.length; i++){
        data.push({
            term: terms[i],
            values: cormat[i]
        })
    }

    //cluster data
    var cluster = hcluster()
        .distance(this._props.distance)
        .linkage(this._props.linkage)
        .posKey('values')
        .data(data)

    //get node ordening
    var indices = _.flatMap(cluster.orderedNodes(), 'indexes')
    
    //order the data according to clustering
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
        .range(this._props.colorscale)
        .clamp(true)

    this._fontsizescale = d3.scale.linear()
        .domain([9,15,20])
        .range([8,10,12])
        .clamp(true)
}

D3Heatmap.prototype._calculateProperties = function(){
    this._props.size = this.elem.clientWidth > this.elem.clientHeight ? this.elem.clientHeight : this.elem.clientWidth - this._props.labelsizeRight 
    if (this._props.size < this._props.cellsize * this._props.numTerms){
        //if the size of the div is smaller than the total width of the heatmap, make cellsize smaller so heatmap will fit in div 
        this._props.cellsize = this._props.size / this._props.numTerms
        
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

    this._vis = d3.select(this.elem).append('svg:svg')
        .attr('id', 'heatmapsvg')
        .attr('width', this._props.size + this._props.labelsizeRight)
        .attr('height', this._props.size + this._props.labelsizeBottom)

    this._vis.call(tip)

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
        .attr('width', cellsize - this._props.strokeWidth)
        .attr('height', cellsize - this._props.strokeWidth)
        .attr('fill', function(d){
            return that._colorscale(d.value)
        })
        .on('mouseover', function(d){
            tip.show(d, this)
            that._props.handleHover(orderedTerms[d.row], orderedTerms[d.col])
        })
        .on('mouseout', function(d){
            tip.hide(d, this)
            that._props.handleHover(null, null)
        })

}

D3Heatmap.prototype._addLabels = function(){
    var terms = this._props.orderedTerms
    var cellsize = this._props.cellsize 
    var numTerms = this._props.numTerms
    var that = this

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
            return (terms.indexOf(d) * cellsize) + cellsize * 0.7
            // return (terms.indexOf(d) * cellsize + cellsize) - cellsize / 2.5
        })
        .attr('font-size', function(d){

            // return 12
            return that._fontsizescale(cellsize)
        })

    this._vis.selectAll('text.bottom')
        .data(terms)
        .enter()
        .append('text')
        .text(function(d){
            return d
        })
        .attr('transform', function(d){
            var x = (terms.indexOf(d) * cellsize + cellsize) - cellsize / 1.5
            var y = cellsize * numTerms + 10
            return 'translate(' + x + ',' + y + ') rotate(45)'
        })
        .attr('font-size', function(d){
            return that._fontsizescale(cellsize)
            // return 12
            // return 8
        })
}

module.exports = D3Heatmap