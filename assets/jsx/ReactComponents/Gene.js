'use strict'

var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Select = require('react-select')
var ReactCanvas = require('react-canvas')
var ListView = ReactCanvas.ListView
var DocumentTitle = require('react-document-title')
var Route = Router.Route
var Link = Router.Link

var GeneHeader = require('./GeneHeader')
var GeneMenu = require('./GeneMenu')
var SimilarGenesTable = require('./SimilarGenesTable')
var SVGCollection = require('./SVGCollection')
var Footer = require('./Footer')
var Cookies = require('cookies-js')
var color = require('../../js/color')
var htmlutil = require('../htmlutil')

var PredictionRow = React.createClass({
    render: function() {
        var cls = this.props.num % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'
        return (
                <tr className={cls}>
                <td className='text'>
                <Link className='nodecoration black' title={this.props.data.term.numAnnotatedGenes + ' annotated genes, prediction accuracy ' + Math.round(100 * this.props.data.term.auc) / 100} to={`/term/${this.props.data.term.id}`}>
                {this.props.data.term.name}
            </Link>
                </td>
                <td style={{textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(this.props.data.pValue)}}></td>
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
                            prediction: data,
                            topMenuSelection: 'prediction',
                            error: null
                        })
                    } else {
                        this.setState({
                            gene: data.gene,
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
                pageTitle = data.gene.name + GN.pageTitleSuffix
                contentTop = (
                        <GeneHeader gene={data.gene} />
                )
                content = (
                        <div className='gn-gene-container-inner maxwidth' style={{padding: '20px'}}>
                        <GeneMenu data={data}
                    onTopMenuClick={this.handleTopMenuClick}
                    onDatabaseClick={this.handleDatabaseClick}
                    onShowTypeClick={this.handleShowTypeClick}
                    topMenuSelection={this.state.topMenuSelection}
                    databaseSelection={this.state.databaseSelection}
                    showTypeSelection={this.state.showTypeSelection} />
                        {this.state.topMenuSelection == 'prediction' ?
                         <DataTable data={data} db={this.state.databaseSelection} /> :
                         <SimilarGenesTable data={data} />}
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
