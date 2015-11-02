var _ = require('lodash')
var React = require('react')
var HomoSapiens = require('./HomoSapiens')
var htmlutil = require('../htmlutil')

var DataTable = React.createClass({

    render: function() {

    	var indices = this.props.celltypes.indices
    	var avg = this.props.celltypes.avg
        var p = this.props.celltypes.p
        var stdev = this.props.celltypes.stdev

    	var sortedItems = _.sortBy(this.props.celltypes.header, function(item){
    		return avg[indices[item.name]]
    	}).reverse()

    	var rows = _.map(sortedItems, function(item, i){
    		var cls = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow';
    		return(
    		       <tr key={item.name} className = {cls}>
    		       <td>{item.name}</td>
    			<tr className = {cls}>
    				<td className>{item.name}</td>
    		       <td style={{textAlign: 'center'}}>{item.numSamples}</td>
    				<td style={{textAlign: 'center'}}>{avg[indices[item.name]]}</td>
                    <td style={{textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(p[indices[item.name]])}}></td>
                    <td style={{textAlign: 'center'}} >{stdev[indices[item.name]]}</td>
    			</tr>
    		)
    	})

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

	render: function(){

		return (
			<div className="hflex">
			<DataTable celltypes={this.props.celltypes} />
                        <div style={{width: '20%'}}>
                        <HomoSapiens />
                    </div>
		)
	}
})

module.exports = Tissues
