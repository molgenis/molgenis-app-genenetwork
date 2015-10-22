var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Select = require('react-select')
var ReactCanvas = require('react-canvas')
var ListView = ReactCanvas.ListView
var DocumentTitle = require('react-document-title')
var Route = Router.Route
var Link = Router.Link

var GeneHeader = require('./GeneHeader')
var GeneMenu = require('./GeneMenu')
var SimilarGenesTable = require('./SimilarGenesTable')
var Tissues = require('./Tissues')
var SVGCollection = require('./SVGCollection')
var Footer = require('./Footer')
var Cookies = require('cookies-js')
var color = require('../../js/color')
var htmlutil = require('../htmlutil')
var PredictionRow = require('./PredictionRow')
var DataTable = require('./DataTable')


var Tissues = React.createClass({

	render: function(){
		return (
			<div>
				<div style={{fontWeight: 'bold'}}>TISSUES</div>
				<div>{this.props.celltypes}</div>
			</div>
		)
	}
})

module.exports = Tissues