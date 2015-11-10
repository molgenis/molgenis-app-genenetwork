'use strict'

var _ = require('lodash')
var color = require('../../js/color')
var htmlutil = require('../htmlutil')

var React = require('react')
var Router = require('react-router')
var DocumentTitle = require('react-document-title')

var Diagnosis = React.createClass({

    getInitialState: function() {
        return {
            message: 'This is where Tessa takes over'
        }
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
        
        return (
		<DocumentTitle title={'Diagnosis' + GN.pageTitleSuffix}>
                <div>
                <div>
                {this.state.message}
            </div>
                <div>
                {this.state.data ? this.state.data.results.length + ' results' : 'loading'}
            </div>
                <div>
                {this.state.data ? 'top gene: ' + this.state.data.results[0].gene.name : null}
            </div>
            </div>
		</DocumentTitle>
        )
    }
})

module.exports = Diagnosis
