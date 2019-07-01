var _ = require('lodash');
var React = require('react');
var ReactTable = require('react-table').default;
var DocumentTitle = require('react-document-title');
var color = require('../js/color');

var GeneList = React.createClass({

    getInitialState: function() {
        return ({
            genes: [],
            notFound: [],
            duplicates: [],
            error: false,
            errorMessage: ""
        })
    },

    componentWillReceiveProps: function(newProps) {
        this.handleUpdate(newProps.location.state.geneList);
    },

    componentDidMount: function() {
        this.handleUpdate(this.props.location.state.geneList)
    },

    parseGeneList: function(geneList) {
        geneList = geneList.trim().replace(/(\r\n|\n|\r|\t|\s|;)/g, ',');
        var genes = geneList.split(',').filter(function(e){return e});
        genes = _.uniq(genes);
        return(genes);
    },

    handleUpdate: function (geneList) {
        var genes = this.parseGeneList(geneList);
        this.getGenesFromDb(genes);
    },

    handleDbResponse: function (data) {
        var notFound = _.compact(_.map(data, 'not_found'));
        var genes = _.compact(_.flatten(_.map(data, 'genes'))); // this also flattens the genes from a given pathway // TODO: cluster genes searched by pathway id

        this.setState({
            genes: genes,
            notFound: notFound,
            error: false
        });
    },

    getGenesFromDb: function (genes) {
        var that = this;
            $.ajax({
                url: GN.urls.genes + '/' + genes + '?verbose',
                dataType: 'json',
                success: function(genes) {
                    that.handleDbResponse(genes);
                }.bind(that),
                error: function(xhr, status, err) {
                    //inform the user that something went wrong
                    that.handleErrorDbResponse(xhr.status);
                    console.log(err)
                }.bind(that)
            })
    },

    /**
     * handle when the call to the database/API returns an error instead of a result
     * @param errorCode the error code returned by the API/database
     */
    handleErrorDbResponse: function(errorCode){
        let errorMessageToSet = "";
        if(errorCode === 414){
            //this one we know, a too large dataset
            errorMessageToSet = "the request was too large, try limiting to 500 genes";
        }
        else{
            //no to make it hackers to easy, keep the rest generic
            errorMessageToSet = "an error occurred during the request";
        }
        //set the state, all lists empty since we failed
        this.setState({
            genes: [],
            notFound: [],
            duplicates: [],
            error: true,
            errorMessage: errorMessageToSet
        });
    },

    /**
     * display the errors if necessary
     * @returns {null} either null, which means no element, or a div with the error message
     */
    getErrorDisplay: function(){
        let display = null;
        //if there is an error, display it
        if(this.state.error){
            display = (
                <div className='gn-error-container' style={{textAlign: 'left'}}>
                    <span style={{color: 'orange', fontWeight: 'bold'}}>{this.state.errorMessage}</span>
                </div>
            );
        }
        return display;
    },


    render: function() {
        var notFound = this.state.notFound;

        return (
            <DocumentTitle title={'Gene set enrichment' + GN.pageTitleSuffix}>
            <div className='flex10'>
                <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px'}}>
                    <div className='gn-term-description-inner hflex flexcenter maxwidth'>
                        <div>
                            <div className='gn-term-description-name'>
                                <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.5em'}}>Gene set enrichment</span>
                            </div>
                            {this.getErrorDisplay()}
                        </div>
                        <div className='flex11' />
                        <div className='gn-term-description-stats' style={{textAlign: 'right'}}>
                            <span style={{color: 'green', fontWeight: 'bold'}}>{this.state.genes.length}</span><span> genes found</span><br/>
                            <span style={{color: 'red', fontWeight: 'bold'}}>{this.state.notFound.length}</span><span> not found</span><br/>
                        </div>
                        <div className='gn-term-description-networkbutton flexend' style={{padding: '0 0 3px 10px'}}>
                            <a className='clickable button noselect' title={'Open network'} href={GN.urls.networkPage + _.map(this.state.genes, function(gene) { return gene.id } ) } target='_blank'>
                                OPEN NETWORK</a>
                        </div>
                    </div>
                </div>

                <div className={'gn-gene-container-outer'} style={{backgroundColor: color.colors.gnwhite, marginTop: '10px'}}>
                    <div className='gn-gene-container-inner maxwidth' style={{padding: '20px'}}>
                        <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.2em'}}>Not found:</span><br />
                        {_.map(notFound, function (geneItem, i) {
                            if (notFound.length === i+1) return <span key={geneItem}>{geneItem}</span>;
                            else return <span key={geneItem}>{geneItem}, </span>
                        })}
                        <div><br />
                            <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.2em'}}>Found:</span>
                            <ReactTable
                                data={this.state.genes}
                                columns={[{
                                    Header: 'Symbol',
                                    accessor: 'name',
                                    maxWidth: 100
                                }, {
                                    Header: 'Ensembl ID',
                                    accessor: 'id',
                                    maxWidth: 175
                                }, {
                                    Header: 'Description',
                                    accessor: 'description',
                                }
                                ]}
                                defaultPageSize={10}
                            />
                        </div>
                    </div>
                </div>
            </div>
            </DocumentTitle>
        )
    }

});

module.exports = GeneList;