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
            duplicatesInRequest: [],
            duplicatesInResponse: [],
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
        return(genes);
    },

    handleUpdate: function (geneList) {
        var genes = this.parseGeneList(geneList);
        this.getGenesFromDb(genes);
    },

    handleDbResponse: function (dataReceived, dataRequested) {
        var notFound = _.compact(_.map(dataReceived, 'not_found'));
        var genes = _.compact(_.flatten(_.map(dataReceived, 'genes'))); // this also flattens the genes from a given pathway // TODO: cluster genes searched by pathway id

        //check for duplicates
        this.checkForDuplicatesInRequest(dataRequested);

        //filter the duplicate genes, this also sets the state of the duplicates in the result
        let genesToSet = this.getUniqueGenes(genes);

        //set the state
        this.setState({
            genes: genesToSet,
            //genes:genes,
            notFound: notFound,
            error: false
        });
    },

    /**
     * filter the genes returned to the user to only show unique ones, and set the state for the duplicate ones
     * @param genesToUniqueValuesFor the genes returned to check for uniqueness
     * @returns {Array} the genes returned to the user, filtered to contain no duplicates (based on id)
     */
    getUniqueGenes: function(genesToUniqueValuesFor){
        const result = [];
        const duplicates = [];
        const mapOfIdToUniqueness = new Map();
        //check all genes
        for (const gene of genesToUniqueValuesFor) {
            //check if it already in the map (faster than checking array)
            if(!mapOfIdToUniqueness.has(gene.id)){
                //add to map for if encountered again
                mapOfIdToUniqueness.set(gene.id, true);
                //add to actual result we are interested in
                result.push(gene);
            }
            //doing both global and local scope (by returning) is not best practice, might need to fix later
            else{
                duplicates.push(gene.id);
            }
        }
        //set the duplicates that were found
        this.setState({
            duplicatesInResponse : duplicates
        });
        return result;
    },

    /**
     * check for duplicate values in the request entered by the user
     * @param dataRequested the list of items the user requested
     */
    checkForDuplicatesInRequest: function (dataRequested){
        //find the duplicates
        let duplicatesFound = dataRequested.filter(function(a){
            return dataRequested.indexOf(a) !== dataRequested.lastIndexOf(a)
        });
        //the filter didn't actually remove the duplicates, so let's get one of each
        let uniqueDuplicates = _.uniq(duplicatesFound);

        this.setState({
            //add to the duplicates
            duplicatesInRequest: uniqueDuplicates
        });
    },


    getGenesFromDb: function (genesRequested) {
        //only request the unique ones
        let genesUnique = _.uniq(genesRequested);
        //set reference for async AJAX thread
        var that = this;
            $.ajax({
                url: GN.urls.genes + '/' + genesUnique + '?verbose',
                dataType: 'json',
                success: function(genesObtained) {
                    that.handleDbResponse(genesObtained, genesRequested);
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
            duplicatesInRequest: [],
            duplicatesInResponse: [],
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

    /**
     * get a description of a list of items
     * @param listDescription the text before the list of items
     * @param listItems the items to list
     * @returns {*} a div describing the list items
     */
    getListDescription: function(listDescription, listItems){
        let description =
            (
                <div>
                    <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.2em'}}>{listDescription}:</span><br />
                    {_.map(listItems, function (geneItem, i) {
                        if (listItems.length === i+1) return <span key={geneItem}>{geneItem}</span>;
                        else return <span key={geneItem}>{geneItem}, </span>
                    })}
                    <br />
                </div>
            );
        return description;
    },

    /**
     * get a description concerning duplicates if applicable
     * @param listDescription the text before the list of duplicates
     * @param listItems the duplicates
     * @returns {null} the description of the duplicates in a div, or nothing if there are no duplicates
     */
    getDuplicatesList: function(listDescription, listItems){
        let description = null;
        //to not overpopulate the page, we only want to show warnings regarding duplicates when relevant
        if(listItems.length >= 1){
            description = this.getListDescription(listDescription, listItems);
        }
        return description;
    },

    render: function() {
        var notFound = this.state.notFound;
        let duplicatesInRequest = this.state.duplicatesInRequest;
        let duplicatesInResponse = this.state.duplicatesInResponse;

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
                            <span style={{color: 'orange', fontWeight: 'bold'}}>{this.state.duplicatesInRequest.length+this.state.duplicatesInResponse.length}</span><span> duplicates</span><br/>
                        </div>
                        <div className='gn-term-description-networkbutton flexend' style={{padding: '0 0 3px 10px'}}>
                            <a className='clickable button noselect' title={'Open network'} href={GN.urls.networkPage + _.map(this.state.genes, function(gene) { return gene.id } ) } target='_blank'>
                                OPEN NETWORK</a>
                        </div>
                    </div>
                </div>

                <div className={'gn-gene-container-outer'} style={{backgroundColor: color.colors.gnwhite, marginTop: '10px'}}>
                    <div className='gn-gene-container-inner maxwidth' style={{padding: '20px'}}>
                        <div>
                            {this.getListDescription("Not found",notFound)}
                            {this.getDuplicatesList("Duplicates in request",duplicatesInRequest)}
                            {this.getDuplicatesList("Duplicates in response",duplicatesInResponse)}
                        </div>
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