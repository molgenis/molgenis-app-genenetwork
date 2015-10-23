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

var DataTable = React.createClass({

    render: function() {
    	var that = this
    	
    	var indices = this.props.celltypes.indices
    	var avg = this.props.celltypes.avg
    	var sortedItems = _.sortBy(this.props.celltypes.header, function(item){
    		return avg[indices[item.name]]
    	}).reverse()

    	var rows = _.map(sortedItems, function(item){
    		return(
    			<tr>
    				<td>{item.name}</td>
    				<td style={{textAlign: 'center'}}>{item.numSamples}</td>
    				<td style={{textAlign: 'center'}}>{avg[indices[item.name]]}</td>
    			</tr>
    		)
    	})

        return (
         	<table>
            <tbody>
            <tr>
            <th>TISSUE</th>
            <th>NUMBER OF SAMPLES</th>
            <th>AVERAGE EXPRESSION</th>
            </tr>
            {rows}
            </tbody>
            </table>
        )
    }
})

var Tissues = React.createClass({

	render: function(){

		return (
			<div>
				<DataTable celltypes={this.props.celltypes} />
			</div>
		)
	}
})

module.exports = Tissues