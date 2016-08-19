'use strict'

var _ = require('lodash')
var d3 = require('d3')
var color = require('./color.js')

// this -> that
// state, props
// zoom, brush optional
// classed vs. style
// init brush etc
// event vs. sourceevent
// classes based on instance // wtf?
// replace selectAll with predefined variables where possible
// onSelect -> fire events

d3.fisheye = {
    scale: function(scaleType) {
        return d3_fisheye_scale(scaleType(), 3, 0);
    },
    circular: function() {
        var radius = 200,
            distortion = 2,
            k0,
            k1,
            focus = [0, 0];

        function fisheye(d) {
            var dx = d.x - focus[0],
                dy = d.y - focus[1],
                dd = Math.sqrt(dx * dx + dy * dy);
            if (!dd || dd >= radius) return {x: d.x, y: d.y, z: dd >= radius ? 1 : 10};
            var k = k0 * (1 - Math.exp(-dd * k1)) / dd * .75 + .25;
            return {x: focus[0] + dx * k, y: focus[1] + dy * k, z: Math.min(k, 10)};
        }

        function rescale() {
            k0 = Math.exp(distortion);
            k0 = k0 / (k0 - 1) * radius;
            k1 = distortion / radius;
            return fisheye;
        }

        fisheye.radius = function(_) {
            if (!arguments.length) return radius;
            radius = +_;
            return rescale();
        };

        fisheye.distortion = function(_) {
            if (!arguments.length) return distortion;
            distortion = +_;
            return rescale();
        };

        fisheye.focus = function(_) {
            if (!arguments.length) return focus;
            focus = _;
            return fisheye;
        };

        return rescale();
    }
};

function d3_fisheye_scale(scale, d, a) {

    function fisheye(_) {
        var x = scale(_),
            left = x < a,
            range = d3.extent(scale.range()),
            min = range[0],
            max = range[1],
            m = left ? a - min : max - a;
        if (m == 0) m = max - min;
        return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
    }

    fisheye.distortion = function(_) {
        if (!arguments.length) return d;
        d = +_;
        return fisheye;
    };

    fisheye.focus = function(_) {
        if (!arguments.length) return a;
        a = +_;
        return fisheye;
    };

    fisheye.copy = function() {
        return d3_fisheye_scale(scale.copy(), d, a);
    };

    fisheye.nice = scale.nice;
    fisheye.ticks = scale.ticks;
    fisheye.tickFormat = scale.tickFormat;
    return d3.rebind(fisheye, scale, "domain", "range");
}

function D3Network(elem, props) {

    if (false === (this instanceof D3Network)) {
        return new D3Network(elem, props)
    }
    
    this.elem = elem
    this._state = {}
    this._props = props || {}
    this._props.alphaThresholds = this._props.alphaThresholds || [0.01, 0.07]
    this._props.ticksPerRender = this._props.ticksPerRender || 3
    this._props.width = this._props.width || elem.offsetWidth
    this._props.height = this._props.height || elem.offsetHeight
    this._props.nodeHeight = this._props.nodeHeight || 30
    this._props.labelColor = this._props.labelColor || '#000000'
    this._props.labelSizeEm = this._props.labelSizeEm || 1
    this._props.minZoomScale = this._props.minZoomScale || 0.05
    this._props.maxZoomScale = this._props.maxZoomScale || 10


    this._x = d3.scale.linear()
        .domain([0, this._props.width])
        .range([0, this._props.width])
    this._y = d3.scale.linear()
        .domain([0, this._props.height])
        .range([0, this._props.height])

    this._initDrag()
    this._initZoom()
    this._initBrush()
    this._initForce()
    this._addDOMElements()
    this._addKeyListeners()

    this.setSelectionMode('move')
}

D3Network.prototype._initForce = function() {
    this._force = d3.layout.force()
        .gravity(this._props.gravity || .7)
        .distance(this._props.distance || 150)
        .charge(this._props.charge || -2000)
        .theta(this._props.theta || 0.8)
        .size([this._props.width, this._props.height])
    
    this._force.on('start', this._startForce.bind(this))
    var that = this
    this._force.on('end', function() {
        console.debug('D3Network: force directed layout calculation: %d ms', (Date.now() - that._startForceTime))
        // that.unfixNodes()
    })
}

D3Network.prototype.tweenZoom = function(factor, duration) {
    var initialZoomScale = this._zoom.scale()
    var initialZoomTranslate = this._zoom.translate()
    var newZoomScale = Math.max(Math.min(factor * initialZoomScale, this._props.maxZoomScale), this._props.minZoomScale)
    // var newZoomTranslate = [(1 - newZoomScale) * this._props.width / 2, (1 - newZoomScale) * this._props.height / 2]
    var newZoomTranslate = [initialZoomTranslate[0] + (initialZoomScale - newZoomScale) * this._props.width / 2,
                            initialZoomTranslate[1] + (initialZoomScale - newZoomScale) * this._props.height / 2]
    
    var that = this
    d3.transition().duration(duration || 200).ease('cubic-in-out').tween('zoom', function() {
        var iScale = d3.interpolate(initialZoomScale, newZoomScale)
        var iTranslate = d3.interpolate(initialZoomTranslate, newZoomTranslate)
        return function(t) {
            that._zoom.scale(iScale(t))
            that._zoom.translate(iTranslate(t))
            that.updateZoom()
        }
    })

    return newZoomScale
}

D3Network.prototype.updateZoom = function() {
    if (this._brushvis) {
        this._brushvis.attr('transform', 'translate(' + this._zoom.translate() + ')scale(' + this._zoom.scale() + ')')
    }
    this._nodevis.attr('transform', 'translate(' + this._zoom.translate() + ')scale(' + this._zoom.scale() + ')')
    this._linkvis.attr('transform', 'translate(' + this._zoom.translate() + ')scale(' + this._zoom.scale() + ')')
}

D3Network.prototype.getZoomScale = function() {
    return this._zoom.scale()
}

D3Network.prototype.isZoomedMax = function() {
    return this._zoom.scale() >= this._props.maxZoomScale
}

D3Network.prototype.isZoomedMin = function() {
    return this._zoom.scale() <= this._props.minZoomScale
}

D3Network.prototype._initZoom = function() {
    var that = this
    this._zoom = d3.behavior.zoom()
        .scaleExtent([this._props.minZoomScale, this._props.maxZoomScale])
        .x(that._x)
        .y(that._y)
        .on('zoomstart', function() {
        })
        .on('zoom', function() {
            // if (!that._state.isBrushing && d3.event && d3.event.sourceEvent && d3.event.sourceEvent.altKey) {
            if (!that._state.isBrushing && !that._state.isDragging) {
                // && (WheelEvent && se instanceof WheelEvent) || (TouchEvent && se instanceof TouchEvent)) {        
                that._brushvis.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
                that._nodevis.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
                that._linkvis.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
            }
        })
        .on('zoomend', function() {
            if (that._props.onZoomEnd) {
                that._props.onZoomEnd(that._zoom.scale())
            }
        })
}

D3Network.prototype._initBrush = function() {
    this._state.isBrushing = false
    this._state.nodeIdsInsideBrush = {}

    var that = this
    this._brush = d3.svg.brush()
        .x(d3.scale.linear()
           .range([-10 * that._props.width, 10 * that._props.width])
           .domain([-10 * that._props.width, 10 * that._props.width]))
        .y(d3.scale.linear()
           .range([-10 * that._props.height, 10 * that._props.height])
           .domain([-10 * that._props.height, 10 * that._props.height]))
        .on('brushstart', function(d) {
            if (that._state.mode === 'move') {
                that._state.isBrushing = false
                if (that._brush.empty()) {
                    d3.select('.brush').style('visibility', 'hidden')
                }
                if (_.size(that._state.nodeIdsInsideBrush) === 0) {
                    that._nodevis.selectAll('.hidden, .semihidden').classed('hidden semihidden', false).style('opacity', 1)
                    that._link.classed('hidden semihidden', false).style('opacity', 1)
                    if (that._props.onSelect && that._data.elements.groups) {
                        that._props.onSelect(that._data.elements.groups[0])
                    }
                }
            } else {
                that._state.isBrushing = true
                that._state.nodeIdsInsideBrush = {}
                that._state.zoomTranslateOnBrushStart = that._zoom.translate()
                // exp.hideBackgroundRects()
                d3.select('.brush').style('visibility', 'visible')
            }
        })
        .on('brush', function() {
            if (that._state.isBrushing) {
                that._updateBrush()
            }
        })
        .on('brushend', function() {
            if (that._state.isBrushing) {
                that._zoom.translate(that._state.zoomTranslateOnBrushStart)
                if (that._brush.empty()) {
                    that._nodevis.selectAll('.hidden').classed('hidden', false).style('opacity', 1)
                    that._link.classed('hidden semihidden', false).style('opacity', 1)
                    // TODO no group select on programmatic .event() to allow pathway analysis
                    if (that._props.onSelect && that._data.elements.groups) {
                        that._props.onSelect(that._data.elements.groups[0])
                    }
                }
                d3.select(this).call(d3.event.target)
                that._state.isBrushing = false
                that.showAll()
            }
        })
}

D3Network.prototype._updateBrush = function() {
    
    if (!this._brush || this._brush.empty()) return false
    var nodes = []
    
    //// comment above, uncomment below to enable multiple selection with shift key
    // var isShiftDown = d3.event && (d3.event.shiftKey || (d3.event.sourceEvent && d3.event.sourceEvent.shiftKey))
    // if (!this._brush || (!isShiftDown && this._brush.empty())) return false
    // var nodes = (isShiftDown && this._data.elements.groups) ? _.last(this._data.elements.groups).nodes : [] // previously selected nodes
    
    var e = this._brush.extent()
    var numVisible = 0
    var selectedNodeIds = {}

    var that = this
    this._nodevis.selectAll('g.node>rect.main')
        .classed('hidden', false)
        .style('opacity', 1)
        .filter(function(d) {
            if (e[0][0] > d.x || d.x > e[1][0] || e[0][1] > d.y || d.y > e[1][1]) { // outside of brush
                var index = nodes.indexOf(d.id)
                if (index === -1) {
                    return true
                } else { // node was among previously selected ones...
                    if (that._state.nodeIdsInsideBrush[d.id] === true) { // ...and within the current brushing context
                        nodes.splice(index, 1)
                    }
                    that._state.nodeIdsInsideBrush[d.id] = false
                    return false
                }
            } else { // inside of brush
                that._state.nodeIdsInsideBrush[d.id] = true
                if (nodes.indexOf(d.id) === -1) {
                    nodes.push(d.id)
                }
                numVisible++
                selectedNodeIds[d.id] = true
                return false
            }
        })
        .classed('hidden', true)
        .style('opacity', 0.3)
    
    // only highlight links in small networks for speed
    if (this._data.elements.nodes.length < 101) {
        if (numVisible > 0) {
            var connectedNodeIds = {}
            this._link
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
            this._link
                .classed('hidden', true)
                .style('opacity', 0.3)
        }
    }

    if (this._data.elements.groups) {
        _.last(this._data.elements.groups).nodes = nodes
        if (this._props.onSelect) {
            this._props.onSelect(_.last(this._data.elements.groups), false)
        }
    }
}

D3Network.prototype._initDrag = function() {
    var that = this
    this._state.isDragging = false
    this._drag = d3.behavior.drag()
        .on('dragstart', function() {
            that._state.zoomTranslateOnDragStart = that._zoom.translate()
        })
        .on('drag', function(node) {

            if (node.source) return // is a link, not a node
            that._state.isDragging = true // pretend we're dragging even when alt down to avoid firing of click event on mouse release // TODO fix
            // if (d3.event.sourceEvent && d3.event.sourceEvent.altKey) return
            // if (that._state.mode === 'move') return

            node.x = d3.event.x
            node.y = d3.event.y
            // rounding to make the svg size smaller, matters when sending large networks to server for pdf conversion
            d3.select(this).attr('transform', 'translate(' + Math.round(100 * d3.event.x) / 100 + ',' + Math.round(100 * d3.event.y) / 100 + ')')    
            that._link
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
        })
        .on('dragend', function() {
            if (that._state.zoomTranslateOnDragStart) {
                that._zoom.translate(that._state.zoomTranslateOnDragStart)
            }
            setTimeout(function() { // 'click' event fires after 'dragend' and it's nice if 'click' knows whether the click was a result of dragging or not // TODO small movements should be allowed
                that._state.isDragging = false
            }, 50)
        })
}

D3Network.prototype.setSelectionMode = function(type) {
    if (type === 'move') {
        this._state.mode = 'move'
        document.getElementsByClassName('background')[0].style.cursor = 'move' // the brush background
        this._nodevis.selectAll('g.node>rect,text').style('cursor', 'pointer')
        this._linkvis.selectAll('line.link').style('cursor', 'move')
    } else if (type === 'select') {
        this._state.mode = 'select'
        document.getElementsByClassName('background')[0].style.cursor = 'crosshair' // the brush background
        this._nodevis.selectAll('g.node>rect,text').style('cursor', 'pointer')
        this._linkvis.selectAll('line.link').style('cursor', 'initial')
    }
}   

D3Network.prototype._addKeyListeners = function() {
    var that = this
    d3.select('body')
        .on('keydown', function() {
            if (d3.event.keyCode === 16) { // 16 shift 17 ctrl 18 alt
                if (that._props.onSelectionModeChange) {
                    that._props.onSelectionModeChange('select')
                } else {
                    that.setSelectionMode('select')
                }
            }
        })
        .on('keyup', function() {
            if (d3.event.keyCode === 16) { // 16 shift 17 ctrl 18 alt
                if (that._props.onSelectionModeChange) {
                    that._props.onSelectionModeChange('move')
                } else {
                    that.setSelectionMode('move')
                }
            }
        })
}    

D3Network.prototype._addDOMElements = function() {
    var that = this
    this._vis = d3.select(this.elem).append('svg:svg')
    //this._vis = d3.select(this.elem).insert('svg:svg', ':first-child')
        .attr('id', 'networksvg')
        .attr('width', that._props.width)
        .attr('height', that._props.height)

    if (this._brush) {
        this._brushvis = this._vis.append('g')
            .attr('class', 'brush')
            .call(this._brush)
    }

    this._linkvis = this._vis.append('svg:g')
        .attr('id', 'links')

    this._nodevis = this._vis.append('svg:g')
        .attr('id', 'nodes')
    
    if (this._zoom) {
        this._vis.call(this._zoom)
    }
}

D3Network.prototype._clearData = function() {
    this._data = {}
    this._force.links().splice(0)
    this._force.nodes().splice(0)
    this._hashNodes = {}
}

D3Network.prototype._initScales = function() {
    if (!this._data) return false

    if (this._data.edgeValueScales) {
        this._linkscales = []
        for (var i = 0, ii = this._data.edgeValueScales.length; i < ii; i++) {
            this._linkscales.push(d3.scale.linear()
                                  .domain(this._data.edgeValueScales[i])
                                  .range(this._data.edgeColorScales[i])
                                  .clamp(true))
        }
    }
    
    this._nodescale = d3.scale.linear()
        .domain([-10, 0, 10])
        .range([color.colors.gnblue, color.colors.gnlightgray, color.colors.gnred])
        .clamp(true)
}

D3Network.prototype._initNodes = function() {
    this._node = this._nodevis.selectAll('g.node')
        .data(this._force.nodes(), function(d) {
            return d.id
        })


    var hasGroups = !!this._data.elements.groups
    
    var that = this
    var nodeEnter = this._node.enter().append('g')
        .attr('class', 'node')
        .attr('data-id', function(d) {
            return d.id
        })
        .on('click', function(d) {
            if (!that._state.isDragging) {
                if (d3.event.shiftKey && hasGroups) {
                    _.last(that._data.elements.groups).nodes.push(d.id)
                    that.highlightGroup(that._data.elements.groups.length - 1)
                } else {
                    if (hasGroups) {
                        _.last(that._data.elements.groups).nodes = [d.id]
                    }
                    that.highlightNode(d.id)
                }
                if (that._props.onSelect && hasGroups) {
                    that._props.onSelect(_.last(that._data.elements.groups))
                }
            }
        })
        .call(this._drag)

    for (var i = 0; i < 5; i++) { // each node -> max 5 rectangles for multicoloring
        nodeEnter
            .filter(function(d) {
                return i === 0 || (d.customGroups && d.customGroups.length > i)
            })
            .append('rect')
            .attr('class', 'clickable main rect' + (i + 1))
            .attr('height', this._props.nodeHeight) // width will be defined after the bounding box is known
            .attr('rx', 0)
            .attr('ry', 0)
            .attr('y', -(this._props.nodeHeight) / 2) // x will be defined after the bounding box is known
            .style('fill', color.colors.gndarkgray)
    }
    
    nodeEnter.append('text')
        .attr('class', 'nodetext clickable')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .style('fill', that._props.labelColor || color.colors.gndarkgray)
    // .style('font-size', that._props.labelSizeEm + 'em')
        .style('font-family', 'GG')
        .style('font-weight', 'bold')
        .attr('displayState', 'y')
        .text(function(d) {
            return d.name
        })
    
    this._node.exit().remove()
}

D3Network.prototype._initLinks = function() {
    var that = this
    this._link = this._linkvis.selectAll('line.link')
        .data(that._force.links(), function(d) {
            return d.source.id + '-' + d.target.id
        })

    this._link.enter().insert('line')
        .attr('class', 'link clickable')
        .style('stroke', function(d) {
            if (!that._linkscales) {
                return that._props.linkColor || color.colors.linkDefault
            } else {
                return d.weight < 0 ? that._linkscales[1](d.weight) : that._linkscales[0](d.weight)
            }
        })
        .on('click', that._props.onEdgeSelect)
        .call(this._drag)
    
    this._link.exit().remove()
}

D3Network.prototype._initFisheye = function() {
    this._fisheye = d3.fisheye.circular()
        .radius(100)
        .distortion(3)

    var that = this
    this._vis.on('mousemove', function() {
        that._fisheye.focus(d3.mouse(this))
        that._nodevis.selectAll('g.node>rect.main').each(function(d) { d.fisheye = that._fisheye(d) })
            // .attr('x', function(d) { return d.fisheye.x })
            // .attr('y', function(d) { return d.fisheye.y })
            .attr("height", function(d) { return d.fisheye.z * that._props.nodeHeight })
            .attr("width", function(d) { return d.fisheye.z * this.getAttribute('_width')})

        that._nodevis.selectAll('g.node>text')
            .style("font-size", function(d) { return d.fisheye.z * that._props.labelSizeEm + 'em' })

        that._link.attr("x1", function(d) { return d.source.fisheye.x })
            .attr("y1", function(d) { return d.source.fisheye.y })
            .attr("x2", function(d) { return d.target.fisheye.x })
            .attr("y2", function(d) { return d.target.fisheye.y })
    })
}

D3Network.prototype._hide = function() {
    this._nodevis.selectAll('g.node>rect,text')
        .style('opacity', 0)
    this._link
        .style('opacity', 0)
}

D3Network.prototype._show = function() {
    // bounding boxes to make node width fit text length
    this._nodevis.selectAll('g.node>text')
        .style('opacity', 1)
        .each(function(d) {
            d.bbox = this.getBBox()
        })

            // some nodes have 1 rectangle, some more, depending on how many groups they belong to
            this._nodevis.selectAll('g.node>rect')
        .attr('width', function(d) {
            return (d.bbox.width + 12) / ((d.customGroups && d.customGroups.length) || 1)
        })
        .attr('_width', function(d) { // save original width because se saattaa muuttua
            return (d.bbox.width + 12) / ((d.customGroups && d.customGroups.length) || 1)
        })
        .attr('x', function(d) {
            var rectNum = +(this.getAttribute('class').match(/rect(\d)/)[1])
            return -(d.bbox.width + 12) / 2 + (rectNum - 1) * (d.bbox.width + 12) / ((d.customGroups && d.customGroups.length) || 1)
        })

    this.showAll()
}

D3Network.prototype.showAll = function() {
    this._nodevis.selectAll('g.node>rect.main')
        .style('opacity', 1)
    
    this._link
        .style('opacity', 1)
}

D3Network.prototype._move = function(dx, dy) {
    dx = dx || 0
    dy = dy || 0

    this._node.attr('transform', function(d) {
        // rounding to make the svg smaller, matters when sending large networks to server for pdf conversion
        // TODO optional rounding
        d.x = Math.round(100 * (d.x - dx)) / 100
        d.y = Math.round(100 * (d.y - dy)) / 100
        return 'translate(' + d.x + ',' + d.y + ')'
    })
    this._link
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
}

D3Network.prototype.fixNodes = function() {
    _.each(this._force.nodes(), function(d) { d.fixed = true })
        }

D3Network.prototype.unfixNodes = function() {
    _.each(this._force.nodes(), function(d) { d.fixed = false })
        }

D3Network.prototype._startForce = function() {
    var that = this
    this._startForceTime = Date.now()
    requestAnimationFrame(function render() {
        for (var i = 0; i < that._props.ticksPerRender; i++) {
            that._force.tick()
        }
        if (that._layoutDone === true) { // don't move when initialising network for speed
            that._move()
            that._updateBrush()
        }
        // console.debug(that._force.alpha())
        if (that._force.alpha() > that._props.alphaThresholds[that._data.elements.nodes.length < 100 ? 0 : 1]) {
            requestAnimationFrame(render)
        } else { // layout calculated
            if (that._layoutDone === false) { // show network after it has loaded and laid out

                //// calculate proper zoom level from the extent of nodes
                var extent = [1000000, 0, 0, 1000000] // NESW
                that._node.each(function(d) {
                    extent[0] = Math.min(d.y, extent[0])
                    extent[1] = Math.max(d.x, extent[1])
                    extent[2] = Math.max(d.y, extent[2])
                    extent[3] = Math.min(d.x, extent[3])
                })

                    var initialZoomScale = 0.1
                var initialZoomTranslate = [(1 - initialZoomScale) * that._props.width / 2, (1 - initialZoomScale) * that._props.height / 2]
                var factor = that._data.elements.nodes.length < 20 ? 0.5 : 0.85
                var fitZoomScale = factor / (Math.max((extent[2] - extent[0]) / that._props.height, (extent[1] - extent[3]) / that._props.width))
                var fitZoomTranslate = [(1 - fitZoomScale) * that._props.width / 2, (1 - fitZoomScale) * that._props.height / 2]
                
                // console.debug(initialZoomScale, initialZoomTranslate, fitZoomScale, fitZoomTranslate)
                
                that._zoom.scale(initialZoomScale)
                that._zoom.translate(initialZoomTranslate)
                that.updateZoom()

                that._show()
                d3.transition().duration(500).ease('cubic').tween('zoom', function() {
                    var iScale = d3.interpolate(initialZoomScale, fitZoomScale)
                    var iTranslate = d3.interpolate(initialZoomTranslate, fitZoomTranslate)
                    return function(t) {
                        that._zoom.scale(iScale(t))
                        that._zoom.translate(iTranslate(t))
                        that.updateZoom()
                    }
                })
            }
            that._layoutDone = true
            that._force.stop()
            that._move()
            that._updateBrush()
            that._props.onProgress && that._props.onProgress('done')
        }
    })
}

D3Network.prototype._rehash = function() {
    this._hashNodes = {}
    for (var n = 0, nn = this._force.nodes().length; n < nn; n++) {
        var node = this._force.nodes()[n]
        this._hashNodes[node.id] = n
    }
    for (var e = 0, ee = this._force.links().length; e < ee; e++) {
        var si = this._hashNodes[this._force.links()[e].source.id]
        var ti = this._hashNodes[this._force.links()[e].target.id]
    }
}


D3Network.prototype.resize = function(w, h) {
    this._props.width = w
    this._props.height = h
    this._vis.attr('width', w)
    this._vis.attr('height', h)
}

D3Network.prototype.draw = function(data) {

    console.debug('D3Network.draw: %d nodes, %d edges', data.elements.nodes.length, data.elements.edges.length)

    var ts = Date.now()
    this._clearData()
    this._data = data
    this._state.showNegatives = this._props.showNegatives || false
    for (var n = 0, nn = data.elements.nodes.length; n < nn; n++) {
        this._addNode(data.elements.nodes[n])
    }

    this._rehash()
   
    for (var e = 0, ee = data.elements.edges.length; e < ee; e++) {
        if (this._state.showNegatives || data.elements.edges[e].data.weight == undefined || data.elements.edges[e].data.weight > 0) {
            this._addLink(data.elements.edges[e].data)
        }
    }

    this._rehash()
    console.debug('D3Network.draw: nodes and links added')
    
    this._initScales()
    console.debug('D3Network.draw: scales added')
    this._initNodes()
    console.debug('D3Network.draw: nodes initialised')
    this._initLinks()
    console.debug('D3Network.draw: links initialised')

    // TODO state
    // this._initFisheye()
    
    console.debug('D3Network.draw: initialisation %d ms', (Date.now() - ts))
    this._hide()
    this._layoutDone = false
    this._props.onProgress && this._props.onProgress('calculating layout')
    this._force.start()
}

D3Network.prototype.toggleNetwork = function(data) {

    console.debug('D3Network.draw: %d nodes, %d edges', data.elements.nodes.length, data.elements.edges.length)
    var ts = Date.now()

    this._force.links().splice(0)
    
    for (var e = 0, ee = data.elements.edges.length; e < ee; e++) {
        if (this._state.showNegatives || data.elements.edges[e].data.weight == undefined || data.elements.edges[e].data.weight > 0) {
            this._addLink(data.elements.edges[e].data)
        }
    }

    this._rehash()

    this._initNodes()
    this._initLinks()
    
    console.debug('D3Network.draw: initialisation %d ms', (Date.now() - ts))

    this.unfixNodes()
    this._force.start()
}

// TODO remove
D3Network.prototype.addNodeToDataAndNetwork = function(gene, zScores) {

    console.debug('D3Network.addNodeToDataAndNetwork: Adding %s', gene.name)
    //console.debug('zScores.length ' + zScores.length + ', nodes.length ' + this._data.elements.nodes.length)

    gene.added = true
    this._data.elements.nodes.push({data: gene})
    this._addNode({data: gene})
    this._rehash()

    var threshold = this._threshold || this._data.threshold || 0
    for (var i = 0, ii = zScores.length; i < ii - 1; i++) { // -1 to account for this just added gene, sorting danger here // TODO fix
        if (Math.abs(zScores[i] >= threshold)) {
            var edge = {source: gene.id,
                        target: this._data.elements.nodes[i].data.id,
                        weight: zScores[i]}
            this._data.elements.edges.push({data: edge})
            this._addLink(edge)
        }
    }
    
    this._initNodes()
    this._initLinks()
    
    this._rehash()
    // TODO optimize by only showing the added node
    this._show()
    
    // this._data.elements.groups[2].nodes = [gene.id]
    // exp.highlightNode(gene.id)
    // this._onSelect()
    
    this.unfixNodes()
    this._force.start()
}

//TODO assumes negative weight edges are in the end of edge list
D3Network.prototype.toggleNegative = function() {

    if (!this._data) return

    var that = this
    this._state.showNegatives = !this._state.showNegatives
    if (this._state.showNegatives) {
        for (var e = 0, ee = this._data.elements.edges.length; e < ee; e++) {
            if (this._data.elements.edges[e].data.weight < 0) {
                this._addLink(this._data.elements.edges[e].data)
            }
        }
    } else {
        var links = this._force.links()
        var numLinks = links.length
        var numRemoved = 0
        for (var i = numLinks - 1; i >= 0; i--) {
            if (links[i].weight < 0) {
                numRemoved++
            } else {
                break
            }
        }
        this._force.links().splice(numLinks - numRemoved, numRemoved)
        console.debug('D3Network.toggleNegative: removed ' + numRemoved + ' links out of ' + numLinks)
        this._link
            .style('stroke', function(d) {
                return that._linkscales ? that._linkscales[0](d.weight) : that._props.linkColor || color.colors.linkDefault
            })
    }
    
    this._initLinks()
    this.unfixNodes()
    this._force.start()
}

D3Network.prototype.highlightNode = function(id) {

    //console.debug('highlighting node', id)
    this._brush.clear()

    var connectedNodeIds = {}
    _.each(this._force.links(), function(link) {
        if (link.source.id === id) {
            connectedNodeIds[link.target.id] = true
        }
        if (link.target.id === id) {
            connectedNodeIds[link.source.id] = true
        }
    })
        
        this._nodevis.selectAll('g.node>rect.main')
        .classed('hidden', true)
        .style('opacity', 0.3)
        .filter(function(d) {
            return d.id === id || connectedNodeIds[d.id] === true
        })
        .classed('hidden', false)
        .classed('semihidden', true)
        .style('opacity', 0.7)
        .filter(function(d) {
            return d.id === id
        })
        .style('opacity', 1)

    this._linkvis.selectAll('line.link')
        .style('opacity', 0.3)
        .filter(function(d) {
            return d.source.id == id || d.target.id == id
        })
        .style('opacity', 1)
}

D3Network.prototype.highlightGroup = function(groupIndex) {

    if (!this._data.elements.groups) return
    
    this._brush.clear()
    var selectedNodeIds = {}
    var that = this
    this._nodevis.selectAll('g.node>rect.main')
        .classed('hidden', true)
        .style('opacity', 0.3)
        .filter(function(d) {
            if (that._data.elements.groups[groupIndex].nodes.indexOf(d.id) > -1) {
                selectedNodeIds[d.id] = true
                return true
            }
            return false
        })
        .classed('hidden', false)
        .style('opacity', 1)
    
    this._link
        .style('opacity', 0.3)
        .filter(function(d) {
            return selectedNodeIds[d.source.id] === true || selectedNodeIds[d.target.id] === true
        })
        .style('opacity', 1)
}

D3Network.prototype.colorBy = function(type) {

    var that = this

    var node2cluster = {}
    if (type === 'cluster') {
        var index = 0
        for (var i = 0; i < this._data.elements.groups.length; i++) {
            if (this._data.elements.groups[i].type === 'cluster') {
                for (var j = 0; j < this._data.elements.groups[i].nodes.length; j++) {
                    node2cluster[this._data.elements.groups[i].nodes[j]] = index
                }
                index++
            }
        }
    }
    
    // if (type === 'prediction') {
    //     this._nodevis.selectAll('g.node>text')
    //         .style('fill', that._props.labelColor || color.colors.gndarkgray)
    // }
    this._nodevis.selectAll('g.node>text')
        .style('fill', (type === 'prediction') ? color.colors.gndarkgray : (that._props.labelColor || color.colors.gndarkgray))
        .filter(function(d) {
            return type !== 'prediction' && d.added === true
        })
        .style('fill', color.colors.gnyellow)
    
    this._nodevis.selectAll('g.node>rect.main')
        .style('fill', function(d) {
            if (type == 'biotype') {
                return color.biotype2color[d.biotype]
            } else if (type == 'chr' || type == 'chromosome') {
                return color.chr2color[d.chr]
            } else if (type == 'cluster' && that._data.elements.groups) {
                return color.cluster2color[node2cluster[d.id]] || color.colors.nodeDefault
            } else if (type == 'prediction') {
                return that._nodescale(d.zScore)
            } else if (type == 'annotation') {
                return d.annotated ? color.colors.gnred : color.colors.gngray
            } else if (type == 'custom' && that._data.elements.groups) {
                if (d.customGroups && d.customGroups.length > 0) {
                    var rectNum = +(this.getAttribute('class').match(/rect(\d)/)[1])
                    return color.group2color[d.customGroups[rectNum - 1]]
                } else {
                    return color.colors.nodeDefault
                }
            } else {
                return color.colors.default
            }
        })
}

// TODO remove
D3Network.prototype.removeGeneFromNetwork = function(id) {

    var index = this._hashNodes[id]
    if (index === undefined) return
    
    while (true) {
        var linkRemoved = false
        var e
        var ee = this._force.links().length
        for (e = 0; e < ee; e++) {
            var lnk = this._force.links()[e]
            if (lnk.source.id === id || lnk.target.id === id) {
                linkRemoved = true
                break
            }
        }
        if (linkRemoved) {
            this._force.links().splice(e, 1)
        } else {
            break
        }
    }

    this._force.nodes().splice(index, 1)
    this._data.elements.nodes.splice(index, 1)
    this._rehash()

    this._initNodes()
    this._initLinks()
    this.unfixNodes()
    this._force.start()
}

D3Network.prototype._addNode = function(node) {
    if (!node || !node.data) {
        console.warn('D3Network._addNode: Argument must have properties: "data"')
    }
    this._force.nodes().push(node.data)
    _.last(this._force.nodes()).visited = 0
    _.last(this._force.nodes()).customGroups = node.customGroups
}

D3Network.prototype._addLink = function(data) {

    var sourceNode = this._force.nodes()[this._hashNodes[data.source]]
    var targetNode = this._force.nodes()[this._hashNodes[data.target]]
    if (!sourceNode || !targetNode) {
        console.debug('D3Network._addLink: Unknown node given: %s - %s', data.source, data.target)
    } else {
        this._force.links().push({
            'source': sourceNode,
            'target': targetNode,
            'visited': 0,
            'weight': data.weight
        })
    }
}

//TODO remove
D3Network.prototype.getNodeById = function(id) {
    return this._hashNodes[id]
}

//TODO remove
D3Network.prototype.getGeneObjectById = function(id) {
    return this._data.elements.nodes[this._hashNodes[id]]
}

module.exports = D3Network
