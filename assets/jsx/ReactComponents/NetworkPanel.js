"use strict;"

var _ = require('lodash')
var React = require('react')
var CheckboxWithLabel = require('./CheckboxWithLabel')
var RadioButtonWithLabel = require('./RadioButtonWithLabel')
var SVGCollection = require('./SVGCollection')
var Cookies = require('cookies-js')
var slider = require('../../js/slider')

var NetworkPanel = React.createClass({

    propTypes: {
        data: React.PropTypes.object,
        hasNegatives: React.PropTypes.bool,
        coloring: React.PropTypes.string,
        coloringOptions: React.PropTypes.array.isRequired,
        onColoring: React.PropTypes.func,
        onThresholdChange: React.PropTypes.func,
    },

    componentDidMount: function() {
        this.initSlider(this.props.hasNegatives)
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.hasNegatives != this.props.hasNegatives) {
            this.initSlider(nextProps.hasNegatives)
        }
    },

    initSlider: function(withNegatives) {
        var sliderOptions = {
            width: this.getDOMNode().offsetWidth - 25,
            height: 16,
            colors: this.props.data.edgeColorScales.slice(0, withNegatives ? 2 : 1),
            initialPosRelative: this.props.data.threshold / (this.props.data.edgeValueScales[0][2] - this.props.data.edgeValueScales[0][0]),
            scale: this.props.data.edgeValueScales.slice(0, withNegatives ? 2 : 1)
        }
        // TODO
        // slider('#slider', sliderOptions, this.props.onThresholdChange)
    },
    
    render: function() {

        // console.log('network panel render')

        var that = this
        var buttons = _.map(this.props.coloringOptions, function(opt) {
            return (
                    <div key={opt.key}>
                    <RadioButtonWithLabel isChecked={that.props.coloring == opt.key} label={opt.label} onChange={that.props.onColoring.bind(null, opt.key)} />
                    <br/>
                    </div>
                    
            )
        })
        
        return (
                <div id='networkpanel' className='networkleftpanel noscroll smallpadding bordered' style={{marginBottom: '10px'}}>
                <div id='slider' title={'Change correlation threshold (' + this.props.threshold + ')'}></div>
                {buttons}
            </div>
        )
    }
})

module.exports = NetworkPanel
