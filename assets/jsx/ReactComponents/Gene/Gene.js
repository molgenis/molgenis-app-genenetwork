'use strict'

var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Select = require('react-select')
var DocumentTitle = require('react-document-title')
var Route = Router.Route
var Link = Router.Link

var GeneHeader = require('./GeneHeader')
var GeneMenu = require('./GeneMenu')
var SimilarGenesTable = require('./SimilarGenesTable')
var Tissues = require('./Tissues')
var SVGCollection = require('../SVGCollection')
var Footer = require('../Footer')
var Cookies = require('cookies-js')
var color = require('../../../js/color')
var htmlutil = require('../../htmlutil')
var DataTable = require('../DataTable')

var Gene = React.createClass({

    mixins: [Router.Navigation, Router.State],

    getInitialState: function() {
        return {
            // topMenuSelection: Cookies.get('genetopmenu') || 'prediction',
            topMenuSelection: 'prediction',
            databaseSelection: Cookies.get('genedb') || 'REACTOME',
            // showTypeSelection: Cookies.get('geneshowtype') || 'prediction'
        }
    },

    loadData: function() {
        // console.log('loading', this.getParams().geneId)
        var tasks = [{url: GN.urls.gene + '/' + this.props.params.geneId + '?verbose',
        name: 'prediction'},
        {url: GN.urls.coregulation + '/' + this.props.params.geneId + '?verbose',
        name: 'similar'}]
        if (this.state.topMenuSelection == 'similar') {
            tasks.reverse()
        }
        var that = this
        _.forEach(tasks, function(task) {
            $.ajax({
                url: task.url,
                dataType: 'json',
                success: function(data) {
                    if (this.isMounted() && task.name == 'prediction') {
                        this.setState({
                            gene: data.gene,
                            celltypes: data.celltypes,
                            prediction: data,
                            topMenuSelection: 'prediction',
                            error: null
                        })
                    } else {
                        this.setState({
                            gene: data.gene,
                            celltypes: data.celltypes,
                            topMenuSelection: 'prediction',
                            similar: data,
                            error: null
                        })
                    }
                }.bind(that),
                error: function(xhr, status, err) {
                  console.log(xhr)
                  if (this.isMounted() && task.name !== 'similar') {
                    if (err === 'Not Found') {
                        this.setState({
                            error: 'Gene ' + this.props.params.geneId + ' not found',
                            errorTitle: 'Error ' + xhr.status
                        })
                    } else {
                        this.setState({
                            error: 'Please try again later (' + xhr.status + ')',
                            errorTitle: 'Error ' + xhr.status
                        })
                    }
                }
            }.bind(that)
        })
})
},

componentDidMount: function() {
        // $(document).mousedown(function(e) {
        //     console.log(e)
        // })
var el = React.findDOMNode(this)
this.setState({
    w: el.offsetWidth,
    h: el.offsetHeight
})
this.loadData()
},

componentWillUnmount: function() {
        // $(document).unbind('mousedown')
    },

    componentWillReceiveProps: function() {
        this.loadData()
    },

    handleTopMenuClick: function(type) {
        Cookies.set('genetopmenu', type)
        this.setState({
            topMenuSelection: type
        })
    },

    handleDatabaseClick: function(db) {
        Cookies.set('genedb', db.id)
        this.setState({
            databaseSelection: db.id
        })
    },

    handleShowTypeClick: function(type) {
        Cookies.set('geneshowtype', type)
        this.setState({
            showTypeSelection: type
        })
    },
    
    render: function() {
        // console.log('one gene render, state:', this.state)
        var content = null, contentTop = null
        var pageTitle = 'Loading' + GN.pageTitleSuffix
        if (this.state.error) {
            pageTitle = this.state.errorTitle + GN.pageTitleSuffix
            content = (<span>{this.state.error}</span>)
        } else if (this.state.h) {
            var data = this.state.topMenuSelection == 'prediction' ? this.state.prediction : this.state.similar
            if (data) {
                var tableContent = null
                if (this.state.topMenuSelection == 'prediction') {
                    tableContent = <DataTable data={data} db={this.state.databaseSelection} />
                } else if (this.state.topMenuSelection == 'similar') {
                    tableContent = <SimilarGenesTable data={data} />
                } else if (this.state.topMenuSelection == 'tissues') {
                    tableContent = <Tissues data={data} celltypes={this.state.celltypes}/>
                }
                pageTitle = data.gene.name + GN.pageTitleSuffix
                contentTop = (
                    <GeneHeader gene={data.gene} />
                    )
                content = (
                    <div className='gn-gene-container-inner maxwidth' style={{padding: '20px'}}>
                        <GeneMenu data={data}
                    available={[!!this.state.prediction, !!this.state.similar, !!this.state.celltypes]}
                    onTopMenuClick={this.handleTopMenuClick}
                    onDatabaseClick={this.handleDatabaseClick}
                    onShowTypeClick={this.handleShowTypeClick}
                    topMenuSelection={this.state.topMenuSelection}
                    databaseSelection={this.state.databaseSelection}
                    showTypeSelection={this.state.showTypeSelection} />
                    {tableContent}
                    </div>
                    )
            } else {
                pageTitle = 'Loading' + GN.pageTitleSuffix
                content = (
                    <div className='gn-gene-container-inner maxwidth' style={{padding: '20px'}}>
                    <div style={{position: 'absolute', top: (this.state.h - 100) / 2 + 'px', width: this.state.w + 'px', textAlign: 'center'}}>loading</div>
                    </div>
                    )
            }
        }
        return (
          <DocumentTitle title={pageTitle}>
          <div style={{overflowY: 'scroll'}}>
          {contentTop}
          <div className={'gn-gene-container-outer'} style={{backgroundColor: color.colors.gnwhite, marginTop: '10px'}}>
          {content}
          </div>
          </div>
          </DocumentTitle>
          )
    }
})

module.exports = Gene
