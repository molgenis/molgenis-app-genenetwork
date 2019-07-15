var _ = require('lodash')
var React = require('react')
var PropTypes = require('prop-types');
var TriangleDown = require('./SVGCollection').TriangleDown
var color = require('../../js/color')

var GeneOpenMenu = createReactClass({

    propTypes: {
        gene: PropTypes.object
    },
    
    getInitialState: function() {
        return {
            isExpanded: false
        }
    },
    
    onClick: function() {
        this.setState({
            isExpanded: !this.state.isExpanded
        })
    },
    
    render: function() {

        var that = this

        var services = [
            {id: 'GN', name: 'Gene Network', url: GN.urls.main + '/#/gene/', useid: 'name'},
            {id: 'EXAC', name: 'ExAC Browser', url: 'http://exac.broadinstitute.org/gene/', useid: 'id'},
            {id: 'ENSEMBL', name: 'Ensembl', url: 'http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=', useid: 'id'},
            {id: 'PUBMED', name: 'PubMed search', url: 'http://www.ncbi.nlm.nih.gov/pubmed/?term=', useid: 'name'},
        ]

        var options = null
        var cls = this.state.isExpanded ? '' : 'invisible'
            options = _.map(_.filter(services, function(service) {
                return !that.props.options || _.includes(that.props.options, service.id)
            }), function(service, i) {
                return (
                        <div key={i} className={cls}>
                        <a className='nodecoration' title={'Open ' + that.props.gene.name + ' in ' + service.name} href={service.url + that.props.gene[service.useid]} target='_blank'>
                        <span className='smallbutton noselect fullwidth' style={{display: 'block'}}>{service.name.toUpperCase().replace(/EXAC/, 'ExAC')}</span></a>
                        </div>
                )
            })
        
        return (
                <div className='geneopenmenu clickable noselect' style={this.props.style} onClick={this.onClick}>
                <div className='button' style={{minWidth: '130px'}}>OPEN {this.props.gene.name} IN
                <TriangleDown className='dropdowntriangle' />
                </div>
                <div className='outer'>
                {options}
                </div>
                </div>
        )
    }
})

module.exports = GeneOpenMenu
