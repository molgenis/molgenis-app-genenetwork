'use strict'

var _ = require('lodash')
var React = require('react')
var createReactClass = require('create-react-class');
var DocumentTitle = require('react-document-title')
var color = require('../../js/color.js')
var Select = require('react-select')

var reactable = require('reactable')
var ReactRouter = require('react-router')
var Router = ReactRouter.Router
var Link = ReactRouter.Link

var SVGCollection = require('./SVGCollection')

var Back = createReactClass({

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

    render: function() {
      return (
          <div style={{float: 'right'}}>
            <Link style={{color: this.state.color, fontSize: '10pt'}} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} className='nodecoration black clickable' to={this.props.url}>
              <SVGCollection.ArrowLeft color={this.state.color} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} /> 
              <b style={{paddingLeft: '5px'}}>GO BACK</b>
            </Link>
          </div>
        )
    }

})

module.exports = Back
