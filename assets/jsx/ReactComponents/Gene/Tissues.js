'use strict'

var _ = require('lodash')
var React = require('react')
var HomoSapiens = require('./HomoSapiens')
var htmlutil = require('../../htmlutil')
var SVGCollection = require('../SVGCollection')
var ListIcon = SVGCollection.ListIcon

var reactable = require('reactable')
var Tr = reactable.Tr
var Td = reactable.Td
var Th = reactable.Th
var Thead = reactable.Thead
var Table = reactable.Table
var unsafe = reactable.unsafe

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
        var z = this.props.celltypes.z
        var stdev = this.props.celltypes.stdev
        var auc = this.props.celltypes.auc
    	var rows = _.map(this.sortedItems, function(item, i){
    	    return(
                <Tr key={item.name} className='clickable' onClick={this.props.onClick.bind(null, item)} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onMouseOver={this.props.onMouseOver.bind(null, item)} style={this.props.hoverItem === item.name || this.props.clickedItem === item.name ? {backgroundColor: 'rgb(255,225,0)'} : {}}>
                <Td column="">{item.name === "Skin" || item.name === "Brain" || item.name === "Blood" ? <ListIcon w={10} h={10} /> : null}</Td>
                <Td column="TISSUE">{item.name}</Td>
                <Td column="SAMPLES">{item.numAnnotated}</Td>
                <Td column="AVERAGE">{avg[indices[item.name]]}</Td>
                <Td column="Z SCORE">{z[indices[item.name]]}</Td>
                <Td column="SD">{stdev[indices[item.name]]}</Td>
                <Td column="AUC">{auc[indices[item.name]]}</Td>
                </Tr>
    	    )
    	}.bind(this))

        return (
            <Table className='sortable tissues-table' style={{width: '100%'}}

            sortable={[

                'TISSUE',

                {
                    column: 'SAMPLES',
                    sortFunction: function(a, b) {
                        return b - a
                    }
                },

                {
                    column: 'AVERAGE',
                    sortFunction: function(a, b) {
                        return b - a
                    }
                },

                {
                    column: "Z SCORE",
                    sortFunction: function(a, b) {
                        return b - a

                        // if (a.length < 5) {
                        //     if (b.length < 5) {             {/* a ?? b */}
                        //         return a - b
                        //     } else if (b[0] != '<') {    {/* a > b */}
                        //         return 1
                        //     } else {                        {/* a > b */}
                        //         return 1
                        //     }
                        // } else if (a[0] != '<') {
                        //     if (b.length < 5) {             {/* a < b */}
                        //         return -1
                        //     } else if (b[0] != '<') {    {/* a ?? b */}

                        //         a = a.toString()
                        //         var aExponent = a.slice(53)
                        //         var aExp = aExponent.slice(0, aExponent.indexOf("<"))
                        //         var aNumber = a.slice(0,3)

                        //         b = b.toString()
                        //         var bExponent = b.slice(53)
                        //         var bExp = bExponent.slice(0, bExponent.indexOf("<"))
                        //         var bNumber = b.slice(0,3)

                        //         return aExp - bExp || aNumber - bNumber

                        //     } else {                        {/* a > b */}
                        //         return 1
                        //     }
                        // } else {
                        //     if (b.length < 5) {             {/* a < b */}
                        //         return -1
                        //     } else if (b[0] != '<') {    {/* a <b */}
                        //         return -1
                        //     } else {

                        //         a = a.toString()
                        //         var aExponent = a.slice(55)
                        //         var aExp = aExponent.slice(0, aExponent.indexOf("<"))
                        //         var aNumber = a.slice(2,5)

                        //         b = b.toString()
                        //         var bExponent = b.slice(55)
                        //         var bExp = bExponent.slice(0, bExponent.indexOf("<"))
                        //         var bNumber = b.slice(2,5)

                        //         return aExp - bExp || aNumber - bNumber

                        //     }
                        // }
                    }
                },

                {
                    column: 'SD',
                    sortFunction: function(a, b) {
                        return b - a
                    }
                },

                {
                    column: 'AUC',
                    sortFunction: function(a, b) {
                        return b - a
                    }
                }

            ]}

            >
                {rows}
            </Table>
        )
    }
})

var TableCelltypes = React.createClass({

    render: function() {
        var indices = this.props.celltypes.indices
        var avg = this.props.celltypes.avg
        var z = this.props.celltypes.z
        var stdev = this.props.celltypes.stdev
        var clickedItem = this.props.clickedItem

        var items = _.result(_.find(this.props.celltypes.header, function(item){
            return item.name == clickedItem
        }), 'children')

        var sortedItems = _.sortBy(items, function(item){
            return avg[indices[item.name]]
        }).reverse()

        var rows = _.map(sortedItems, function(item, i){
            return(
            <tr key={item.name} onMouseOver={this.props.onMouseOver.bind(null, item)}>
                <td>{item.name}</td>
                <td style={{textAlign: 'center'}}>{item.numSamples}</td>
                <td style={{textAlign: 'center'}}>{avg[indices[item.name]]}</td>
                <td style={{textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(z[indices[item.name]])}}></td>
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
                    <th>Z SCORE</th>
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
        var that = this
        $.ajax({
            url: GN.urls.transcript + '/ENST0',
            dataType: 'json',
            success: function(data) {
                console.log(data)
            }.bind(that),
            error: function(xhr, status, err) {
                console.log(xhr)
            }.bind(that)
        })
    },
    
    render: function(){

        if (!this.props.celltypes) return null
        
    	return (
    		<div className="hflex">
        	   <div className="flex11" style={{height: '550px', width: "10%", overflow: "auto"}}>
                <DataTable celltypes={this.props.celltypes} onClick={this.handleClick} clickedItem={this.state.clickedItem} hoverItem={this.state.hoverItem} onMouseOver={this.handleMouseOver} />
            </div>
            <div className="flex11" style={{minWidth: '50px'}}>
                <HomoSapiens onMouseOver={this.handleMouseOver} onClick={this.handleClick} hoverItem={this.state.hoverItem} clickedItem={this.state.clickedItem} celltypes={this.props.celltypes} />
                </div>
            </div>
    	)
    }
})

module.exports = Tissues
