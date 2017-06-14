'use strict'

var _ = require('lodash')
var color = require('../../js/color')
var htmlutil = require('../htmlutil')
var genstats = require('genstats')
var prob = genstats.probability

var React = require('react')
var Router = require('react-router')
var DocumentTitle = require('react-document-title')

var SVGCollection = require('./SVGCollection')

var reactable = require('reactable')
var Tr = reactable.Tr
var Td = reactable.Td
var Th = reactable.Th
var Thead = reactable.Thead
var Table = reactable.Table
var unsafe = reactable.unsafe

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}


function getRGB(avg){
    var v = 1-(parseFloat(avg)/20)
    var s = 0.6 + (parseFloat(Math.abs(avg))/7)
    if (parseFloat(avg) >= 0){
        var colors = HSVtoRGB(0.0389, s, v)
        return 'rgb(' + colors.r + ',' + colors.g + ', ' + colors.b + ')'
    } else {
        var colors = HSVtoRGB(0.58, s, v)
        return 'rgb(' + colors.r + ',' + colors.g + ', ' + colors.b + ')'
    }
}

var Diagnosis = React.createClass({

    getInitialState: function() {
        return {}
    },

    componentDidMount: function() {
    },

    componentWillReceiveProps: function(nextProps) {
    },

    render: function() {

        return <div>moi</div>
            
    }
})

module.exports = Diagnosis
