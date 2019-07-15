var _ = require('lodash')
var React = require('react')
var GeneOpenMenu = require('../ReactComponents/GeneOpenMenu')
var SVGCollection = require('../ReactComponents/SVGCollection')
var genstats = require('genstats')
var htmlutil = require('../../js/htmlutil')
var color = require('../../js/color')

var EdgePanel = createReactClass({
    
    propTypes: {
        edge: PropTypes.object.isRequired
    },

    render: function() {

        console.log(this.props.edge)
        
	return (
		<div id='edgepanel' className='networkleftpanel smallpadding bordered' style={{marginBottom: '0px'}}>
		<div>
                {this.props.edge.source.name + ' - ' + this.props.edge.target.name}
	    </div>
                <br/>
                <div dangerouslySetInnerHTML={{__html: 'p-value ' + htmlutil.pValueToReadable(genstats.probability.zToP(this.props.edge.weight))}} />
                <div dangerouslySetInnerHTML={{__html: 'z-score ' + this.props.edge.weight}} />
                </div>
	)
    }
})

module.exports = EdgePanel
