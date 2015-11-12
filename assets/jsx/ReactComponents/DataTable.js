var _ = require('lodash')
var React = require('react')
var Router = require('react-router')

var PredictionRow = require('./PredictionRow')

var DataTable = React.createClass({

    propTypes: {
        data: React.PropTypes.object.isRequired,
        db: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
        return {
            annotationsOnly: false
        }
    },

    handleAnnotationsClick: function() {
        this.setState({
            annotationsOnly: !this.state.annotationsOnly
        })
    },
    
    render: function() {

        // console.log('pdt render, state:', this.state)
        var that = this
        var pathways = this.state.annotationsOnly ? this.props.data.pathways.annotated : this.props.data.pathways.predicted

        pathways = _.filter(pathways, function(pathway) {
            return pathway.term.database.toUpperCase() === that.props.db
        })

        if (this.state.annotationsOnly) {
            pathways = _.sortBy(pathways, 'pValue')
        }
        
        var rows = _.map(pathways, function(pathway, i) {
            var isAnnotated = that.state.annotationsOnly || pathway.annotated
            return (<PredictionRow key={pathway.term.id} gene={that.props.data.gene} data={pathway} isAnnotated={isAnnotated} num={i} />)
        })

        if (rows.length === 0) {
            rows = (<tr><td>No {this.props.db} {this.state.annotationsOnly ? 'annotations' : 'predictions'} for {this.props.data.gene.name}</td></tr>)
        }

        if (false && rows.length === 0) {
            return (
                <div>{'No ' + this.props.db + (this.props.type == 'prediction' ? ' predictions' : ' annotations') + ' for ' + this.props.data.gene.name}</div>
                )
        } else {
            var annotatedClass = this.state.annotationsOnly ? 'clickable underline' : 'clickable'
            return (
                <table className='gn-gene-table datatable'>
                <tbody>
                <tr>
                <th className='tabletextheader'>TERM</th>
                <th>P-VALUE</th>
                <th>DIRECTION</th>
                <th className={annotatedClass} onClick={this.handleAnnotationsClick}>ANNOTATED</th>
                <th>NETWORK</th>
                </tr>
                {rows}
                </tbody>
                </table>
            )
        }
    }
})

module.exports = DataTable
