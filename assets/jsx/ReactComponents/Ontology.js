'use strict';

var _ = require('lodash')
var color = require('../../js/color')
var htmlutil = require('../../js/htmlutil')

var React = require('react')
var Router = require('react-router')
var DocumentTitle = require('react-document-title')
var Footer = require('./Footer')
var D3Network = require('../../js/D3Network.js')

var Ontology = React.createClass({

    mixins: [Router.Navigation, Router.State],

    getInitialState: function() {
        return {
            data: {
                ontology: {
                    name: 'HPO'
                }
            }
        }
    },
    
    componentDidMount: function() {
        var el = document.getElementById('network')
        // console.log(el.offsetWidth, el.offsetHeight)
        var Network = D3Network(el, {
            width: el.offsetWidth,
            height: el.offsetHeight,
            labelSize: '12pt',
            labelColor: color.colors.gnwhite,
            nodeHeight: 30,
            charge: -3000,
//            linkDistance: 50,
//            theta: 0.2,
            gravity: 1,
            
        })
        this.setState({
            w: el.offsetWidth,
            h: el.offsetHeight,
            network: Network,
        })
        this.load('HPO')
    },

    componentWillReceiveProps: function(nextProps) {
    },

    load: function(ontologyName) {
        $.ajax({
            url: '/js/networks/' + ontologyName + '.json',
            dataType: 'json',
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        data: data,
                        error: null
                    })
                    this.state.network.draw(data)
                } else {
                    console.log('Data for Ontology received but the component is not mounted.')
                }
            }.bind(this),
            error: function(xhr, status, err) {
		console.log('Error: ' + xhr)
                if (this.isMounted()) {
                    if (err === 'Not Found') {
                        this.setState({
                            data: null,
                            error: 'Term ' + this.props.params.termId + ' not found',
			    errorTitle: 'Error ' + xhr.status
                        })
                    } else {
                        this.setState({
                            data: null,
                            error: 'Please try again later (' + xhr.status + ')',
			    errorTitle: 'Error ' + xhr.status
                        })
                    }
                } else {
                    console.log('Error getting data for Onotology and the component is not mounted.')
                }
            }.bind(this)
        })
    },
    
    render: function() {
        console.log(this.state)
        if (this.state.error) {
            return (
		    <DocumentTitle title={this.state.errorTitle + GN.pageTitleSuffix}>
                    <div>
                    <span>{this.state.error}</span>
                    <Footer />
                    </div>
		    </DocumentTitle>
            )
        } else if (this.state.data) {
            var data = this.state.data
            return (
		    <DocumentTitle title={'HPO ' + GN.pageTitleSuffix}>
                    <div>
                    <div className='networkcontainer'>
                    <div id='network' className='network'>
                    </div>
                    </div>
                    <Footer />
                    </div>
		    </DocumentTitle>
            )
        } else {
            if (!this.state.h) {
                return (
		        <DocumentTitle title={'Loading' + GN.pageTitleSuffix}>
                        <div>
                        <div className='networkcontainer'>
                        <div id='network' className='network'>
                        </div>
                        </div>
                        <Footer />
                        </div>
		        </DocumentTitle>
                )
            } else {
                return (
		        <DocumentTitle title={'Loading' + GN.pageTitleSuffix}>
                        <div>
                        <div className='networkcontainer'>
                        <div id='network' className='network'>
                        <div style={{position: 'absolute', top: (this.state.h - 100) / 2 + 'px', width: this.state.w + 'px', textAlign: 'center'}}>
                        loading</div>
                        </div>
                        </div>
                        <Footer />
                        </div>
		        </DocumentTitle>
                )
            }
        }
    }
})

module.exports = Ontology
