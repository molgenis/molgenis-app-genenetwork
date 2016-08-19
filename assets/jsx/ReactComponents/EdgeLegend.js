var _ = require('lodash')
var React = require('react')
var d3 = require('d3')
var color = require('../../js/color.js')

var EdgeLegend = React.createClass({

    propTypes: {

        edgeValueScales: React.PropTypes.array.isRequired,
        edgeColorScales: React.PropTypes.array.isRequired,
        threshold: React.PropTypes.number
    },

    getInitialState: function() {

        return {}
    },

    componentDidMount: function() {

        var colorScales = []
        for (var i = 0; i < this.props.edgeValueScales.length; i++) {
            colorScales.push(d3.scale.linear()
                            .domain(this.props.edgeValueScales[i])
                            .range(this.props.edgeColorScales[i])
                            .clamp(true))
        }
        
        this.setState({
            colorScales: colorScales
        })
    },
    
    render: function() {

        if (!this.state.colorScales) return null

        var title = null
        var width = 100, height = 16, step = 10
        var bars = []
        for (var x = 0; x < width; x += step) {
            bars.push(<rect key={x} x={x+10} y={0} width={step/2} height={height}
                      style={{fill: this.state.colorScales[0]((x + step) / width * _.last(this.props.edgeValueScales[0]))}} />)
        }
        
        if (this.props.threshold != undefined) {
            title = 'Edge threshold Z-score ' + this.props.threshold
            bars.push(<rect key='threshold' x={(this.props.threshold / _.last(this.props.edgeValueScales[0]) * width) + 10} y={0} width='3' height={height}
                      style={{fill: color.colors.gnblue}}/>)
        }
        
        return (
                <div title={title} style={{position: 'absolute', top: '10px', left: '70px', zIndex: 1}}>
                <svg width={(width - step/2) + 20} height={height} style={{backgroundColor: '#ffffff'}}>
                <polygon fill={this.props.hoverEdge === 'left' ? color.colors.gndarkgray : color.colors.gngray} onMouseOver={this.props.onMouseOver.bind(null, 'left')} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onClick={this.props.onClick.bind(null, -0.5)} className="clickable" points="0.9,8 7.7,4 7.7,12 " />
                <polygon fill={this.props.hoverEdge === 'right' ? color.colors.gndarkgray : color.colors.gngray} onMouseOver={this.props.onMouseOver.bind(null, 'right')} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onClick={this.props.onClick.bind(null, 0.5)} className="clickable" points="114.5,8 107.7,4 107.7,12 " />
                {bars}
            </svg>
                </div>
        )
    }
})

module.exports = EdgeLegend
