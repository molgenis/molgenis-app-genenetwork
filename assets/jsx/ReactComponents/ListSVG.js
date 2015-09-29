var React = require('react')

var ListSVG = React.createClass({

    propTypes: {
        w: React.PropTypes.number.isRequired,
        h: React.PropTypes.number.isRequired,
        n: React.PropTypes.number,
        color: React.PropTypes.string,
        isActive: React.PropTypes.bool
    },
    
    render: function() {
                // <line x1='0' y1='3' x2='10' y2='3' />
                // <line x1='0' y1='6' x2='10' y2='6' />
                // {!this.props.n || this.props.n > 2 ?
                //  (<line x1='0' y1='9' x2='10' y2='9' />) :
                //  (<line />)}
        return (
                <div style={{display: 'inline-block'}}>
                <svg viewBox='0 0 16 16' width={this.props.w} height={this.props.h} style={{shapeRendering: 'crispEdges', strokeWidth: 1, stroke: this.props.color || color.colors.gngray}}>
                <line x1='0' y1='2' x2='16' y2='2' />
                <line x1='0' y1='7' x2='16' y2='7' />
                {!this.props.n || this.props.n > 2 ?
                 (<line x1='0' y1='12' x2='16' y2='12' />) :
                 null}
            </svg>
                </div>
        )
    }
})

module.exports = ListSVG
