var _ = require('lodash')
var React = require('react')
var Link = require('react-router').Link
var SVGCollection= require('./SVGCollection')
var Cookies = require('cookies-js')
var htmlutil = require('../htmlutil')
var color = require('../../js/color')

var SimilarGenesTable = React.createClass({

    propTypes: {
        data: React.PropTypes.object
    },
    
    render: function() {

        var rows = _.map(this.props.data.data, function(gene, i) {
            var desc = (gene.gene.description || 'no description').replace(/\[[^\]]+\]/g, '')
            var cls = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'
            return (<tr className={cls} key={gene.gene.id}>
                    <td className='text'>
                    <Link className='black nodecoration' title={desc} to={'gene'} params={{geneId: gene.gene.name}}>
                    <SVGCollection.Rectangle title={gene.gene.biotype.replace(/_/g, ' ')} className='tablerectangle' fill={color.biotype2color[gene.gene.biotype] || color.colors.gnblack} />
                    <span>{gene.gene.name}</span>
                    </Link>
                    </td>
                    <td dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(gene.pValue)}}></td>
                    </tr>)
        })
        
        return (
                <table className='gn-gene-table datatable'>
                <tbody>
                <tr><th className='tabletextheader'>GENE</th><th>P-VALUE</th></tr>
                {rows}</tbody>
                </table>
        )
    }
})

module.exports = SimilarGenesTable
