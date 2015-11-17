'use strict'

var _ = require('lodash')
var color = require('../../js/color')
var htmlutil = require('../htmlutil')
var genstats = require('genstats')
var prob = genstats.probability

var React = require('react')
var Router = require('react-router')
var DocumentTitle = require('react-document-title')

var SVGCollection = require('./SVGCollection')
var htmlutil = require('../htmlutil')
var color = require('../../js/color')


var ShowPhenotypes = React.createClass({

    render: function() {


        var rows = []
        for (var i = 0; i < this.props.prio.terms.length; i++) {
            var rowtype = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'

            rows.push(
                <tr className = {rowtype} >
                <td style={{textAlign: 'left'}}>{this.props.prio.terms[i].term.name}</td>
                <td style={{textAlign: 'center'}}>{this.props.prio.terms[i].term.numAnnotatedGenes}</td>
                <td style={{textAlign: 'center'}}><a style={{color: color.colors.gnblack}} href={this.props.prio.terms[i].term.url} target="_blank">{this.props.prio.terms[i].term.id}</a></td>
                </tr>
                )
        }

        return (
            <table className='gn-gene-table datatable' style={{width: '50%'}}>
            <tbody>
            <tr>
            <th style={{textAlign: 'left'}}>PHENOTYPE</th>
            <th style={{textAlign: 'center'}}>ANNOTATED GENES</th>
            <th style={{textAlign: 'center'}}>HPO-TERM</th>
            
            </tr>
            {rows}
            </tbody>
            </table>
            )

        {/*var phenotypes = 'Showing results for: '
        for (var i = 0; i < this.props.prio.terms.length; i++) {
            if (i === 0) {
                phenotypes = phenotypes.concat(this.props.prio.terms[i].term.name + ' (' + this.props.prio.terms[i].term.id + ')')
            } else if (i !== this.props.prio.terms.length - 1) {
                phenotypes = phenotypes.concat(', ' + this.props.prio.terms[i].term.name + ' (' + this.props.prio.terms[i].term.id + ')')
            } else {
                phenotypes = phenotypes.concat(' and ' + this.props.prio.terms[i].term.name + ' (' + this.props.prio.terms[i].term.id + ')')
            }
        }
        var phenotypesDiv = <p>{phenotypes + "."}</p>
        return (phenotypesDiv)*/}
        
    }
})

var Table = React.createClass({

    render: function() {

        var phens = ""
        for (var j = 0; j < this.props.prio.terms.length; j++) {
            phens = phens.concat(this.props.prio.terms[j].term.id + ',')
        }

        var rows = []
        for (var i = 0; i < this.props.prio.results.length; i++) {
            var rowtype = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'

        {/* create networklink: */}
            var gene = "0!" + this.props.prio.results[i].gene.name
            var networkLink = GN.urls.networkPage + phens + gene

            var square =

            <div style={this.props.style} title={this.props.prio.results[i].gene.biotype}>
                <svg viewBox='0 0 10 10' width={20} height={this.props.h}>
                <rect x1='0' y1='0' width='10' height='10' style={{fill: color.biotype2color[this.props.prio.results[i].gene.biotype] || color.colors.default}} />
                </svg>
                </div>

            rows.push(
                <tr className = {rowtype} onMouseOver={this.props.onMouseOver.bind(null, this.props.prio.results[i].gene)}>
                
                <td>{square}</td>
                <td>{this.props.prio.results[i].gene.name}</td>
                <td style={{textAlign: 'center'}}
                dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(prob.zToP(this.props.prio.results[i].weightedZScore))}}>
                </td>

                <td style={{textAlign: 'center'}}>
                    {this.props.prio.results[i].weightedZScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}
                </td>
                
                <td style={{textAlign: 'center'}} 

                title={this.props.isAnnotated ? this.props.prio.results[i].annotated : "Not annotated to any of the phenotypes."}>
                    {this.props.prio.results[i].annotated.length == 0 ? <SVGCollection.NotAnnotated /> : <SVGCollection.Annotated />}
                    {/*this.props.prio.results[i].annotated[0] == -1 ? <SVGCollection.Annotated /> : <SVGCollection.NotAnnotated /> */}
                </td>

                <td style={{textAlign: 'center'}}> <a href={networkLink} target="_blank"><SVGCollection.NetworkIcon /></a></td>
                </tr>
                )
        }

        return (
            <table className='gn-gene-table datatable' style={{width: '70%'}}>
            <tbody>
                <tr>
                <th></th>
                <th style={{textAlign: 'left'}}>GENE</th>
                <th style={{textAlign: 'center'}}>P-VALUE</th>
                <th style={{textAlign: 'center'}}>DIRECTION</th>
                <th style={{textAlign: 'center'}}>ANNOTATION</th>
                <th style={{textAlign: 'center'}}>NETWORK</th>
                </tr>
                {rows}
            </tbody>
            </table>
        )
    
    }
})

var Diagnosis = React.createClass({

    getInitialState: function() {
        return {
            message: ''
        }
    },

    handleMouseOver: function(thing) {
        this.setState({
            hoverItem: thing
        })
    },
    
    componentDidMount: function() {
        this.loadData()
    },

    componentWillReceiveProps: function(nextProps) {
    },

    loadData: function() {
        
        $.ajax({
            url: GN.urls.prioritization + '/' + this.props.params.id + '?verbose',
            dataType: 'json',
            success: function(data) {
                this.setState({
                    data: data
                })
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(xhr)
                if (err === 'Not Found') {
                    this.setState({
                        error: 'Pathways ' + this.props.params.id + ' not found',
                        errorTitle: 'Error ' + xhr.status
                    })
                } else {
                    this.setState({
                        error: 'Please try again later (' + xhr.status + ')',
                        errorTitle: 'Error ' + xhr.status
                    })
                }
            }.bind(this)
        })
    },
    
    render: function() {

        if (!this.state.data) {
            return null
        }

        return (
		<DocumentTitle title={'Diagnosis' + GN.pageTitleSuffix}>
                <div>
                {/*<div>
                {this.state.message}
            </div>*/}
                <div>
                {/*<p>{this.state.data ? 'Showing results for: ' + this.state.data.terms[0].term.name + ' (' + this.state.data.terms[0].term.id + ')' : 'loading'}</p>*/}

                <p>{this.state.data ? <ShowPhenotypes prio={this.state.data} /> : 'loading'}</p>

            </div>
                <div>
                <p>{this.state.data ? this.state.data.results.length + ' results for these phenotypes:' : 'loading'}</p>
            </div>
                {/*<div>
                {this.state.data ? 'top gene: ' + this.state.data.results[0].gene.name : null}
            </div>*/}
                <div> {'\n'}
            </div>
            {<Table prio={this.state.data} onMouseOver={this.handleMouseOver} />}
            </div>
            
		</DocumentTitle>
        )
    }
})

module.exports = Diagnosis
