'use strict';

var _ = require('lodash');
var React = require('react');
var createReactClass = require('create-react-class');
var Router = require('react-router');
var DocumentTitle = require('react-document-title');

var GeneHeader = require('./GeneHeader');
var GeneMenu = require('./GeneMenu');
var SimilarGenesTable = require('./SimilarGenesTable');
var Tissues = require('./Tissues');
var DownloadPanel = require('../ReactComponents/DownloadPanel');
var Cookies = require('cookies-js');
var color = require('../../js/color');
var DataTable = require('../ReactComponents/DataTable');

var Gene = createReactClass({

    mixins: [Router.Navigation, Router.State],

    getInitialState: function() {
        return {
            topMenuSelection: 'prediction',
            databaseSelection: 'REACTOME',
        }
    },

    loadData: function(geneId) {
        if (!geneId) geneId = this.props.params.geneId;

        var tasks = [{url: GN.urls.gene + '/' + geneId + '?verbose',
                      name: 'prediction'},
                     {url: GN.urls.coregulation + '/' + geneId + '?verbose',
                      name: 'similar'}];

        if (this.state.topMenuSelection == 'similar') tasks.reverse();


        var that = this;
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
                            error: null
                        })
                    } else if (this.isMounted() && task.name == 'similar') {
                        this.setState({
                            gene: data.gene,
                            similar: data,
                            error: null
                        })
                    }
                }.bind(that),
                error: function(xhr, status, err) {
                    console.log(xhr);
                    if (this.isMounted() && task.name !== 'similar') {
                        if (err === 'Not Found') {
                            this.setState({
                                error: 'Gene ' + geneId + ' not found',
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
        this.loadData()
    },

    componentWillReceiveProps: function(nextProps) {
        this.loadData(nextProps.params.geneId)
    },
    
    handleTopMenuClick: function(type) {
        Cookies.set('genetopmenu', type);
        this.setState({
            topMenuSelection: type
        })
    },

    handleDatabaseClick: function(db) {
        Cookies.set('genedb', db.id);
        this.setState({
            databaseSelection: db.id
        })
    },

    handleShowTypeClick: function(type) {
        Cookies.set('geneshowtype', type);
        this.setState({
            showTypeSelection: type
        })
    },

    download: function() {
        var form = document.getElementById('gn-gene-downloadform');
        var databaseSelection = this.state.databaseSelection;
        var filteredPredictions = _.filter(this.state.prediction.pathways.predicted, function(pathway){
            return pathway.term.database.toUpperCase() === databaseSelection
        });
        var predictions = _.map(filteredPredictions, function(pathway) {
                            return {
                                id: pathway.term.id,
                                name: pathway.term.name,
                                pValue: pathway.pValue,
                                zScore: pathway.zScore,
                                annotated: pathway.annotated
                            }
                        });
        var indices = this.state.celltypes.fixed.indices;
        var avg = this.state.celltypes.values.avg;
        var auc = this.state.celltypes.values.auc;
        var tissues = _.map(this.state.celltypes.fixed.header, function(item){
            return {
                tissue: item.name,
                samples: item.numSamples,
                avg: avg[indices[item.name]],
                auc: auc[indices[item.name]]
            }
        });
        form['predictions'].value = JSON.stringify(predictions);
        form['tissues'].value = JSON.stringify(tissues);
        form.submit()
    },
    
    render: function() {
        var content = null;
        var contentTop = <GeneHeader loading={true} />;
        var pageTitle = 'Loading' + GN.pageTitleSuffix;
        
        if (this.state.error) {
            contentTop = <GeneHeader notFound={this.props.params.geneId} />;
            pageTitle = this.state.errorTitle + GN.pageTitleSuffix
        } else {

            var data = this.state.topMenuSelection == 'prediction' ? this.state.prediction : this.state.similar;
            if (data) {

                var tableContent = null;
                if (this.state.topMenuSelection == 'prediction') {
                    tableContent = <DataTable data={data} db={this.state.databaseSelection} />
                } else if (this.state.topMenuSelection == 'similar') {
                    tableContent = <SimilarGenesTable data={data} />
                } else if (this.state.topMenuSelection == 'tissues') {
                    tableContent = <Tissues style={{paddingBottom: '100px'}} data={data} celltypes={this.state.celltypes}/>
                }

                pageTitle = data.gene.name + GN.pageTitleSuffix;
                contentTop = <GeneHeader gene={data.gene} />;
                content = (
                        <div className={'gn-gene-container-outer'} style={{backgroundColor: color.colors.gnwhite, marginTop: '10px'}}>
                        <div className='gn-gene-container-inner maxwidth' style={{padding: '20px'}}>
                        <div>
                        <GeneMenu data={data}
                            onTopMenuClick={this.handleTopMenuClick}
                            onDatabaseClick={this.handleDatabaseClick}
                            onShowTypeClick={this.handleShowTypeClick}
                            topMenuSelection={this.state.topMenuSelection}
                            databaseSelection={this.state.databaseSelection}
                            showTypeSelection={this.state.showTypeSelection} />
                        {tableContent}
                        <DownloadPanel onClick={this.download} text='DOWNLOAD ALL' />
                        </div>
                        </div>
                        <form id='gn-gene-downloadform' method='post' encType='multipart/form-data' action={GN.urls.tabdelim}>
                        <input type='hidden' id='geneId' name='geneId' value={data.gene.id} />
                        <input type='hidden' id='db' name='db' value={this.state.databaseSelection} />
                        <input type='hidden' id='what' name='what' value='geneprediction' />
                        <input type='hidden' id='type' name='type' value={this.state.topMenuSelection} />
                        <input type='hidden' id='predictions' name='predictions' value='' />
                        <input type='hidden' id='tissues' name='tissues' value='' />
                        </form>
                        </div>
                )
            }
        }

        return (
                <DocumentTitle title={pageTitle}>
                <div className='flex10'>
                {contentTop}
                {content}
                </div>
                </DocumentTitle>
        )
    }
});

module.exports = Gene;
