var React = require('react')
var color = require('../../js/color')

var RadioButtonWithLabel = React.createClass({

    propTypes: {
        label: React.PropTypes.string,
        isChecked: React.PropTypes.bool,
        onChange: React.PropTypes.func
    },
    
    render: function() {

        var className = this.props.isChecked ? 'paddingleftsmall' : 'paddingleftsmall'
        // <circle cx='5' cy='5' r='5' fill={this.props.isChecked ? color.colors.gndarkgray : color.colors.gngray} strokeWidth={0} shapeRendering='crispEdges' />
        return (
                <label title={'Color genes by ' + this.props.label.toLowerCase()}>
                <input
            type='radio'
            checked={this.props.isChecked}
            onChange={this.props.onChange}
                />
                <svg viewBox='0 0 16 16' width={12} height={12} style={{float: 'left', paddingTop: '4px'}}>
                <rect x='0' y='0' width='16' height='16' fill={this.props.isChecked ? color.colors.gndarkgray : color.colors.gngray} strokeWidth={0} shapeRendering='crispEdges' />
                </svg>
                <span className='paddingleftsmall' style={{color: this.props.isChecked ? color.colors.gndarkgray : color.colors.gngray}}>{this.props.label}</span>
            </label>
        )
    }
});

module.exports = RadioButtonWithLabel;