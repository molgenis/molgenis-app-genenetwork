"use strict";

var d3 = require('d3')
var _ = require('lodash')
var hotnet = require('../../stats/hotnet')
var graphutil = require('./graphutil')
var matrix = require('../../stats/matrix')
var color = require('./color.js')
var slider = require('./slider')

var exp = module.exports

var D3FD = {}
D3FD.TICKS_PER_RENDER = 3
D3FD.ALPHA = [0.01, 0.03]

D3FD.addNodes = function(nodes) {
    for (var n = 0, nn = nodes.length; n < nn; n++) {
        exp.addNode(nodes[n])
    }
    D3FD.rehash()
}

D3FD.addLinks = function(edges) {
    for (var e = 0, ee = edges.length; e < ee; e++) {
        exp.addLink(edges[e].data)
    }
    console.log('d3fd: added ' + edges.length + ' links')
    D3FD.rehash()
}

exp.clearData = function() {

    D3FD.data = {}
    D3FD.force.links().splice(0)
    D3FD.force.nodes().splice(0)
    D3FD.hashNodes = {}
    D3FD.neighborlists = []
}

D3FD.initScales = function() {

    if (!D3FD.data || !D3FD.data.edgeValueScales) {
        return console.error('D3FD.initscales called but no data assigned or no data.edgeValueScales')
    }

    D3FD.linkscales = []
    for (var i = 0, ii = D3FD.data.edgeValueScales.length; i < ii; i++) {
        D3FD.linkscales.push(d3.scale.linear()
                             .domain(D3FD.data.edgeValueScales[i])
                             .range(D3FD.data.edgeColorScales[i])
                             .clamp(true))
    }
    
    D3FD.nodescale = d3.scale.linear()
        .domain([-10, 0, 10])
        .range([color.colors.gnblue, color.colors.gnlightgray, color.colors.gnred])
        .clamp(true)
}

D3FD.initNodes = function() {

    D3FD.node = D3FD.nodevis.selectAll('g.node')
        .data(D3FD.force.nodes(), function(d) {
            return d.id
        })

    D3FD.isDragging = false
    D3FD.drag = d3.behavior.drag()
        .origin(function(d) {
            return d
        })
        .on('dragstart', function() {
            // if (d3.event.sourceEvent.altKey) {
            //     D3FD.zoomTranslateOnDragStart = null
            // } else {
                D3FD.zoomTranslateOnDragStart = D3FD.zoom.translate()
            //  }
        })
        .on('drag', function(node) {
            if (node.source) { // is a link, not a node
                return
            }
            if (d3.event.sourceEvent.altKey) {
                D3FD.isDragging = true // pretend we're dragging to avoid firing of click event on mouse release
                return
            }
            D3FD.isDragging = true
            // TODO store selection of selected nodes on brushing
            // D3FD.node.filter(function(d) {
            //     console.log('f1')
            //     return D3FD.data.elements.groups[2].nodes.indexOf(d.id) > -1
            // })
            //     .attr('transform', function(d) {
            //         // rounding to make the svg smaller, matters when sending large networks to server for pdf conversion
            //         d.x = Math.round(100 * (d3.event.x - d.x)) / 100
            //         d.y = Math.round(100 * (d3.event.y - d.y)) / 100
            //         // d.x = d.x - dx
            //         // d.y = d.y - dy
            //         return 'translate(' + d.x + ',' + d.y + ')' 
            //     })

            node.x = d3.event.x
            node.y = d3.event.y
            // rounding to make the svg smaller, matters when sending large networks to server for pdf conversion
            d3.select(this).attr('transform', 'translate(' + Math.round(100 * d3.event.x) / 100 + ',' + Math.round(100 * d3.event.y) / 100 + ')')    
            D3FD.link.attr('x1', function(d) {
                return d.source.x
            })
                .attr('y1', function(d) {
                    return d.source.y
                })
                .attr('x2', function(d) {
                    return d.target.x
                })
                .attr('y2', function(d) {
                    return d.target.y
                })
        })
        .on('dragend', function() {
            if (D3FD.zoomTranslateOnDragStart) {
                D3FD.zoom.translate(D3FD.zoomTranslateOnDragStart)
            }
            setTimeout(function() { // 'click' event fires after 'dragend' and it's nice if 'click' knows whether the click was a result of dragging or not
                D3FD.isDragging = false
            }, 50)
        })
 
    var nodeEnter = D3FD.node.enter().append('g')
        .attr('class', 'node')
        .attr('data-id', function(d) {
            return d.id
        })
        .on('click', function(d) {
            if (!D3FD.isDragging) {
                if (d3.event.shiftKey) {
                    _.last(D3FD.data.elements.groups).nodes.push(d.id)
                    exp.highlightGroup(D3FD.data.elements.groups.length - 1)
                } else {
                    _.last(D3FD.data.elements.groups).nodes = [d.id]
                    exp.highlightNode(d.id)
                }
                D3FD.onSelect(_.last(D3FD.data.elements.groups))
            }
        })
        .call(D3FD.drag)
    
    // nodeEnter.append('rect')
    //     .attr('class', 'clickable backgroundrect')
    //     .attr('height', D3FD.r + 16) // width will be defined after the bounding box is known
    //     .attr('rx', 0)
    //     .attr('ry', 0)
    //     .attr('y', -(D3FD.r + 16) / 2) // x will be defined after the bounding box is known
    //     .style('fill', color.colors.gnyellow)
    
    nodeEnter
        .append('rect')
        .attr('class', 'clickable main rect1')
        .attr('height', D3FD.r) // width will be defined after the bounding box is known
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('y', -(D3FD.r) / 2) // x will be defined after the bounding box is known
        .style('fill', color.colors.gndarkgray)

    nodeEnter
        .filter(function(d) {
            return d.customGroups && d.customGroups.length > 1
        })
        .append('rect')
        .attr('class', 'clickable main rect2')
        .attr('height', D3FD.r) // width will be defined after the bounding box is known
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('y', -(D3FD.r) / 2) // x will be defined after the bounding box is known
        .style('fill', color.colors.gndarkgray)

    nodeEnter
        .filter(function(d) {
            return d.customGroups && d.customGroups.length > 2
        })
        .append('rect')
        .attr('class', 'clickable main rect3')
        .attr('height', D3FD.r) // width will be defined after the bounding box is known
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('y', -(D3FD.r) / 2) // x will be defined after the bounding box is known
        .style('fill', color.colors.gndarkgray)

    nodeEnter
        .filter(function(d) {
            return d.customGroups && d.customGroups.length > 3
        })
        .append('rect')
        .attr('class', 'clickable main rect4')
        .attr('height', D3FD.r) // width will be defined after the bounding box is known
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('y', -(D3FD.r) / 2) // x will be defined after the bounding box is known
        .style('fill', color.colors.gndarkgray)

    nodeEnter
        .filter(function(d) {
            return d.customGroups && d.customGroups.length > 4
        })
        .append('rect')
        .attr('class', 'clickable main rect5')
        .attr('height', D3FD.r) // width will be defined after the bounding box is known
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('y', -(D3FD.r) / 2) // x will be defined after the bounding box is known
        .style('fill', color.colors.gndarkgray)
    
    nodeEnter.append('text')
        .attr('class', 'nodetext clickable')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .style('fill', D3FD.labelColor || color.colors.gndarkgray)
        .style('font-size', D3FD.labelSize)
        .style('font-family', 'GG')
        .attr('displayState', 'y')
        .text(function(d) {
            return d.name
        })
    D3FD.node.exit().remove()
}

D3FD.initLinks = function() {

    D3FD.link = D3FD.linkvis.selectAll('line.link')
        .data(D3FD.force.links(), function(d) {
            return d.source.id + '-' + d.target.id
        })

    D3FD.link.enter().insert('line')
        .attr('class', 'link')
        .style('stroke', function(d) {
            if (d.weight < 0) {
                return D3FD.linkscales[1](d.weight)
            } else {
                return D3FD.linkscales[0](d.weight)
            }
        })
        .call(D3FD.drag)
    
    D3FD.link.exit().remove()
}

D3FD.hide = function() {
    D3FD.nodevis.selectAll('g.node>rect,text')
        .style('opacity', 0)
    D3FD.link
        .style('opacity', 0)
}

D3FD.show = function() {
    
    D3FD.nodevis.selectAll('g.node>text')
        .style('opacity', 1)
        .each(function(d) {
            d.bbox = this.getBBox()
        });

    // some nodes have 1 rectangle, some more, depending on how many groups they belong to
    D3FD.nodevis.selectAll('g.node>rect')
        .style('opacity', 1)
        .attr('width', function(d) {
            return (d.bbox.width + 12) / ((d.customGroups && d.customGroups.length) || 1)
        })
        .attr('x', function(d) {
            var rectNum = +(this.getAttribute('class').match(/rect(\d)/)[1])
            return -(d.bbox.width + 12) / 2 + (rectNum - 1) * (d.bbox.width + 12) / ((d.customGroups && d.customGroups.length) || 1)
        })
            
    D3FD.link
        .style('opacity', 1)
}

D3FD.move = function(dx, dy) {

    dx = dx || 0
    dy = dy || 0

    D3FD.node.attr('transform', function(d) {
        // rounding to make the svg smaller, matters when sending large networks to server for pdf conversion
        d.x = Math.round(100 * (d.x - dx)) / 100
        d.y = Math.round(100 * (d.y - dy)) / 100
        return 'translate(' + d.x + ',' + d.y + ')'
    })
    D3FD.link
        .attr('x1', function(d) {
            return d.source.x
        })
        .attr('y1', function(d) {
            return d.source.y
        })
        .attr('x2', function(d) {
            return d.target.x
        })
        .attr('y2', function(d) {
            return d.target.y
        })

    D3FD.updateBrush()
}

D3FD.fixNodes = function() {
    _.each(D3FD.force.nodes(), function(d) { d.fixed = true })
}

D3FD.unfixNodes = function() {
    _.each(D3FD.force.nodes(), function(d) { d.fixed = false })
}

D3FD.start = function(options) {
    D3FD.startTime = new Date()
    var prevAlpha = 0.1
    requestAnimationFrame(function render() {
        for (var i = 0; i < D3FD.TICKS_PER_RENDER; i++) {
            D3FD.force.tick()
        }
        if (D3FD.layoutDone === true) { // don't move when initialising network for speed
            D3FD.move()
        }
        var alpha = D3FD.force.alpha()
        // if (!D3FD.layoutDone && D3FD.updateProgress && prevAlpha - alpha > 0.002) {
        //     D3FD.updateProgress({loadProgress: 100, initProgress: 100, layoutProgress: D3FD.layoutProgressScale(D3FD.force.alpha())})
        //     prevAlpha = alpha
        // }
        if (alpha > D3FD.ALPHA[D3FD.data.elements.nodes.length < 100 ? 0 : 1]) {
            requestAnimationFrame(render)
        } else {
            if (D3FD.layoutDone === false) { // show network after it has loaded and laid out

                //// calculate proper zoom level from the extent of nodes
                var extent = [1000000, 0, 0, 1000000] // NESW
                D3FD.node.each(function(d) {
                    extent[0] = Math.min(d.y, extent[0])
                    extent[1] = Math.max(d.x, extent[1])
                    extent[2] = Math.max(d.y, extent[2])
                    extent[3] = Math.min(d.x, extent[3])
                })

                var initialZoomScale = 0.1
                var initialZoomTranslate = [(1 - initialZoomScale) * D3FD.w / 2, (1 - initialZoomScale) * D3FD.h / 2]
                var factor = D3FD.data.elements.nodes.length < 20 ? 0.5 : 0.85
                var fitZoomScale = factor / (Math.max((extent[2] - extent[0]) / D3FD.h, (extent[1] - extent[3]) / D3FD.w))
                var fitZoomTranslate = [(1 - fitZoomScale) * D3FD.w / 2, (1 - fitZoomScale) * D3FD.h / 2]
                
                D3FD.zoom.scale(initialZoomScale)
                D3FD.zoom.translate(initialZoomTranslate)
                D3FD.updateZoom(true)

                D3FD.show()
                d3.transition().duration(500).ease('cubic').tween('zoom', function() {
                    var iScale = d3.interpolate(initialZoomScale, fitZoomScale)
                    var iTranslate = d3.interpolate(initialZoomTranslate, fitZoomTranslate)
                    return function(t) {
                        D3FD.zoom.scale(iScale(t))
                        D3FD.zoom.translate(iTranslate(t))
                        D3FD.updateZoom(true)
                    }
                })
            }
            D3FD.layoutDone = true
            D3FD.force.stop()
            D3FD.move()
            D3FD.updateProgress({done: true})
        }
    })
}

D3FD.rehash = function() {

    D3FD.hashNodes = {}
    D3FD.neighborlists = []
    for (var n = 0, nn = D3FD.force.nodes().length; n < nn; n++) {
        var node = D3FD.force.nodes()[n]
        D3FD.hashNodes[node.id] = n
        D3FD.neighborlists.push([])
    }
    for (var e = 0, ee = D3FD.force.links().length; e < ee; e++) {
        var si = D3FD.hashNodes[D3FD.force.links()[e].source.id]
        var ti = D3FD.hashNodes[D3FD.force.links()[e].target.id]
        D3FD.neighborlists[si].push(ti)
        D3FD.neighborlists[ti].push(si)
    }
}

exp.create = function(el, props, onSelect) {

    D3FD.r = props.nodeRadius
    D3FD.w = props.width
    D3FD.h = props.height
    D3FD.labelColor = props.labelColor
    D3FD.labelSize = props.labelSize
    D3FD.onSelect = onSelect

    D3FD.x = d3.scale.linear()
        .domain([0, props.width])
        .range([0, props.width])
    D3FD.y = d3.scale.linear()
        .domain([0, props.height])
        .range([0, props.height])

    D3FD.updateProgress = props.updateProgress
    //TODO both alphas
    D3FD.layoutProgressScale = d3.scale.linear()
        .domain([0.1, D3FD.ALPHA[1]])
        .range([0, 100])
        .clamp(true)
    D3FD.initProgressScale = d3.scale.linear()
        .domain([0, 8]) // approx the number of times updateProgress is called during init
        .range([0, 100])
        .clamp(true)
    
    D3FD.updateZoom = function(force) {
        var se = d3.event ? d3.event.sourceEvent : null
        if (force) {
            D3FD.brushvis.attr('transform', 'translate(' + D3FD.zoom.translate() + ')scale(' + D3FD.zoom.scale() + ')')
            D3FD.nodevis.attr('transform', 'translate(' + D3FD.zoom.translate() + ')scale(' + D3FD.zoom.scale() + ')')
            D3FD.linkvis.attr('transform', 'translate(' + D3FD.zoom.translate() + ')scale(' + D3FD.zoom.scale() + ')')
        } else if (!D3FD.isBrushing && se && se.altKey) { // && (WheelEvent && se instanceof WheelEvent) || (TouchEvent && se instanceof TouchEvent)) {
            D3FD.brushvis.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
            D3FD.nodevis.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
            D3FD.linkvis.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
        }
    }

    D3FD.zoom = d3.behavior.zoom()
        .scaleExtent([0.05, 10])
        .x(D3FD.x)
        .y(D3FD.y)
        .on('zoomstart', function() {
            if (!d3.event.sourceEvent || !d3.event.sourceEvent.altKey) {
                D3FD.zoomScaleOnNonZoomStart = D3FD.zoom.scale()
                D3FD.zoomTranslateOnNonZoomStart = D3FD.zoom.translate()
            } else {
                D3FD.zoomScaleOnNonZoomStart = null
                D3FD.zoomTranslateOnNonZoomStart = null
            }
        })
        .on('zoom', function() {
            D3FD.updateZoom()
        })
        .on('zoomend', function() {
            if (D3FD.zoomScaleOnNonZoomStart) {
                D3FD.zoom.scale(D3FD.zoomScaleOnNonZoomStart)
                D3FD.zoom.translate(D3FD.zoomTranslateOnNonZoomStart)
            }
        })
    
    D3FD.isBrushing = false
    D3FD.isInsideBrushNodeIds = {}
    D3FD.brush = d3.svg.brush()
        .x(d3.scale.linear()
           .range([-10 * props.width, 10 * props.width])
           .domain([-10 * props.width, 10 * props.width]))
        .y(d3.scale.linear()
           .range([-10 * props.height, 10 * props.height])
           .domain([-10 * props.height, 10 * props.height]))
        .on('brushstart', function(d) {
            if (d3.event && d3.event.sourceEvent && d3.event.sourceEvent.altKey) {
                D3FD.isBrushing = false
                if (D3FD.brush.empty()) {
                    d3.select('.brush').style('visibility', 'hidden')
                }
            } else {
                D3FD.isBrushing = true
                D3FD.isInsideBrushNodeIds = {}
                D3FD.zoomTranslateOnBrushStart = D3FD.zoom.translate()
                // exp.hideBackgroundRects()
                d3.select('.brush').style('visibility', 'visible')
            }
        })
        .on('brush', function() {
            if (D3FD.isBrushing) {// || D3FD.brush.extent()[0][0] != D3FD.brush.extent()[0][1]) {
                D3FD.updateBrush()
            }
        })
        .on('brushend', function() {
            if (D3FD.isBrushing) {
                D3FD.zoom.translate(D3FD.zoomTranslateOnBrushStart)
                if (D3FD.brush.empty()) {
                    D3FD.nodevis.selectAll('.hidden').classed('hidden', false).style('opacity', 1)
                    D3FD.linkvis.selectAll('.hidden').classed('hidden', false).style('opacity', 1)
                    // TODO no group select on programmatic .event() to allow pathway analysis
                    D3FD.onSelect(D3FD.data.elements.groups[0])
                }
                // d3.event.target.clear()
                d3.select(this).call(d3.event.target)
                D3FD.isBrushing = false
                exp.removeHighlight()
            }
        })

    D3FD.updateBrush = function() {

        var isShiftDown = d3.event && (d3.event.shiftKey || (d3.event.sourceEvent && d3.event.sourceEvent.shiftKey))
        var nodes = _.last(D3FD.data.elements.groups).nodes
        
        if (!isShiftDown && D3FD.brush.empty()) {
            nodes = []
            return
        }
        
        var e = D3FD.brush.extent()
        var numVisible = 0
        var selectedNodeIds = {}
        if (!isShiftDown) {
            nodes = []
        }
        // TODO efficiency (indexof)
        D3FD.nodevis.selectAll('g.node>rect.main')
            .classed('hidden', false)
            .style('opacity', 1)
            .filter(function(d) {
                if (e[0][0] > d.x || d.x > e[1][0] || e[0][1] > d.y || d.y > e[1][1]) { // outside of brush
                    var index = nodes.indexOf(d.id)
                    if (index === -1) {
                        return true
                    } else { // node was among previously selected ones...
                        if (D3FD.isInsideBrushNodeIds[d.id] === true) { // ...and within the current brushing context
                            nodes.splice(index, 1)
                        }
                        D3FD.isInsideBrushNodeIds[d.id] = false
                        return false
                    }
                } else { // inside of brush
                    D3FD.isInsideBrushNodeIds[d.id] = true
                    if (nodes.indexOf(d.id) == -1) {
                        nodes.push(d.id)
                    }
                    numVisible++
                    selectedNodeIds[d.id] = true
                    return false
                }
            })
            .classed('hidden', true)
            .style('opacity', 0.3)

        // only highlight links in small networks for responsivity
        if (D3FD.data.elements.nodes.length < 101) {
            if (numVisible > 0) {
                var connectedNodeIds = {}
                D3FD.link
                    .classed('hidden', false)
                    .style('opacity', 1)
                    .filter(function(d) {
                        if (selectedNodeIds[d.source.id] === true) {
                            connectedNodeIds[d.target.id] = true
                            return false
                        } else if (selectedNodeIds[d.target.id] === true) {
                            connectedNodeIds[d.source.id] = true
                            return false
                        }
                        return true
                    })
                    .classed('hidden', true)
                    .style('opacity', 0.3)
            } else {
                D3FD.link
                    .classed('hidden', true)
                    .style('opacity', 0.3)
            }
        }

        _.last(D3FD.data.elements.groups).nodes = nodes
        // console.log('updateBrush: numVisible ' + numVisible, D3FD.brush.empty())
        D3FD.onSelect(_.last(D3FD.data.elements.groups), false)
    }

    D3FD.vis = d3.select(el).append('svg:svg')
        .attr('id', 'networksvg')
        .attr('width', props.width)
        .attr('height', props.height)
        .call(D3FD.zoom)

    D3FD.brushvis = D3FD.vis.append('g')
        .attr('class', 'brush')
        .style({'fill': color.colors.gngray, 'fill-opacity': 0.2, 'stroke-width': 0, 'stroke': color.colors.gndarkgray, 'shape-rendering': 'crispEdges'})
        .call(D3FD.brush)

    D3FD.linkvis = D3FD.vis.append('svg:g')
        .attr('id', 'links')

    D3FD.nodevis = D3FD.vis.append('svg:g')
        .attr('id', 'nodes')
    
    D3FD.force = d3.layout.force()
        .gravity(props.gravity || .7)
        .distance(props.distance || 150)
        .charge(props.charge || -2000)
        .size([props.width, props.height])
    
    D3FD.force.on('start', D3FD.start)
    D3FD.force.on('end', function() {
        console.log((new Date() - D3FD.startTime) + 'ms: force directed layout calculated')
        D3FD.fixNodes()
    })

    d3.select('body')
        .on('keydown', function() {
            //console.log(d3.event.keyCode)
            if (d3.event.keyCode === 78) { // n
                
            }
            if (d3.event.keyCode === 80) { // p
                
            }
            // if (d3.event.keyCode === 37) { // left
            //     D3FD.move(50, 0)
            // }
            // if (d3.event.keyCode === 38) { // up
            //     D3FD.move(0, 50)
            // }
            // if (d3.event.keyCode === 39) { // right
            //     D3FD.move(-50, 0)
            // }
            // if (d3.event.keyCode === 40) { // down
            //     D3FD.move(0, -50)
            // }
            if (d3.event.keyCode === 18) { // alt
                document.getElementsByClassName('background')[0].style.cursor = 'move' // the brush background
                D3FD.nodevis.selectAll('g.node>rect,text').style('cursor', 'move')
                D3FD.linkvis.selectAll('line.link').style('cursor', 'move')
            }
        })
        .on('keyup', function() {
            if (d3.event.keyCode === 18) {
                document.getElementsByClassName('background')[0].style.cursor = 'crosshair' // the brush background
                D3FD.nodevis.selectAll('g.node>rect,text').style('cursor', 'pointer')
                D3FD.linkvis.selectAll('line.link').style('cursor', 'initial')
            }
        })
}

exp.resize = function(w, h) {
    D3FD.vis.attr('width', w)
    D3FD.vis.attr('height', h)
}

exp.destroy = function(el) {

    D3FD.data = null
    D3FD.vis = null
    D3FD.nodevis = null
    D3FD.linkvis = null
    D3FD.brushvis = null
    D3FD.brush = null
    D3FD.zoom = null

    // ... TODO collect variables to an options object
    D3FD.showNegatives = false
    D3FD.layoutDone = false
}

exp.draw = function(data, options) {

    console.log('d3fd: draw called: ' + data.elements.nodes.length + ' nodes, ' + data.elements.edges.length + ' edges')

    options = options || {}
    var ts = new Date()
    exp.clearData()
    D3FD.data = data
    D3FD.showNegatives = options.showNegatives || false
    //D3FD.updateProgress({initProgress: D3FD.initProgressScale(2), layoutProgress: 0})
    D3FD.addNodes(data.elements.nodes)
    if (D3FD.showNegatives) {
        D3FD.addLinks(data.elements.edges)
    } else {
        D3FD.addLinks(_.filter(data.elements.edges, function(edge) { return edge.data.weight > 0 }))
    }
    D3FD.initScales()
    D3FD.initNodes()
    D3FD.initLinks()

    console.log('d3fd: ' + (new Date() - ts) + 'ms: initialisation')
    D3FD.hide()
    D3FD.layoutDone = false
    D3FD.updateProgress({loadProgress: 100, initProgress: 100, layoutProgress: 0})
    D3FD.force.start()
}

exp.addGeneToNetwork = function(gene, zScores) {

    console.log('D3FD.addGeneToNetwork: adding ' + gene.name)
    //console.log('zScores.length ' + zScores.length + ', nodes.length ' + D3FD.data.elements.nodes.length)

    gene.added = true
    D3FD.data.elements.nodes.push({data: gene})
    // TODO get groups from server already
    exp.addNode({data: gene, groups: [0]})
    D3FD.rehash()

    var threshold = D3FD.threshold || D3FD.data.threshold || 0
    for (var i = 0, ii = zScores.length; i < ii - 1; i++) { // -1 to account for this just added gene, sorting danger here
        if (Math.abs(zScores[i] >= threshold)) {
            var edge = {source: gene.id,
                        target: D3FD.data.elements.nodes[i].data.id,
                        weight: zScores[i]}
            D3FD.data.elements.edges.push({data: edge})
            exp.addLink(edge)
        }
    }
    
    D3FD.initNodes()
    D3FD.initLinks()
    
    D3FD.rehash()
    // TODO optimize by only showing the added node
    // var ts = new Date()
    D3FD.show()
    // console.log((new Date() - ts) + 'ms D3FD.show')

    // D3FD.data.elements.groups[2].nodes = [gene.id]
    // exp.highlightNode(gene.id)
    // D3FD.onSelect()

    D3FD.unfixNodes()
    D3FD.force.start()
}

//TODO assumes negative weight edges are in the end of edge list
exp.toggleNegative = function() {

    if (!D3FD.data) {
        return
    }

    D3FD.showNegatives = !D3FD.showNegatives
    if (D3FD.showNegatives) {
        // D3FD.link
        //     .style('stroke', function(d) {
        //         return D3FD.linkscales[1](d.weight)
        //     })
        D3FD.addLinks(_.filter(D3FD.data.elements.edges, function(edge) { return edge.data.weight < 0 }))
        D3FD.initLinks()
        D3FD.unfixNodes()
        D3FD.force.start()
    } else {
        var links = D3FD.force.links()
        var numLinks = links.length
        var numRemoved = 0
        for (var i = numLinks - 1; i >= 0; i--) {
            if (links[i].weight < 0) {
                numRemoved++
            } else {
                break
            }
        }
        D3FD.force.links().splice(numLinks - numRemoved, numRemoved)
        console.log('removed ' + numRemoved + ' links out of ' + numLinks)
        D3FD.link
            .style('stroke', function(d) {
                return D3FD.linkscales[0](d.weight)
            })
        D3FD.initLinks()
        D3FD.unfixNodes()
        D3FD.force.start()
    }
}

// TODO fix...
// TODO no need for preThreshold (D3FD.threshold)
exp.changeThreshold = function(threshold, prevThreshold) {

    if (!D3FD.data) {
        return
    }

    var ts = new Date()
    var edges = D3FD.data.elements.edges
    var links = D3FD.force.links()
    var numLinks = links.length
    if (threshold > prevThreshold) { // remove links

        var numRemoved = 0
        for (var i = numLinks - 1; i >= 0; i--) {
            if (Math.abs(links[i].weight) < threshold) {
                D3FD.force.links().splice(i, 1)
                numRemoved++
            }
        }
        // for (var i = numLinks - 1; i >= 0; i--) {
        //     if (Math.abs(links[i].weight) < threshold) {
        //         numRemoved++
        //     } else { //if (links[i].weight > 0) {
        //         break
        //     }
        // }
        // D3FD.force.links().splice(numLinks - numRemoved, numRemoved)
        
    } else if (threshold < prevThreshold) { // add links

        var numAdded = 0
        for (var i = 0, ii = edges.length; i < ii; i++) {
            var weight = D3FD.showNegatives ? Math.abs(edges[i].data.weight) : edges[i].data.weight
            if (weight >= threshold && weight < prevThreshold) {
                exp.addLink(edges[i].data)
                numAdded++
            }
        }
        // for (var i = numLinks; i < edges.length; i++) {
        //     if (Math.abs(edges[i].data.weight) >= threshold) {
        //         exp.addLink(edges[i].data)
        //         numAdded++
        //     } else {
        //         break
        //     }
        // }
    }

    D3FD.threshold = threshold
    
    D3FD.initLinks()
    D3FD.unfixNodes()
    D3FD.force.start()
    // if (D3FD.selectedNodes.length == 1) {
    //     exp.highlightNode(D3FD.selectedNodes[0])
    // }
    if (numAdded > 0) {
        console.log((new Date() - ts) + 'ms: added ' + numAdded + ' links on threshold change from ' + prevThreshold + ' to ' + threshold)
    } else if (numRemoved > 0) {
        console.log((new Date() - ts) + 'ms: removed ' + numRemoved + '/' + numLinks + ' links on threshold change from ' + prevThreshold + ' to ' + threshold)
    }
}

exp.removeHighlight = function() {

    D3FD.nodevis.selectAll('g.node>rect.main')
        .style('opacity', 1)
    
    D3FD.linkvis.selectAll('line.link')
        .style('opacity', 1)
}

exp.highlightNode = function(id) {

    //console.log('highlighting node', id)
    D3FD.brush.clear()

    var connectedNodeIds = {}
    _.each(D3FD.force.links(), function(link) {
        if (link.source.id === id) {
            connectedNodeIds[link.target.id] = true
        }
        if (link.target.id === id) {
            connectedNodeIds[link.source.id] = true
        }
    })
        
    D3FD.nodevis.selectAll('g.node>rect.main')
        .classed('hidden', true)
        .style('opacity', 0.3)
        .filter(function(d) {
            return d.id === id || connectedNodeIds[d.id] === true
        })
        .classed('hidden', false)
        .style('opacity', 0.6)
        .filter(function(d) {
            return d.id === id
        })
        .style('opacity', 1)

    D3FD.linkvis.selectAll('line.link')
        .style('opacity', 0.3)
        .filter(function(d) {
            return d.source.id == id || d.target.id == id
        })
        .style('opacity', 1)
}

exp.hideBackgroundRects = function(groupIndex) {

    D3FD.nodevis.selectAll('g.node>rect.backgroundrect')
        .style('opacity', 0)
}

exp.showBackgroundRects = function(group) {

    //D3FD.brush.clear()
    D3FD.brush.event(D3FD.brushvis)
    D3FD.nodevis.selectAll('g.node>rect.backgroundrect')
        .style('opacity', 0)
        .filter(function(d) {
            if (group.nodes.indexOf(d.id) > -1) {
//            if (D3FD.data.elements.groups[groupIndex].nodes.indexOf(d.id) > -1) {
                return true
            }
            return false
        })
        .style('opacity', 1)
}

exp.highlightGroup = function(groupIndex) {

    // console.log('highlighting group', groupIndex)

    D3FD.brush.clear()
    var selectedNodeIds = {}
    D3FD.nodevis.selectAll('g.node>rect.main')
        .classed('hidden', true)
        .style('opacity', 0.3)
        .filter(function(d) {
            if (D3FD.data.elements.groups[groupIndex].nodes.indexOf(d.id) > -1) {
                selectedNodeIds[d.id] = true
                return true
            }
            return false
        })
        .classed('hidden', false)
        .style('opacity', 1)

    D3FD.linkvis.selectAll('line.link')
        .style('opacity', 0.3)
        .filter(function(d) {
            return selectedNodeIds[d.source.id] === true || selectedNodeIds[d.target.id] === true
        })
        .style('opacity', 1)
}

exp.colorBy = function(type) {

    if (type == 'prediction') {
        D3FD.nodevis.selectAll('g.node>text')
            .style('fill', color.colors.gndarkgray)
    } else {
        D3FD.nodevis.selectAll('g.node>text')
            .style('fill', D3FD.labelColor || color.colors.gndarkgray)
            .filter(function(d) {
                return d.added === true
            })
            .style('fill', color.colors.gnyellow)
    }

    if (type == 'custom') {
        D3FD.nodevis.selectAll('g.node>rect')
            .filter(function(d) {
                return d.customGroups && d.customGroups.length > 0
            })
            .style('fill', function(d) {
                var rectNum = +(this.getAttribute('class').match(/rect(\d)/)[1])
                return color.group2color[d.customGroups[rectNum - 1]]
            })
    } else {
    
    D3FD.nodevis.selectAll('g.node>rect.main')
        .style('fill', function(d) {
            if (type == 'biotype') {
                return color.biotype2color[d.biotype]
            } else if (type == 'chr' || type == 'chromosome') {
                return color.chr2color[d.chr]
            } else if (type == 'cluster') {
                var clusterIndex = _.findLast(d.groups, function(index) {
                    return D3FD.data.elements.groups[index].type == 'auto'
                })
                return color.cluster2color[clusterIndex] || color.colors.nodeDefault
            } else if (type == 'prediction') {
                return D3FD.nodescale(d.zScore)
            } else if (type == 'annotation') {
                return d.annotated ? color.colors.gnred : color.colors.gngray
                // } else if (type == 'custom') {
                //     var groupIndices = _.filter(d.groups, function(index) {
                //         return D3FD.data.elements.groups[index].type == 'custom'
                //     })
                //     if (groupIndices.length == 2) {
                //         console.log(d)
                //     }
                //     return color.colors.nodeDefault
                // var groupIndex = _.findLast(d.groups, function(index) {
                //     return D3FD.data.elements.groups[index].type == 'custom'
                // })
                // if (groupIndex != undefined) {
                //     return color.group2color[D3FD.data.elements.groups[groupIndex].index_]
                // } else {
                //     return color.colors.nodeDefault
                // }
            } else {
                return color.colors.default
            }
        })
    }
}

exp.hotnet = function(beta, gamma) {

    var F = hotnet.heatDiffusion(D3FD.neighborlists, beta)
    var Dh = matrix.zeroMatrix(D3FD.neighborlists.length)
    for (var i = 0, ii = D3FD.data.elements.nodes.length; i < ii; i++) {
        Dh[i][i] = D3FD.data.elements.nodes[i].data.zScore || 1
    }
    var E = hotnet.heatExchange(F, Dh)
        //console.log(E)
    var neighlists = []
    for (var i = 0, ii = D3FD.data.elements.nodes.length; i < ii; i++) {
        var list = []
        neighlists.push(list)
        for (var j = 0, jj = D3FD.data.elements.nodes.length; j < jj; j++) {
            if (j !== i && (E._data[i][j] > gamma || E._data[j][i] > gamma)) {
                list.push(j)
            }
        }
    }

    var subnetworks = graphutil.disconnectedSubgraphs(D3FD.data.elements.nodes, neighlists)
    console.log(subnetworks)
    D3FD.data.elements.groups = subnetworks

    return D3FD.data

}

exp.removeGeneFromNetwork = function(id) {

    var index = D3FD.hashNodes[id]
    if (index !== undefined) {
        while (true) {
            var linkRemoved = false
            var e
            var ee = D3FD.force.links().length
            for (e = 0; e < ee; e++) {
                var lnk = D3FD.force.links()[e]
                if (lnk.source.id === id || lnk.target.id === id) {
                    linkRemoved = true
                    break
                }
            }
            if (linkRemoved) {
                D3FD.force.links().splice(e, 1)
            } else {
                break
            }
        }
        D3FD.force.nodes().splice(index, 1)
        D3FD.data.elements.nodes.splice(index, 1)
        D3FD.rehash()

        D3FD.initNodes()
        D3FD.initLinks()
        D3FD.unfixNodes()
        D3FD.force.start()
        //var groups = graphutil.disconnectedSubgraphs(D3FD.data.elements.nodes, D3FD.neighborlists)
        //D3FD.data.elements.groups = groups
    }
}

exp.removeGroup = function(groupIndex) {

    var group = D3FD.data.elements.groups[groupIndex]
    group.sort(function(a, b) {
        return a - b
    })
    for (var i = group.length - 1; i >= 0; i--) {
        //        console.log('removing node', D3FD.data.elements.nodes[group[i]])
        exp.removeNode(D3FD.data.elements.nodes[group[i]].data, false)
    }
    D3FD.rehash()
    var groups = graphutil.disconnectedSubgraphs(D3FD.data.elements.nodes, D3FD.neighborlists)
    D3FD.data.elements.groups = groups

    return D3FD.data
}

exp.addNode = function(node) {
    if (!node || !node.data || !node.groups) {
        console.warn('d3fd.addNode: argument must have properties: "data", "groups"')
    }
    D3FD.force.nodes().push(node.data)
    _.last(D3FD.force.nodes()).visited = 0
    _.last(D3FD.force.nodes()).groups = node.groups
    _.last(D3FD.force.nodes()).customGroups = node.customGroups
}

exp.addLink = function(data) {

    var sourceNode = D3FD.force.nodes()[D3FD.hashNodes[data.source]]
    var targetNode = D3FD.force.nodes()[D3FD.hashNodes[data.target]]
    if (!sourceNode || !targetNode) {
        console.log('addLink: unknown node given: ' + data.source + ', ' + data.target)
    }
    D3FD.force.links().push({
        'source': sourceNode,
        'target': targetNode,
        'visited': 0,
        'weight': data.weight
    })
}

exp.getNodeById = function(id) {
    return D3FD.hashNodes[id]
}

exp.getGeneObjectById = function(id) {
    return D3FD.data.elements.nodes[D3FD.hashNodes[id]]
}
