var React = require('react')
var GeneOpenMenu = require('../GeneOpenMenu')
var SVGCollection = require('../SVGCollection')

var GeneHeaderMenu = React.createClass({

    propTypes: {
        gene: React.PropTypes.object.isRequired,
        onMenuClick: React.PropTypes.func.isRequired,
        topMenuSelection: React.PropTypes.string.isRequired
    },
    
    render: function() {

	var desc = this.props.gene.description || 'no description'
	// remove the "[Source: HGNC...]" that appears in many descriptions
	desc = desc.replace(/\[[^\]]+\]/g, '')
        var buttonStyles = ['button clickable noselect selectedbutton', 'button clickable noselect']
        if ('similar' == this.props.topMenuSelection) buttonStyles.reverse()
        return (
                <div>
                <div className='genenamedesc'>
                <span className='header'>{this.props.gene.name}</span>
                <span className='genedescription'>{desc}</span>
                </div>
                <div className='genelegend'>
                <span>chromosome {this.props.gene.chr}</span>
                <SVGCollection.Chromosome chr={this.props.gene.chr} position={(this.props.gene.stop + this.props.gene.start) / 2} style={{}} />
                <div>{this.props.gene.biotype.replace(/_/g, ' ')}</div>
                </div>
                <div className='predictionmenu'>
                <span className={buttonStyles[0]} onClick={this.props.onMenuClick.bind(null, 'prediction')}>PATHWAYS & PHENOTYPES</span>
                <span className={buttonStyles[1]} onClick={this.props.onMenuClick.bind(null, 'similar')}>SIMILAR GENES</span>
                <GeneOpenMenu gene={this.props.gene} style={{float: 'right'}} options={['EXAC', 'ENSEMBL', 'PUBMED']} />
                </div>
                </div>
        )
    }
})
 
module.exports = GeneHeaderMenu
