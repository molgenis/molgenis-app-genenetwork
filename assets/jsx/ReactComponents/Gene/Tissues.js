'use strict'

var _ = require('lodash')
var React = require('react')
var HomoSapiens = require('./HomoSapiens')
var htmlutil = require('../../htmlutil')
var SVGCollection = require('../SVGCollection')
var ListIcon = SVGCollection.ListIcon

var DataTable = React.createClass({

    componentWillMount: function() {
        var indices = this.props.celltypes.indices
        var avg = this.props.celltypes.avg
        this.sortedItems = _.sortBy(this.props.celltypes.header, function(item){
            return avg[indices[item.name]]
        }).reverse()
    },

    render: function() {
        var indices = this.props.celltypes.indices
        var avg = this.props.celltypes.avg
        var p = this.props.celltypes.p
        var stdev = this.props.celltypes.stdev
        
    	var rows = _.map(this.sortedItems, function(item, i){
            var cls = i % 2 === 0 ? 'clickable datarow evenrow' : 'clickable datarow oddrow';
    	    return(
    		    <tr key={item.name} className={cls} onClick={this.props.onClick.bind(null, item)} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onMouseOver={this.props.onMouseOver.bind(null, item)} style={this.props.hoverItem === item.name || this.props.clickedItem === item.name ? {backgroundColor: 'rgb(255,225,0)'} : {}}>
    		    <td style={{paddingLeft: '6px', paddingRight: '1px'}}>{item.name === "Skin" || item.name === "Brain" || item.name === "Blood" ? <ListIcon w={10} h={10} /> : null}</td>
                <td>{item.name}</td>
    		    <td style={{textAlign: 'center'}}>{item.numSamples}</td>
    		    <td style={{textAlign: 'center'}}>{avg[indices[item.name]]}</td>
                    <td style={{whiteSpace: 'nowrap', textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(p[indices[item.name]])}}></td>
                <td style={{textAlign: 'center'}} >{stdev[indices[item.name]]}</td>
    		    </tr>
    	    )
    	}.bind(this))
        
        return (
         	<table className='gn-gene-table datatable' style={{paddingLeft: '6px', height: '620px'}}>
                <tbody>
                    <tr>
                    <th colSpan="2" style={{textAlign: 'left'}}>TISSUE</th>
                    <th>SAMPLES</th>
                    <th>AVERAGE EXPRESSION</th>
                    <th>P-VALUE</th>
                    <th>SD</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        )
    }
})

var TableCelltypes = React.createClass({

    render: function() {
        var indices = this.props.celltypes.indices
        var avg = this.props.celltypes.avg
        var p = this.props.celltypes.p
        var stdev = this.props.celltypes.stdev
        var clickedItem = this.props.clickedItem

        var items = _.result(_.find(this.props.celltypes.header, function(item){
            return item.name == clickedItem
        }), 'children')

        var sortedItems = _.sortBy(items, function(item){
            return avg[indices[item.name]]
        }).reverse()

        var rows = _.map(sortedItems, function(item, i){
            var cls = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow';
            return(
            <tr key={item.name} className={cls} onMouseOver={this.props.onMouseOver.bind(null, item)}>
                <td>{item.name}</td>
                <td style={{textAlign: 'center'}}>{item.numSamples}</td>
                <td style={{textAlign: 'center'}}>{avg[indices[item.name]]}</td>
                <td style={{textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(p[indices[item.name]])}}></td>
                <td style={{textAlign: 'center'}} >{stdev[indices[item.name]]}</td>
            </tr>
            )
        }.bind(this))
        
        if (typeof items === "undefined"){
            return (<div></div>)

        } else {
            return (
                <table className='gn-gene-table datatable' style={{lineHeight: '1.3em'}}>
                    <tbody>
                    <tr>
                    <th style={{textAlign: 'left'}}>TISSUE</th>
                    <th>SAMPLES</th>
                    <th>AVERAGE EXPRESSION</th>
                    <th>P-VALUE</th>
                    <th>SD</th>
                    </tr>
                    {rows}
                    </tbody>
                </table>
            )
        }
    }
})

var Tissues = React.createClass({

    getInitialState: function() {
        return {}
    },
    
    handleMouseOver: function(item) {
        var hoverItem = typeof item === "object" ? item.name : item
        this.setState({
            hoverItem: hoverItem
        });  

    },

    handleClick: function(item) {
        var clickedItem = typeof item === "object" ? item.name : item
        if (clickedItem === this.state.clickedItem){
            this.replaceState({})
        } else {
            this.setState({
                clickedItem: clickedItem
            });
        }        
    },
    
    render: function(){

        if (!this.props.celltypes) return null
        
    	return (
    		<div className="hflex">
        	<div className="flex11">
                <DataTable celltypes={this.props.celltypes} onClick={this.handleClick} clickedItem={this.state.clickedItem} hoverItem={this.state.hoverItem} onMouseOver={this.handleMouseOver} />
                </div>
                
                <div className="flex11" style={{minWidth: '50px'}}>
                <HomoSapiens onMouseOver={this.handleMouseOver} hoverItem={this.state.hoverItem} clickedItem={this.state.clickedItem} celltypes={this.props.celltypes} />
                </div>
                
                <div className="flex11">
                <TableCelltypes clickedItem={this.state.clickedItem} celltypes={this.props.celltypes} onMouseOver={this.handleMouseOver} />
                </div>
                </div>
    	)
    }
})

module.exports = Tissues
