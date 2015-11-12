var _ = require('lodash')
var React = require('react')
var HomoSapiens = require('./HomoSapiens')
var htmlutil = require('../../htmlutil')

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
            var cls = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow';
    	    return(
    		    <tr key={item.name} className={cls} onMouseOver={this.props.onMouseOver.bind(null, item)} style={this.props.hoverItem === item.name ? {backgroundColor: 'rgb(255,255,0)'} : {}}>
    		    <td>{item.name}</td>
    		    <td style={{textAlign: 'center'}}>{item.numSamples}</td>
    		    <td style={{textAlign: 'center'}}>{avg[indices[item.name]]}</td>
                <td style={{textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(p[indices[item.name]])}}></td>
                <td style={{textAlign: 'center'}} >{stdev[indices[item.name]]}</td>
    		    </tr>
    	    )
    	}.bind(this))
        
        return (
         	<table className='gn-gene-table datatable' style={{width: '50%'}}>
                <tbody>
                <tr>
                <th style={{textAlign: 'left'}}>TISSUE</th>
                <th>NUMBER OF SAMPLES</th>
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

var Tissues = React.createClass({

    getInitialState: function() {
        return {}
    },
    
    handleMouseOver: function(item) {
        if (typeof item === "object"){
            this.setState({
                hoverItem: item.name
            })
        } else {
            this.setState({
                hoverItem: item
            })
        }       
    },
    
    render: function(){
    	return (
    		<div className="hflex">
        		<DataTable celltypes={this.props.celltypes} hoverItem={this.state.hoverItem} onMouseOver={this.handleMouseOver} />
                <div style={{width: '21%'}}>
                <HomoSapiens onMouseOver={this.handleMouseOver} hoverItem={this.state.hoverItem} celltypes={this.props.celltypes} />
                </div>
            </div>
    	)
    }
})

module.exports = Tissues
