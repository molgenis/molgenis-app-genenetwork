'use strict';

var _ = require('lodash')
var color = require('../js/color')
var htmlutil = require('./htmlutil')

var React = require('react')
var Router = require('react-router')
var Route = Router.Route
var DefaultRoute = Router.DefaultRoute
var RouteHandler = Router.RouteHandler
var Link = Router.Link
var Select = require('react-select')
var DocumentTitle = require('react-document-title')

var Logo = require('./ReactComponents/Logo')
var API = require('./ReactComponents/API')
var ManyGenesMaster = require('./ReactComponents/ManyGenesMaster')
var Gene = require('./ReactComponents/Gene')
var Term = require('./ReactComponents/Term')
var Ontology = require('./ReactComponents/Ontology')
var Footer = require('./ReactComponents/Footer')

var GN = {}
window.GN = GN
GN.menuItems = [{
    name: 'HOME',
    route: '/'
}, {
    name: 'HOW IT WORKS',
    route: 'how'
}, {
    name: 'ABOUT US',
    route: 'about'
}, {
    name: 'API',
    route: 'api'
}]

GN.urls = {

    main: 'http://molgenis27.target.rug.nl',
    gene: 'http://molgenis27.target.rug.nl/api/v1/gene',
    pathway: 'http://molgenis27.target.rug.nl/api/v1/pathway',
    coregulation: 'http://molgenis27.target.rug.nl/api/v1/coregulation',
    cofunction: 'http://molgenis27.target.rug.nl/api/v1/cofunction',
    pc: 'http://molgenis27.target.rug.nl/api/v1/pc',
    
    suggest: 'http://molgenis27.target.rug.nl/socketapi/suggest',
    pathwayanalysis: 'http://molgenis27.target.rug.nl/socketapi/pathwayanalysis',
    geneprediction: 'http://molgenis27.target.rug.nl/socketapi/geneprediction',
    genescores: 'http://molgenis27.target.rug.nl/socketapi/genescores',
    genevsnetwork: 'http://molgenis27.target.rug.nl/socketapi/genevsnetwork',

    // genePage: 'http://molgenis27.target.rug.nl/#/gene/',
    // termPage: 'http://molgenis27.target.rug.nl/#/term/',
    // networkPage: 'http://molgenis27.target.rug.nl/#/network/',

    genePage: 'http://molgenis27.target.rug.nl/gene/',
    termPage: 'http://molgenis27.target.rug.nl/term/',
    networkPage: 'http://molgenis27.target.rug.nl/network/',

}

GN.pageTitleSuffix = ' - Gene Network'

var MenuBar = React.createClass({
    render: function() {
        var that = this
        var items = _.map(that.props.items, function(item, i) {
            return (<Link key={item.name} className={'menuitem ' + (i === 0 ? 'first' : i === that.props.items.length - 1 ? 'last' : '')} to={item.route}>{item.name}</Link>)
        })
        return (<div className='gn-top-menubar noselect flex00 flexstart' style={this.props.style}>{items}</div>)
    }
})

var About = React.createClass({
    render: function() {
        return (<span>{'about'}</span>)
    }
})

var How = React.createClass({

    render: function() {

        return (
                <div>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                </div>
        )
        return (
                <span>{'how'}</span>
        )
    }
})

var Api = React.createClass({
    render: function() {
        return (<API />)
    }
})

var GeneMain = React.createClass({
    render: function() {
        return (<div>perhaps gene list ?</div>)
    }
})

var Landing = React.createClass({

    mixins: [Router.State, Router.Navigation],

    getInitialState: function() {
        return {}
    },

    componentWillReceiveProps: function() {
        //this.loadData()
    },

    componentDidMount: function() {
      //this.loadData() 
    },

    // TODO socket listener
    getSuggestions: function(input, callback) {
        if (!input || input.length < 2) {
            return callback(null, {})
        }
        var ts = new Date()
        io.socket.get(GN.urls.suggest,
                      {
                          q: input
                      },
                      function(res, jwres) {
                          var options = _.map(res, function(o) {
                              return {value: o.text, label: o.text}
                          })
                          console.debug('%d ms suggest: %d options', new Date() - ts, res.length)
                          callback(null, {options: options, complete: true})
                      })
        io.socket.on('suggestions', function(msg) {
            console.debug('%d ms socket suggest: %d options', new Date() - ts, msg.length)
        })
    },

    onSelectChange: function(value, options) {
        console.log('select ' + value)
    },

    onLogoClick: function() {
        this.transitionTo('home')
    },
    
    render: function() {

        // console.log(this.getParams())

        var topSearch = (<div className='flex11' />)
        var topBanner = null
        if (_.size(this.getParams()) === 0) {
            topBanner = (<div className='searchcontainer'>
                          <div className='searchheader noselect defaultcursor'>
                          Catchy mantra here
                          </div>
                          <div className='selectcontainer'>
                         <Select
                         name='search'
                         value={'Search doesn\'t work yet -- you have to modify the url for the time being'}
                         matchPos='any'
                         matchProp='label'
                         placeholder=''
                         autoload={false}
                         asyncOptions={this.getSuggestions}
                         onChange={this.onSelectChange} />
                          </div>
                          <div className='examples noselect defaultcursor'>For example:&nbsp;
                          <Link className='clickable' title='MYOM1' to='gene' params={{geneId: 'MYOM1'}}>MYOM1</Link>,&nbsp;
                          <Link className='clickable' title='Interferon signaling' to='term' params={{termId: 'REACTOME_INTERFERON_SIGNALING'}}>Interferon signaling</Link>,&nbsp;
                          <Link className='clickable' title='Schizophrenia' to='network' params={{ids: 'Schizophrenia'}}>Schizophrenia</Link>
                          </div>
                          </div>)
        } else {
            topSearch = (<div className='gn-top-search flex11' style={{margin: '0 20px'}}>
                         <Select name='search' value={'Search doesn\'t work yet -- you have to modify the url for the time being'}
                         matchProp='label' placeholder='' autoload={false} asyncOptions={this.getSuggestions} onChange={this.onSelectChange} />
                         </div>)
        }
        var that = this
        // 'Enter your search or paste a gene list here'
        return (<div className='gn-app vflex'>
                <div className='gn-top flex00 flexcenter hflex'>
                <div className='gn-top-logo clickable flex00' style={{margin: '10px 0'}} onClick={this.onLogoClick}>
                <Logo w={33} h={60} mirrored={true} style={{float: 'left', paddingRight: '10px'}} />
                <div className='noselect' style={{fontSize: '1.5em', color: color.colors.gndarkgray, float: 'left'}}>
                GENE<br/>NETWORK
                </div>
                </div>
                {topSearch}
                <MenuBar items={GN.menuItems} style={{backgroundColor: color.colors.gnwhite, padding: '20px'}} />
                </div>
                {topBanner}
                <RouteHandler />
                <Footer />
      	        </div>
        )
    }
})

var FormMixin = {
    handleSubmit: function(e) {
        e.preventDefault()
        var query = this.refs.query.getDOMNode().value.trim()
        console.log(e)
        if (query) {
            this.props.onQuerySubmit(query)
        }
    },
}

var SearchFormTextField = React.createClass({

    mixins: [FormMixin],

    render: function() {
        return (<form className='searchform' onSubmit={this.handleSubmit}>
                  <input type='text' placeholder={this.props.placeholder} ref='query' defaultValue=''></input>
                  <input type='submit' value='Go!'></input>
                </form>)
    }
})

var SearchFormTextArea = React.createClass({

    mixins: [FormMixin],

    render: function() {
        return (<form className='textareasearchform' onSubmit={this.handleSubmit}>
                <textarea id='manytextarea' placeholder={this.props.placeholder} ref='query' defaultValue={this.props.ids} />
                <div><input className='gobutton' type='submit' value='Go!' /></div>
                </form>)
    }
})

GN.routes = (
        <Route name = 'home' path = '/' handler = {Landing}>
        <Route name = 'how' handler = {How} />
        <Route name = 'about' handler = {About} />
        <Route name = 'api' handler = {Api} />
        <Route name = 'gene' path='/gene/:geneId' handler={Gene} />
        <Route name = 'term' path='/term/:termId' handler = {Term} />
        <Route name = 'network' path='/network/:ids' handler = {ManyGenesMaster} />
        <Route name = 'ontology' path='/ontology/:id' handler = {Ontology} />
        </Route>
)

Router.run(GN.routes, Router.HistoryLocation, function(Handler) {
// Router.run(GN.routes, function(Handler) {
    React.render(
            <Handler />,
        document.body
    )
})
