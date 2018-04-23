var _ = require('lodash');
var React = require('react');
var ReactTable = require('react-table').default;
var DocumentTitle = require('react-document-title');
var color = require('../js/color');

var GeneList = React.createClass({

    getInitialState: function() {
        return ({
            genes: [],
            notFound: []
        })
    },

    componentWillReceiveProps(newProps) {
        this.handleUpdate(newProps.location.state.geneList);
    },

    componentDidMount() {
        this.handleUpdate(this.props.location.state.geneList)
    },

    parseGeneList: function(geneList) {
        geneList = geneList.trim().replace(/(\r\n|\n|\r|\t|\s|;)/g, ',');
        let genes = geneList.split(',').filter(function(e){return e});
        return(genes);
    },

    handleUpdate: function (geneList) {
        var genes = this.parseGeneList(geneList);
        this.getGenesFromDb(genes);
    },

    handleDbResponse: function (data) {
        let notFound = _.compact(_.map(data, 'not_found'));
        let genes = _.compact(_.flatten(_.map(data, 'genes'))); // this also flattens the genes from a given pathway // TODO: cluster genes searched by pathway id

        this.setState({
            genes: genes,
            notFound: notFound,
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
                    console.log(err)
                }.bind(that)
            })
    },

    render: function() {
        var notFound = this.state.notFound;

        return (
            <DocumentTitle title={'Gene set enrichment' + GN.pageTitleSuffix}>
            <div className='flex10'>
                <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px'}}>
                    <div className='gn-term-description-inner hflex flexcenter maxwidth'>
                        <div className='gn-term-description-name'>
                            <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.5em'}}>Gene set enrichment</span>
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