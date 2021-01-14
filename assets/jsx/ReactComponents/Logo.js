var _ = require('lodash')
var React = require('react')

var Logo = React.createClass({

    propTypes: {
        w: React.PropTypes.number.isRequired,
        h: React.PropTypes.number.isRequired,
        style: React.PropTypes.object,
        progress: React.PropTypes.array,
        mirrored: React.PropTypes.bool,
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
            React.createElement("img", {className: "kidneynetwork", title: "KidneyNetwork", src:GN.urls.main + '/images/kn_logo.png', width: this.props.w, height: this.props.h})
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
