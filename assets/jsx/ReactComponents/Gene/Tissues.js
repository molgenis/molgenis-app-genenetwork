var _ = require('lodash')
var React = require('react')
var HomoSapiens = require('./HomoSapiens')

var DataTable = React.createClass({

    render: function() {
    	var that = this
    	
    	var indices = this.props.celltypes.indices
    	var avg = this.props.celltypes.avg
    	var sortedItems = _.sortBy(this.props.celltypes.header, function(item){
    		return avg[indices[item.name]]
    	}).reverse()

    	var rows = _.map(sortedItems, function(item, i){
    		var cls = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow';
    		return(
    			<tr key={item.name} className = {cls}>
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
			<div className="hflex">
			<DataTable celltypes={this.props.celltypes} />
                        <div style={{width: '20%'}}>
                        <HomoSapiens />
                    </div>
			</div>
		)
	}
})

module.exports = Tissues
