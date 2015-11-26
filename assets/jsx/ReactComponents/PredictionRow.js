var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Link = Router.Link

var SVGCollection = require('./SVGCollection')
var htmlutil = require('../htmlutil')

var PredictionRow = React.createClass({

	propTypes: {
        data: React.PropTypes.object
    },

	render: function() {
		var cls = this.props.num % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'
		return (
			<tr className={cls}>
				<td className='text'>
					<Link className='nodecoration black' title={this.props.data.term.numAnnotatedGenes + ' annotated genes, prediction accuracy ' + Math.round(100 * this.props.data.term.auc) / 100} to={`/term/${this.props.data.term.id}`}>
					{this.props.data.term.name}
					</Link>
				</td>
			<td style={{whiteSpace: 'nowrap', textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(this.props.data.pValue)}}></td>
				<td style={{textAlign: 'center'}}>
					{this.props.data.zScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}
				</td>
				<td style={{textAlign: 'center'}}>
					{this.props.isAnnotated ? <SVGCollection.Annotated /> : <SVGCollection.NotAnnotated />}
				</td>
				<td style={{textAlign: 'center'}}>
					<a title={'Open network ' + (this.props.data.annotated ? 'highlighting ' : 'with ') + this.props.gene.name} href={GN.urls.networkPage + this.props.data.term.id + ',0!' + this.props.gene.name} target='_blank'>
						<SVGCollection.NetworkIcon />
					</a>
				</td>
			</tr>
		)
	}
})

module.exports = PredictionRow
