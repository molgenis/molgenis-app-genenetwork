var _ = require('lodash');
var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var Select = require('react-select');
var TextareaAutosize = require('react-textarea-autosize')

var GN = require('../../config/gn.js');
var color = require('../js/color');

var MenuBar = require('./MenuBar');
var Logo = require('./ReactComponents/Logo');
var Footer = require('./ReactComponents/Footer');
var Tools = require('./Tools');
var SVGCollection = require('./ReactComponents/SVGCollection');

var Landing = React.createClass({

    mixins: [ReactRouter.History],

    getInitialState: function() {
        return {
            pasteGeneList: false,
            geneList: ''
        }
    },

    componentDidMount: function() {
        this.refs.select && this.refs.select.focus()
    },

    getSuggestions: function(input, callback) {
        if (!input || input.length < 2) {
            return callback(null, {})
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

    onSelectChange: function(value, options) {
        if (value.indexOf('!') > -1) {

            var type = value.substring(0, value.indexOf('!'));
            var id = value.substring(value.indexOf('!') + 1);
            this.history.pushState(null, '/' + type + '/' + id)
        }
    },

    onLogoClick: function() {
        this.history.pushState(null, '/')
    },

    onListIconClick: function () {
        this.setState({ pasteGeneList: !this.state.pasteGeneList });
    },
    
    onGeneListChange: function (event) {
        this.setState({ geneList: event.target.value });
    },

    onGeneListSubmit: function () {
        console.log(this.state.geneList);
        this.setState({ pasteGeneList: !this.state.pasteGeneList });
        this.history.pushState(null, '/network/' + this.state.geneList)
    },

    renderSearchBar() {
        var searchBar = [];

        if (this.state.pasteGeneList) {
            searchBar.push (
                <TextareaAutosize
                    key = 'gene-list'
                    value={this.state.geneList}
                    className='flex11 textarea-genes'
                    minRows={5}
                    maxRows={20}
                    placeholder='Paste a list of gene symbols or ensembl ids'
                    onChange={this.onGeneListChange}
                />
            );
        } else {
            searchBar.push (
                <Select key='gene'
                    ref='select'
                    name='search'
                    value={'Search here'}
                    matchPos='any'
                    matchProp='label'
                    placeholder=''
                    autoload={false}
                    cacheAsyncResults={false}
                    asyncOptions={this.getSuggestions}
                    onChange={this.onSelectChange}
                    className='flex11'
                />
            )
        }

        if (_.size(this.props.params) === 0) {
            searchBar.push (
                <div key='list-icon' style={{margin: '5px 0 0 10px', cursor: 'pointer', height: '37px' }} onClick={ this.onListIconClick }>
                    <SVGCollection.ListIcon h={25} w={25} color={ color.colors.gnyellow } n={5} />
                </div>
            )
        }

        return searchBar;
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