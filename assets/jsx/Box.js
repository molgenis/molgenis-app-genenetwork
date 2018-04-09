var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var SVGCollection = require('./ReactComponents/SVGCollection');


var color = require('../js/color');

var Box = React.createClass({
    getInitialState: function() {
        return {
            color: color.colors.gngray
        }
    },

    onMouseOver: function() {
        this.setState({
            color: color.colors.gndarkgray
        })
    },

    onMouseOut: function() {
        this.setState({
            color: color.colors.gngray
        })
    },

    render: function(){
        // padding: '40px 40px 40px 40px', margin: '10px',
        return (
            <div>
                <Link className='nodecoration black clickable' to={this.props.url}>
                <div className='box-sizing' style={{backgroundColor: color.colors.gnlightergray, border: '20px solid #fff', padding: '40px', width: '33.33333%', float: 'left', minWidth: '350px'}} >
                    <h3 style={{color: color.colors.gndarkgray}}>{this.props.title}</h3>
                    <p style={{color: color.colors.gndarkgray}}>{this.props.text}</p>
                    <div style={{float: 'right'}}>
                            <SVGCollection.ArrowRight color={this.state.color} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} />
                            <b style={{paddingLeft: '5px'}}>CONTINUE</b>
                    </div>
                </div>
                </Link>
            </div>
        )
    }
});

module.exports = Box;