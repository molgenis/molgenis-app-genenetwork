var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Link = Router.Link

var reactable = require('reactable')
var Tr = reactable.Tr
var Td = reactable.Td
var Th = reactable.Th
var Thead = reactable.Thead
var Table = reactable.Table
var unsafe = reactable.unsafe

var SVGCollection = require('./SVGCollection')
var htmlutil = require('../htmlutil')

var PredictionRow = React.createClass({

	propTypes: {
        data: React.PropTypes.object
    },

	render: function() {
		var cls = this.props.num % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'
		return (
			<Tr className={cls}>
				<Td className='text'>
					<Link className='nodecoration black' title={this.props.data.term.numAnnotatedGenes + ' annotated genes, prediction accuracy ' + Math.round(100 * this.props.data.term.auc) / 100} to={`/term/${this.props.data.term.id}`}>
					{this.props.data.term.name}
					</Link>
				</Td>
			<Td style={{whiteSpace: 'nowrap', textAlign: 'center'}} >{unsafe(htmlutil.pValueToReadable(this.props.data.pValue))}</Td>
				<Td style={{textAlign: 'center'}}>
					{this.props.data.zScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}
				</Td>
				<Td style={{textAlign: 'center'}}>
					{this.props.isAnnotated ? <SVGCollection.Annotated /> : <SVGCollection.NotAnnotated />}
				</Td>
				<Td style={{textAlign: 'center'}}>
					<a title={'Open network ' + (this.props.data.annotated ? 'highlighting ' : 'with ') + this.props.gene.name} href={GN.urls.networkPage + this.props.data.term.id + ',0!' + this.props.gene.name} target='_blank'>
						<SVGCollection.NetworkIcon />
					</a>
				</Td>
			</Tr>
		)
	}
})

module.exports = PredictionRow
