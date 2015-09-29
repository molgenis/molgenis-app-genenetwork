// D3 brush slider http://bl.ocks.org/mbostock/6452972
var _ = require('lodash')

module.exports = function(elemId, options, fnChanged) {

    var width = options.width
    var height = options.height
    var colors = options.colors
    
    var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, width])
        .clamp(true)

    var y = d3.scale.linear()
        .domain([0, 1])
        .range([0, height])
        .clamp(true)

    var brush = d3.svg.brush()
        .extent([0, 0])
        .on('brush', brushed)

    if (width > height) {
        brush.x(x)
    } else {
        brush.y(y)
    }

    d3.select(elemId).selectAll('svg').remove()
    
    var svg = d3.select(elemId).append('svg')
        .attr('width', width + 2)
        .attr('height', height + 2)
        .style('width', width + 2 + 'px')
        .style('height', height + 2 + 'px')
        .append('g')
        .attr('transform', 'translate(0,0)')

    var gradientId = elemId.replace('#', '') + 'Gradient'
    var gradients = []
    for (var i = 0; i < options.scale.length; i++) {
        gradients.push(svg.append('linearGradient')
                       .attr('id', gradientId + gradients.length)
                       .selectAll('stop')
                       .data([{
                           offset: '0%',
                           color: colors[i][0]
                       }, {
                           offset: Math.round(100 * options.scale[i][1] / (options.scale[i][2] - options.scale[i][0])) + '%',
                           color: colors[i][1]
                       }, {                               
                           offset: '100%',
                           color: colors[i][2]
                       }])
                       .enter().append('stop')
                       .attr('offset', function(d) {
                           return d.offset;
                       })
                       .attr('stop-color', function(d) {
                           return d.color;
                       })
                       .attr('x1', '0%')
                       .attr('y1', '0%')
                       .attr('x2', width > height ? '100%' : '0%')
                       .attr('y2', width > height ? '0%' : '100%'))
    }

    if (gradients.length === 1) {
        svg.append('svg:rect')
            .attr('width', width)
            .attr('height', height)
            .attr('y', 1)
            .style('fill', 'url(#' + gradientId + '0)')
    } else {
        svg.append('svg:rect')
            .attr('width', width)
            .attr('height', height/2)
            .attr('y', 1)
            .style('fill', 'url(#' + gradientId + '0)')
        svg.append('svg:rect')
            .attr('width', width)
            .attr('height', height/2)
            .attr('y', height/2 + 1)
            .style('fill', 'url(#' + gradientId + '1)')
    }
    
    var slider = svg.append('g')
        .attr('class', 'slider')
        .call(brush)

    slider.selectAll('.extent,.resize')
        .remove()

    if (width > height) {
        slider.select('.background')
            .attr('height', height + 2)
    } else {
        slider.select('.background')
            .attr('width', width + 2)
    }

    var handle = slider.append('rect')
        .style('fill', '#000000')
        .style('cursor', 'crosshair')

    handle
        .attr('width', width > height ? 2 : width + 2)
        .attr('height', width > height ? height + 2 : 2)

    slider
        .call(brush.extent([options.initialPosRelative, options.initialPosRelative]))
        .call(brush.event)

    function brushed() {
        var value = brush.extent()[0]
        if (d3.event.sourceEvent) {
            if (width > height) {
                value = x.invert(d3.mouse(this)[0])
            } else {
                value = y.invert(d3.mouse(this)[1])
            }
            brush.extent([value, value])
        }
        if (width > height) {
            handle.attr('x', x(value))
        } else {
            handle.attr('y', y(value))
        }
        fnChanged(value)
    }
}
