'use strict'

var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Link = Router.Link

var SVGCollection = require('./SVGCollection')
var htmlutil = require('../htmlutil')
var PredictionRow = require('./PredictionRow')

var reactable = require('reactable')
var Tr = reactable.Tr
var Td = reactable.Td
var Th = reactable.Th
var Thead = reactable.Thead
var Table = reactable.Table
var unsafe = reactable.unsafe

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
        console.log('handleAnnotationsClick')
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

            var key= pathway.term.id
            var gene= that.props.data.gene
            var data= pathway
            var isAnnotated= isAnnotated
            var num= i

            return (

                <Tr key={key}>
                <Td column="TERM" className='text'>
                    <Link className='nodecoration black' title={data.term.numAnnotatedGenes + ' annotated genes, prediction accuracy ' + Math.round(100 * data.term.auc) / 100} to={`/term/${data.term.id}`}>
                    {data.term.name}
                    </Link>
                </Td>
                <Td column="P-VALUE" style={{whiteSpace: 'nowrap', textAlign: 'center'}} >{unsafe(htmlutil.pValueToReadable(data.pValue))}</Td>
                <Td column="DIRECTION" style={{textAlign: 'center'}}>
                    {data.zScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}
                </Td>
                <Td column="ANNOTATED" style={{textAlign: 'center'}}>
                    {isAnnotated ? <SVGCollection.Annotated /> : <SVGCollection.NotAnnotated />}
                </Td>
                <Td column="NETWORK" style={{textAlign: 'center'}}>
                    <a title={'Open network ' + (data.annotated ? 'highlighting ' : 'with ') + gene.name} href={GN.urls.networkPage + data.term.id + ',0!' + gene.name} target='_blank'>
                        <SVGCollection.NetworkIcon />
                    </a>
                </Td>
                </Tr>
            )
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

            <Table className='gn-gene-table datatable'

            sortable={[

                {
                    column: 'TERM',
                    sortFunction: function (a, b) {
                        var newA = a.props.children
                        var newB = b.props.children
                        return newA.localeCompare(newB)
                    }
                },

                {
                    column: "P-VALUE",
                    sortFunction: function(a, b) {

                        if (a.length < 5) {
                            if (b.length < 5) {             {/* a ?? b */}
                                return a - b
                            } else if (b[0] != '<') {    {/* a > b */}
                                return 1
                            } else {                        {/* a > b */}
                                return 1
                            }
                        } else if (a[0] != '<') {
                            if (b.length < 5) {             {/* a < b */}
                                return -1
                            } else if (b[0] != '<') {    {/* a ?? b */}

                                a = a.toString()
                                var aExponent = a.slice(53)
                                var aExp = aExponent.slice(0, aExponent.indexOf("<"))
                                var aNumber = a.slice(0,3)

                                b = b.toString()
                                var bExponent = b.slice(53)
                                var bExp = bExponent.slice(0, bExponent.indexOf("<"))
                                var bNumber = b.slice(0,3)

                                return aExp - bExp || aNumber - bNumber

                            } else {                        {/* a > b */}
                                return 1
                            }
                        } else {
                            if (b.length < 5) {             {/* a < b */}
                                return -1
                            } else if (b[0] != '<') {    {/* a <b */}
                                return -1
                            } else {

                                a = a.toString()
                                var aExponent = a.slice(55)
                                var aExp = aExponent.slice(0, aExponent.indexOf("<"))
                                var aNumber = a.slice(2,5)

                                b = b.toString()
                                var bExponent = b.slice(55)
                                var bExp = bExponent.slice(0, bExponent.indexOf("<"))
                                var bNumber = b.slice(2,5)

                                return aExp - bExp || aNumber - bNumber

                            }
                        }

                        return b - a
                    }
                },

                {
                    column: 'DIRECTION',
                    sortFunction: function(a, b) {

                        console.log(a.props.className)
                        return a.props.className.localeCompare(b.props.className)
                    }
                }

            ]}
            >

            <Thead>
                <Th column="TERM">TERM</Th>
                <Th column="P-VALUE">P-VALUE</Th>
                <Th column="DIRECTION">DIRECTION</Th>
                <Th column="ANNOTATED" className={annotatedClass} onClick={this.handleAnnotationsClick}>ANNOTATED</Th>
                <Th column="NETWORK">NETWORK</Th>
            </Thead>


            {rows}
            </Table>


            )
                {/* <table className='gn-gene-table datatable'>
                <tbody>
                <tr>
                <th className='tabletextheader'>TERM</th>
                <th>P-VALUE</th>
                <th>DIRECTION</th>
                <th className={annotatedClass} onClick={this.handleAnnotationsClick}>ANNOTATED</th> // still need to get this back!!
                <th>NETWORK</th>
                </tr>
                {rows}
                </tbody>
                </table> */}
            
        }
    }
})

module.exports = DataTable
