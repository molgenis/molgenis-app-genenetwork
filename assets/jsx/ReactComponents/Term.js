"use strict";

var _ = require('lodash');
var color = require('../../js/color');
var htmlutil = require('../../js/htmlutil');

var React = require('react');
var ReactDOM = require('react-dom');var createReactClass = require('create-react-class');
var Router = require('react-router');
var Link = Router.Link;
var Select = require('react-select');
var DocumentTitle = require('react-document-title');
var DownloadPanel = require('./DownloadPanel');
var Cookies = require('cookies-js');
var SVGCollection = require('./SVGCollection.js');

var PredictedGeneRow = createReactClass({

    propTypes: {
        data: PropTypes.object.isRequired,
        termId: PropTypes.string.isRequired,
        num: PropTypes.number,
    },
    
    render: function() {
        
        var data = this.props.data;
        var desc = (data.gene.description || 'no description').replace(/\[[^\]]+\]/g, '');
        
        return ( <tr>
                 <td className='text'>
                 <Link className='nodecoration black' title={desc} to={`/gene/${data.gene.id}`}>
                 <SVGCollection.Rectangle className='tablerectangle' title={data.gene.biotype.replace(/_/g, ' ')} fill={color.biotype2color[data.gene.biotype] || color.colors.gnblack} />
                 <span>{data.gene.name}</span>
                 </Link>
                 </td>
                 <td className='text'>
                 <Link className='nodecoration black' title={desc} to={`/gene/${data.gene.name}`}>
                 <span>{desc}</span>
                 </Link>
                 </td>
                 <td style={{textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(data.pValue)}} />
                 <td style={{textAlign: 'center'}}>{data.zScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}</td>
                 <td style={{textAlign: 'center'}}>{data.annotated ? <SVGCollection.Annotated /> : <SVGCollection.NotAnnotated />}</td>
                 <td style={{textAlign: 'center'}}>
                 <a title={'Open network ' + (data.annotated ? 'highlighting ' : 'with ') + data.gene.name} href={GN.urls.networkPage + '0!' + data.gene.name + '|' + this.props.termId + ',0!' + data.gene.name} target='_blank'>
                 <SVGCollection.NetworkIcon />
                 </a>
                 </td>
                 </tr>
        )
    }
});

var AnnotatedGeneRow = createReactClass({

    propTypes: {
        data: PropTypes.object.isRequired,
        termId: PropTypes.string.isRequired,
        num: PropTypes.number
    },
    
    render: function() {
        
        var data = this.props.data;
        var desc = (data.gene.description || 'no description').replace(/\[[^\]]+\]/g, '');
        
        return ( <tr className={this.props.num % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'}>
                 <td className='text'>
                 <Link className='nodecoration black' title={desc} to={`/gene/${data.gene.id}`}>
                 <SVGCollection.Rectangle className='tablerectangle' title={data.gene.biotype.replace(/_/g, ' ')} fill={color.biotype2color[data.gene.biotype] || color.colors.gnblack} />
                 {data.gene.name}
                 </Link>
                 </td>
                 <td className='text'>
                 <Link className='nodecoration black' title={desc} to={`/gene/${data.gene.name}`}>
                 <span>{desc}</span>
                 </Link>
                 </td>
                <td style={{textAlign: 'center'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(data.pValue)}} />
                <td style={{textAlign: 'center'}}>{data.zScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}</td>
                 <td style={{textAlign: 'center'}}><SVGCollection.Annotated /></td>
                 <td style={{textAlign: 'center'}}>
                 <a title={'Open network highlighting ' + data.gene.name} href={GN.urls.networkPage + '0!' + data.gene.name + '|' + this.props.termId + ',0!' + data.gene.name} target='_blank'>
                 <SVGCollection.NetworkIcon />
                 </a>
                 </td>
                 </tr>
        )
    }
});

var GeneTable = createReactClass({

    propTypes: {
        data: PropTypes.object.isRequired,
        listType: PropTypes.string
    },

    render: function() {

        var that = this;
        var header = null;
        var rows = null;
        if (this.props.listType == 'annotation') {
            header = (<tr>
                      <th className='tabletextheader' style={{width: '10%'}}>GENE</th>
                      <th className='tabletextheader' style={{width: '60%'}}>DESCRIPTION</th>
                      <th>P-VALUE</th>
                      <th>DIRECTION</th>
                      <th>ANNOTATED</th>
                      <th>NETWORK</th>
                      </tr>);
            rows = _.map(this.props.data.genes.annotated, function(data, i) {
                return (<AnnotatedGeneRow key={data.gene.id} termId={that.props.data.pathway.id} data={data} num={i} />)
            })
        } else {
            header = (<tr>
                      <th className='tabletextheader' style={{width: '10%'}}>GENE</th>
                      <th className='tabletextheader' style={{width: '60%'}}>DESCRIPTION</th>
                      <th>P-VALUE</th>
                      <th>DIRECTION</th>
                      <th>ANNOTATED</th>
                      <th>NETWORK</th>
                      </tr>);
            rows = _.map(this.props.data.genes.predicted, function(data, i) {
                return (<PredictedGeneRow key={data.gene.id} termId={that.props.data.pathway.id} data={data} num={i} />)
            })
        }

        return (
                <table className='gn-term-table datatable'>
                <tbody>
                {header}
            {rows}
            </tbody>
                </table>
        )
    }
});

var Term = createReactClass({

    mixins: [Router.Navigation, Router.State],

    getInitialState: function() {

        return {
            listType: Cookies.get('termlist') || 'prediction'
        }
    },
    
    loadData: function(props) {
        console.log(GN.urls.pathway + '/' + props.params.termId + '?verbose');

        $.ajax({

            url: GN.urls.pathway + '/' + props.params.termId + '?verbose',
            dataType: 'json',
            
            success: function(data) {
                this.setState({
                    data: data,
                    error: null
                })
            }.bind(this),
            
            error: function(xhr, status, err) {
                console.error(xhr);
                
                if (err === 'Not Found') {
                    
                    this.setState({
                        data: null,
                        error: 'Term ' + props.params.termId + ' not found',
			                  errorTitle: 'Error ' + xhr.status
                    })
                    
                } else {
                    
                    this.setState({
                        data: null,
                        error: 'Please try again later (' + xhr.status + ')',
			                  errorTitle: 'Error ' + xhr.status
                    })
                    
                }
            }.bind(this)
        })
    },

    componentDidMount: function() {

        this.loadData(this.props)
    },

    componentWillReceiveProps: function(nextProps) {

        this.loadData(nextProps)
    },

    onListTypeClick: function(type) {
        
        Cookies.set('termlist', type);
        
        this.setState({
            listType: type
        })
    },
    
    download: function() {
        var form = document.getElementById('gn-term-downloadform');
        form.submit()
    },
    
    render: function() {
        
        if (this.state.error) {
            
            return (
		            <DocumentTitle title={this.state.errorTitle + GN.pageTitleSuffix}>
                    <div className='flex10'>
                    <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px'}}>
                    <div className='gn-term-description-inner hflex flexcenter maxwidth'>
                    <div className='gn-term-description-name'>
                    <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.5em'}}>
                    {this.props.params.termId} not found
                </span>
                    </div>
                    </div>
                    </div>
                    </div>
		    </DocumentTitle>
            )
            
        } else if (this.state.data) {
            
            var data = this.state.data;
            console.log(this.state);
            
            return (
		            <DocumentTitle title={data.pathway.name + GN.pageTitleSuffix}>
                    <div className='flex10'>
                      <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px'}}>
                        <div className='gn-term-description-inner hflex flexcenter maxwidth'>
                          <div className='gn-term-description-name'>
                          <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.5em'}}>{data.pathway.database}: {data.pathway.name}</span>
                        </div>
                        <div className='flex11' />
                          <div className='gn-term-description-stats' style={{textAlign: 'right'}}>
                            <span>{data.pathway.numAnnotatedGenes} annotated genes</span><br/>
                            <span>Prediction accuracy {(Math.round(100 * data.pathway.auc) / 100).toPrecision(2)}</span><br/>
                          </div>
                        <div className='gn-term-description-networkbutton flexend' style={{padding: '0 0 3px 10px'}}>
                          <a className='clickable button noselect' title={'Open network: ' + data.pathway.name} href={GN.urls.networkPage + data.pathway.id} target='_blank'>
                          OPEN NETWORK</a>
                        </div>
                        </div>
                    </div>
                    <div className='gn-term-container-outer' style={{backgroundColor: color.colors.gnwhite, marginTop: '10px'}}>
                      <div className='gn-term-container-inner maxwidth' style={{padding: '20px'}}>
                        <div className='gn-term-menu noselect' style={{paddingBottom: '20px'}}>
                          <span style={{cursor: 'default', paddingRight: '10px'}}>SHOW</span>
                          
                              <div className={(this.state.listType == 'prediction') ? 'clickable button selectedbutton' : 'clickable button'}
                              onClick={this.onListTypeClick.bind(null, 'prediction')}>
                                PREDICTED GENES</div>
                                <div className={(this.state.listType == 'annotation') ? 'clickable button selectedbutton' : 'clickable button'}
                                onClick={this.onListTypeClick.bind(null, 'annotation')}>
                                ANNOTATED GENES</div>

                         </div>

                        <GeneTable data={data} listType={this.state.listType} />
                        <DownloadPanel onClick={this.download} text='DOWNLOAD PREDICTIONS' />
   
                    </div>
                    </div>
                    <form id='gn-term-downloadform' method='post' encType='multipart/form-data' action={GN.urls.tabdelim}>
                    <input type='hidden' id='termId' name='termId' value={data.pathway.id} />
                    <input type='hidden' id='db' name='db' value={data.pathway.database} />
                    <input type='hidden' id='what' name='what' value='termprediction' />
                    </form>
                    </div>
		    </DocumentTitle>
            )
        } else {
            return (
		            <DocumentTitle title={'Loading' + GN.pageTitleSuffix}>
                    <div className='flex10'>
                    <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px'}}>
                    <div className='gn-term-description-inner hflex flexcenter maxwidth'>
                    <div className='gn-term-description-name'>
                    <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.5em'}}>Loading</span>
                    </div>
                    </div>
                    </div>
                    </div>
		    </DocumentTitle>
            )
        }
    }
});

module.exports = Term;
