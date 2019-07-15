var _ = require('lodash')
var React = require('react');
var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');

var Logo = createReactClass({

    propTypes: {
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
        style: PropTypes.object,
        progress: PropTypes.array,
        mirrored: PropTypes.bool
    },
    
    componentDidMount: function() {
    },

    componentWillReceiveProps: function(nextProps) {
        //console.log(nextProps.initProgress, nextProps.layoutProgress)
        //this.forceUpdate()
    },
    
    render: function() {
        var strokes = ['#4d4d4d', '#4d4d4d', '#4d4d4d']
        if (this.props.progress) {
            strokes = ['#4d4d4d', '#4d4d4d', '#999999']
        }
        var x = [30, 5, 50, 26, 34, 50, 34, 20, 50, 22, 5, 22, 34, 5]
        var y = [3, 28, 72, 97, 12, 28, 44, 28, 28, 88, 72, 56, 72, 72]
        if (this.props.mirrored) {
            x = _.map(x, function(c) {
                return 55 - c
            })
        }
        return (
                <div style={this.props.style} title='Gene Network' >
                <svg viewBox='0 0 55 100' width={this.props.w} height={this.props.h} fill='none' strokeWidth={6}>
                <polyline points={x[0] + ',' + y[0] + ' ' + x[1] + ',' + y[1] + ' ' + x[2] + ',' + y[2] + ' ' + x[3] + ',' + y[3]} style={{stroke: strokes[2]}} />
                <polyline points={x[4] + ',' + y[4] + ' ' + x[5] + ',' + y[5] + ' ' + x[6] + ',' + y[6]} style={{stroke: strokes[0]}} />
                <line x1={x[7]} y1={y[7]} x2={x[8]} y2={y[8]} style={{stroke: strokes[0]}} />
                <polyline points={x[9] + ',' + y[9] + ' ' + x[10] + ',' + y[10] + ' ' + x[11] + ',' + y[11]} style={{stroke: strokes[1]}} />
                <line x1={x[12]} y1={y[12]} x2={x[13]} y2={y[13]} style={{stroke: strokes[1]}} />
                </svg>
                </div>
        )
        // return (
        //         <div style={this.props.style} title='Gene Network' >
        //         <svg viewBox='0 0 55 100' width={this.props.w} height={this.props.h} fill='none' strokeWidth={6}>
        //         <polyline points='30,3 5,28 50,72 26,97' style={{stroke: strokes[2]}} />
        //         <polyline points='34,12 50,28 34,44' style={{stroke: strokes[0]}} />
        //         <line x1='20' y1='28' x2='50' y2='28' style={{stroke: strokes[0]}} />
        //         <polyline points='22,88 5,72 22,56' style={{stroke: strokes[1]}} />
        //         <line x1='34' y1='72' x2='5' y2='72' style={{stroke: strokes[1]}} />
        //         </svg>
        //         </div>
        // )
    }
})

module.exports = Logo
