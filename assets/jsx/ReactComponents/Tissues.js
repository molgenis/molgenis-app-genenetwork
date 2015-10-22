var React = require('react')

var Tissues = React.createClass({

	propTypes: {
        data: React.PropTypes.object
    },

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