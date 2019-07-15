var _ = require('lodash')
var React = require('react')
var GeneOpenMenu = require('../ReactComponents/GeneOpenMenu')
var SVGCollection = require('../ReactComponents/SVGCollection')
var color = require('../../js/color')

var GenePanel = createReactClass({
    
    propTypes: {
        gene: PropTypes.object.isRequired
    },

    render: function() {

        var services = [
            {id: 'GN', name: 'Gene Network', url: GN.urls.main + '/gene/', useid: 'name'},
            {id: 'EXAC', name: 'ExAC Browser', url: 'http://exac.broadinstitute.org/gene/', useid: 'id'},
            {id: 'ENSEMBL', name: 'Ensembl', url: 'http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=', useid: 'id'},
            {id: 'PUBMED', name: 'PubMed search', url: 'http://www.ncbi.nlm.nih.gov/pubmed/?term=', useid: 'name'},
        ]
        var links = _.map(services, function(service) {
            return (
                    <span key={service.id}><a className='nodecoration externallink' href={service.url + this.props.gene[service.useid]} target='_blank'>{service.name}</a><br/></span>
            )
        }.bind(this))
        
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

                <div>Open {this.props.gene.name} in</div>
                {links}
		</div>
	)
    }
})

module.exports = GenePanel
