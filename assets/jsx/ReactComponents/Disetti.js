var _ = require('lodash')
var htmlutil = require('../../js/htmlutil.js')
var React = require('react')
var Cookies = require('cookies-js')

var Disetti = React.createClass({
    
    propTypes: {
        onClick: React.PropTypes.func,
    },
    
    getInitialState: function() {
        return {}
    },
    
    componentDidMount: function() {
    },
    
    render: function() {
        return (
                <svg viewBox='0 0 16 16' width='16' height='16' onClick={this.props.onClick} className='clickable disetti' style={{strokeWidth: '1px', stroke: '#000000', fill: 'none', shapeRendering: 'crispEdges'}}>
                <polyline points='0,0 0,15 4,15 4,9 12,9 12,15 15,15 15,3 12,0 11,0 11,5 5,5 5,0 0,0' style={{fill: '#999999'}} />
                <polyline points='0,0 0,15 15,15 15,3 12,0 0,0' />
                <polyline points='5,0 5,5 11,5 11,0' />
                <polyline points='4,15 4,9 12,9 12,15' />
                <line x1='6' y1='11' x2='11' y2='11' />
                <line x1='6' y1='13' x2='11' y2='13' />
                <line x1='9' y1='2' x2='9' y2='4' />
                </svg>
        )
    }
})

module.exports = Disetti
