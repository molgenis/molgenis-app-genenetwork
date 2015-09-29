'use strict';

var _ = require('lodash')
var React = require('react')
var OpenMenu = require('./OpenMenu')
var SquareSVG = require('./SVGCollection').SquareSVG
var color = require('../../js/color')

var LegendPanel = React.createClass({

    propTypes: {
        data: React.PropTypes.object.isRequired,
        coloring: React.PropTypes.string,
        termColoring: React.PropTypes.string,
    },

    getInitialState: function() {
        return {
            items: this.getItems(this.props.coloring, this.props.termColoring)
        }
    },

    componentWillReceiveProps: function(nextProps) {
        if (this.isMounted() && this.shouldComponentUpdate(nextProps, null)) {
            this.setState({
                items: this.getItems(nextProps.coloring, nextProps.termColoring)
            })
        }
    },
    
    shouldComponentUpdate: function(nextProps, nextState) {
        return nextProps.coloring != this.props.coloring
            || nextProps.termColoring != this.props.termColoring
            || nextProps.data.elements.nodes.length != this.props.data.elements.nodes.length
            || nextProps.data.elements.edges.length != this.props.data.elements.nodes.length
    },

    getItems: function(coloring, termColoring) {
        if (coloring == 'biotype') {
            return this.getItemsBiotype()
        } else if (coloring == 'chr') {
            return this.getItemsChr()
        } else if (coloring == 'cluster') {
            return this.getItemsCluster()
        } else if (coloring == 'custom') {
            return this.getItemsGroup()
        } else if (coloring == 'term') {
            if (termColoring == 'prediction') {
                return this.getItemsScore()
            } else if (termColoring == 'annotation') {
                return this.getItemsAnnotation()
            }
        }
        return []
    },

    getItem: function(label, clr) {
        return (
                <div style={{display: 'inline-block', paddingRight: '10px'}} key={label}>
                <SquareSVG size={12} color={clr} padding='1px 2px 0 0' />
                <span>{label}</span>
                </div>
        )
        // return (
        //         <tr key={label}>
        //         <td><SquareSVG size={12} color={clr} padding='1px 2px 0 0' /></td>
        //         <td>{label}</td>
        //         </tr>
        // )
    },
    
    getItemsBiotype: function() {
        var biotypes = {}
        _.forEach(this.props.data.elements.nodes, function(node) {
            biotypes[node.data.biotype] = true
        });
        var color2biotypes = {}
        _.forEach(biotypes, function(thisistrue, biotype) {
            var clr = color.biotype2color[biotype]
            if (color2biotypes[clr] === undefined) {
                color2biotypes[clr] = []
            }
            color2biotypes[clr].push(biotype)
        })
        var that = this
        var items = []
        _.forEach(color2biotypes, function(biotypes, clr) {
            items.push(that.getItem(biotypes.join(', ').replace(/_/g, ' '), clr))
        });
        return items
    },

    getItemsChr: function() {
        var that = this
        var chrs = {}
        _.forEach(this.props.data.elements.nodes, function(node) {
            chrs[node.data.chr] = true
        });
        var color2chrs = {}
        _.forEach(chrs, function(thisistrue, chr) {
            var clr = color.chr2color[chr]
            if (color2chrs[clr] === undefined) {
                color2chrs[clr] = []
            }
            color2chrs[clr].push(chr)
        })
        var items = []
        _.forEach(color2chrs, function(chrs, clr) {
            items.push(that.getItem(chrs.join(', ').replace('_', ' '), clr))
        })
        return items
    },

    getItemsCluster: function() {
        var that = this
        var items = _.map(this.props.data.elements.groups, function(group, i) {
            if (group.type != 'auto') {
                return null
            }
            var clr = color.cluster2color[i]
            return that.getItem(group.name, clr)
        })
        return items
    },

    getItemsGroup: function() {
        var that = this
        var items = _.map(this.props.data.elements.groups, function(group, i) {
            if (group.type != 'custom') {
                return null
            }
            var clr = color.group2color[group.index_]
            return that.getItem(group.name, clr)
        })
        return items
    },

    getItemsScore: function() {
        var that = this
        var clrs = [color.colors.gnblue, color.colors.gnbluelightgray, color.colors.gnlightgray, color.colors.gnredlightgray, color.colors.gnred]
        var labels = ['< -10', '-5', '0', '5', '10 >']
        var items = []
        _.forEach(labels, function(label, i) {
            items.push(that.getItem(label, clrs[i]))
        })
        return items
    },

    getItemsAnnotation: function() {
        var that = this
        var clrs = [color.colors.gngray, color.colors.gnred]
        var labels = ['not annotated', 'annotated']
        var items = _.map(labels, function(label, i) {
            return that.getItem(label, clrs[i])
        })
        return items
    },
    
    render: function() {

        if (!this.state || !this.state.items) return null
        // <table className='noselect defaultcursor' style={{backgroundColor: color.colors.gnwhite}}>
        // <tbody>
        return (
                <div className='gn-network-legendpanel'>
                <span className='noselect defaultcursor' style={{padding: '9px 10px', float: 'left', backgroundColor: color.colors.gnwhite}}>COLOR GENES BY</span>
                <OpenMenu options={this.props.coloringOptions} selected={this.props.coloring} onSelect={this.props.onColoring} style={{float: 'left'}} />
                <div className='gn-network-legendpanel-legend noselect' style={{float: 'left', padding: '8px 10px 9px 10px', backgroundColor: color.colors.gnwhite}}>
                {this.state.items}
            </div>
            </div>
        )
    }

})

module.exports = LegendPanel
