var _ = require('lodash')
var React = require('react')
var GeneOpenMenu = require('./GeneOpenMenu')
var SVGCollection = require('./SVGCollection')
var color = require('../../js/color')

var GenePanel = React.createClass({
    
    propTypes: {
        gene: React.PropTypes.object.isRequired
    },

    render: function() {
	
	var desc = this.props.gene.description || 'no description'
	// remove the "[Source: HGNC...]" that appears in many descriptions
	desc = desc.replace(/\[[^\]]+\]/g, '')
	var biotypeStr = this.props.gene.biotype || 'unknown biotype'
	biotypeStr = biotypeStr.replace('_', ' ')
	// var biotypeColor = this.props.coloring == 'biotype' ? color.biotype2color[this.props.gene.biotype] || color.colors.textdefault : color.colors.textdefault
        var biotypeColor = color.colors.textdefault
	// var chrColor = this.props.coloring == 'chr' ? color.chr2color[this.props.gene.chr] || color.colors.textdefault : color.colors.textdefault
        var chrColor = color.colors.textdefault
	return (
		<div id='genepanel' className='networkleftpanel smallpadding bordered' style={{marginBottom: '0px'}}>
		<div>
                <a className='externallink nodecoration black' title={'Open ' + this.props.gene.name + ' in Gene Network'} href={GN.urls.genePage + this.props.gene.name} target='_blank'>
                {this.props.gene.name}</a>
                </div>
                <div style={{paddingTop: '0.875em'}}>
                <SVGCollection.Chromosome
            chr={this.props.gene.chr}
            position={(this.props.gene.stop + this.props.gene.start) / 2}
            start={this.props.gene.start}
            stop={this.props.gene.stop}
            style={{clear: 'left', float: 'left'}} />
                <div className='smalldescription' style={{float: 'left', color: chrColor, paddingLeft: '5px'}}>{'chr ' + this.props.gene.chr}</div>
                </div>
                <div className='smalldescription' style={{clear: 'both', color: biotypeColor}}>{biotypeStr}</div>
      		<br/>
		<div>{desc}</div>
	        <br/>
                <GeneOpenMenu gene={this.props.gene} />
		</div>
	)
    }
})

module.exports = GenePanel
