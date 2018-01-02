var _ = require('lodash');
var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var Select = require('react-select');
var Async = Select.Async;
var TextareaAutosize = require('react-textarea-autosize');

var GN = require('../../config/gn.js');
var color = require('../js/color');

var MenuBar = require('./MenuBar');
var Logo = require('./ReactComponents/Logo');
var Footer = require('./ReactComponents/Footer');
var Tools = require('./Tools');

/**
 * Component for root url
 */
var Landing = React.createClass({

    mixins: [ReactRouter.History],

    getInitialState: function() {
        return {
            pasteGeneList: false,
            geneList: ''
        }
    },

    /**
     * Focus on search bar when page gets active
     */
    componentDidMount: function() {
        this.refs.select && this.refs.select.focus();
    },

    /**
     * Checks if value of the search bar input is a list of multiple genes
     * @param geneList input of search bar
     * @returns {boolean} is geneList
     */
    isGeneList: function (geneList) {
        // TODO: Better logic to determine if input is a gene list
        return (geneList.length > 10 && /[\n\r;,]+/.test(geneList) || geneList.length > 30);
    },

    /**
     * Uses an elasticsearch index to search for valid search options in the search bar
     * @param input
     * @param callback
     * @returns {*}
     */
    getSuggestions: function(input, callback) {
        // Start search after 1 character
        if (!input || input.length < 1) return callback(null, {});

        // If a list of genes is passed change state update components
        if (this.isGeneList(input)) {
            this.setState({geneList: input,pasteGeneList: true});
            return callback(null, {});
        }

        io.socket.get(GN.urls.suggest,
            {
                q: input
            },
            function(res, jwres) {
                if (jwres.statusCode === 200) {
                    var options = _.compact(_.map(res, function(result) {
                        if (result._type === 'gene') {
                            return {
                                value: 'gene!' + result._source.id,
                                label: result._source.name + ' - ' + result._source.description
                            }
                        } else if (result._type === 'term') {
                            return {
                                value: 'term!' + result._source.id,
                                label: result._source.name + ' - ' + result._source.database + ' ' + result._source.type
                            }
                        } else if (result._type === 'trait_mapped') {
                            return {
                                value: 'network!' + result._source.shortURL,
                                label: result._source.name + ' - ' + result._source.numGenes + ' GWAS genes'
                            }
                        } else {
                            return null
                        }
                    }));
                    var sorted = _.chain(options)
                        .sortBy(function(item){return item.label.split(' - ')[0]}) //sorts on name of gene/term/network
                        .sortBy(function(item){return item.value.split('!')[0]}) //sorts on type of entry (first gene, then term, then network)
                        .value();
                    return callback(null, {options: sorted, complete: false})
                } else {
                    return callback(null, {})
                }
            })
    },

    /**
     * When a search options is clicked push to relevant view
     * @param value
     * @param options
     */
    onSelectChange: function(selectedOption) {
        let value = selectedOption.value;
        if (value.indexOf('!') > -1) {
            var type = value.substring(0, value.indexOf('!'));
            var id = value.substring(value.indexOf('!') + 1);
            this.history.pushState(null, '/' + type + '/' + id)
        }
    },

    onLogoClick: function() {
        this.history.pushState(null, '/')
    },

    /**
     * Checks if the value of the search bar is still a list
     * @param event
     */
    onGeneListChange: function (event) {
        this.setState({ geneList: event.target.value });

        if (!this.isGeneList(event.target.value)) {
            this.setState({
                pasteGeneList: false,
            });
        }
    },

    onGeneListSubmit: function () {
        this.setState({ pasteGeneList: false });
        this.history.pushState({ geneList: this.state.geneList }, '/gene-list/')
    },

    /**
     * Necessary to maintain focus at the end of the search bar when the state.geneList == true
     * @param event
     */
    moveCaretAtEnd(event) {
        var temp_value = event.target.value;
        event.target.value = '';
        event.target.value = temp_value
    },

    renderSearchBar() {
        if (this.state.pasteGeneList && _.size(this.props.params) === 0) {
            return (
                <TextareaAutosize
                    key = 'gene-list'
                    ref = 'select'
                    value={this.state.geneList}
                    className='flex11 textarea-genes'
                    minRows={5}
                    maxRows={20}
                    placeholder='Paste a list of gene symbols or Ensembl IDs'
                    autoFocus
                    onChange={this.onGeneListChange}
                    onFocus={this.moveCaretAtEnd}
                />
            );
        } else {
            return (
                <Async key='gene'
                    ref='select'
                    name='search'
                    matchPos='any'
                    matchProp='label'
                    placeholder='Search here or paste a list of multiple genes (Ensembl IDs or HGNC symbols)'
                    autoload={false}
                    cacheAsyncResults={false}
                    loadOptions={this.getSuggestions}
                    onChange={this.onSelectChange}
                    className='flex11'
                />
            )
        }
    },

    render: function() {
        var topSearch = (<div className='flex11' />);
        var topBanner = null;

        if (_.size(this.props.params) === 0) {
            if (this.props.location.pathname.indexOf('diagnosis') === 1) {
                topBanner = (null)
            } else {
                topBanner = (<div className='searchcontainer'>
                    <div className='searchheader noselect defaultcursor'>
                        Predict gene functions. Discover potential disease genes.
                    </div>
                    <div className='selectcontainer hflex'>
                        {this.renderSearchBar()}
                    </div>
                    { this.state.pasteGeneList ?
                        <span
                            style={{margin: '10px 20px'}}
                            className='button clickable noselect selectedbutton'
                            onClick={this.onGeneListSubmit}>
                            SUBMIT
                        </span> :
                        null
                    }
                    <div className='examples noselect defaultcursor'>For example:&nbsp;
                        <Link className='clickable' title='SMIM1' to='/gene/SMIM1'>SMIM1</Link>,&nbsp;
                        <Link className='clickable' title='Interferon signaling' to='/term/REACTOME:INTERFERON_SIGNALING'>Interferon signaling</Link>,&nbsp;
                        <Link className='clickable' title='Migraine' to='/network/3ZLYoS' params={{ids: 'Migraine'}}>Migraine</Link>,&nbsp;
                        <Link className='clickable' title='Autism' to='/network/2iGTR8' params={{ids: 'Autism'}}>Autism</Link>
                    </div>
                </div>)
            }
        } else {
            topSearch = (<div className='gn-top-search flex11' style={{margin: '0 20px'}}>
                {this.renderSearchBar()}
            </div>)
        }
        return (<div className='gn-app vflex'>
                <div className='gn-top flex00 flexcenter hflex'>
                    <div className='gn-top-logo clickable flex00' style={{margin: '10px 0'}} onClick={this.onLogoClick}>
                        <Logo w={33} h={60} mirrored={true} style={{float: 'left', paddingRight: '10px'}} />
                        <div className='noselect' style={{fontSize: '1.5em', color: color.colors.gndarkgray, float: 'left'}}>
                            GENE<br/>NETWORK
                        </div>
                    </div>
                    {topSearch}
                    <MenuBar items={GN.menuItems} style={{padding: '30px 20px 20px 20px'}} />
                </div>
                {topBanner}
                {this.props.children}
                {!this.props.children ? <Tools /> : null}
                {!this.props.children || this.props.children.props.route.path.indexOf('network') < 0 ? <Footer /> : null}
            </div>
        )
    }
});

module.exports = Landing;