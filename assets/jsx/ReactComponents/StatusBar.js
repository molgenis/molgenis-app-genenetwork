"use strict;"

var React = require('react')
var d3 = require('d3')

var StatusBar = createReactClass({

    getInitialState: function() {
        return {
            progress: 0,
            transition: null
        }
    },
    
    propTypes: {
        id: PropTypes.string.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
        progress: PropTypes.number.isRequired,
        done: PropTypes.bool
    },
    
    componentWillReceiveProps: function(nextProps) {
        var curProgress = this.props.progress
        var base = this.state.transition || d3.select('#' + this.props.id) // chain transitions
        var that = this
        var transition = base.transition().duration(500).ease("easeOutExpo").tween('animation', function() {
            var i = d3.interpolate(curProgress, nextProps.progress)
            return function(t) {
                that.setState({
                    progress: i(t)
                })
            }
        }).each('end', function() {
            that.setState({
                transition: null
            })
        })
        this.setState({
            transition: transition
        })
    },
    
    render: function() {

        if (!this.props.done) {
            return (
                    <div className='statusbar'>
                    <svg viewBox='0 0 100 10' width={this.props.w} height={this.props.h} preserveAspectRatio='xMinYMin slice' style={{width: this.props.w, height: this.props.h}}>
                    <rect x='0' y='0' width='100' height='10' style={{fill: '#dcdcdc'}} />
                    <rect x='0' y='0' id={this.props.id} width={this.state.progress} height='10' style={{fill: '#999999'}} />
                    </svg>
                    </div>
            )
        } else {
            return null
        }
    }
})

module.exports = StatusBar
