'use strict'

var _ = require('lodash')
var color = require('../../js/color')
var htmlutil = require('../htmlutil')

var React = require('react')
var Router = require('react-router')
var DocumentTitle = require('react-document-title')

var Table = React.createClass({

    render: function(thing) {

        var rows = []
        for (var i = 0; i < 10; i++) {
            var rowtype = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'

            rows.push(
                <tr className = {rowtype} onMouseOver={this.props.onMouseOver.bind(null, thing)}>
                <td>{this.props.prio.results[i].gene.name}</td>
                <td style={{textAlign: 'center'}}>{this.props.prio.results[i].gene.id}</td>
                <td style={{textAlign: 'center'}}>{this.props.prio.results[i].weightedZScore}</td>
                <td style={{textAlign: 'center'}}>{this.props.prio.results[i].gene.biotype}</td>
                <td style={{textAlign: 'center'}}>{'network' /*link to network, like: http://localhost:1337/network/HP:0100602,0!MYOM1/ */}
                </td>
                </tr>
                )
        }

        return (
            <table className='gn-gene-table datatable' style={{width: '70%'}}>
            <tbody>
                <tr>
                <th style={{textAlign: 'left'}}>GENE</th>
                <th style={{textAlign: 'center'}}>ID</th>
                <th style={{textAlign: 'center'}}>Z-SCORE</th>
                <th style={{textAlign: 'center'}}>TYPE</th>
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

        console.log(this.state.data)
        
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
                <p>{this.state.data ? '\nPhenotype: ' + this.state.data.terms[0].term.name + ' (' + this.state.data.terms[0].term.id + ')' : 'loading'}</p>
            </div>
                <div>
                <p>{this.state.data ? 'Top 10 out of ' + this.state.data.results.length + ' results:' : 'loading'}</p>
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
