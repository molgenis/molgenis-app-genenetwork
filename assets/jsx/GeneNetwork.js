'use strict'

var DOMAIN = require('../../config/domain.js').domain

var _ = require('lodash')
var color = require('../js/color')
var htmlutil = require('./htmlutil')

var React = require('react')
var ReactDOM = require('react-dom')
var ReactRouter = require('react-router')
var Router = ReactRouter.Router
var Route = ReactRouter.Route
var Link = ReactRouter.Link
var createBrowserHistory = require('history/lib/createBrowserHistory')

var Select = require('react-select')

var Logo = require('./ReactComponents/Logo')
var API = require('./ReactComponents/API')
var Gene = require('./ReactComponents/Gene/Gene')
var Term = require('./ReactComponents/Term')
var Network = require('./ReactComponents/Network')
var Ontology = require('./ReactComponents/Ontology')
var DiagnosisMain = require('./ReactComponents/DiagnosisMain')
var Diagnosis = require('./ReactComponents/Diagnosis')
var SVGCollection = require('./ReactComponents/SVGCollection')
var Footer = require('./ReactComponents/Footer')

var GN = {}
window.GN = GN
GN.menuItems = [{
    name: 'HOME',
    route: '/'
}, {
    name: 'HOW IT WORKS',
    route: '/how'
}, {
    name: 'ABOUT',
    route: '/about'
}, {
    name: 'API',
    route: '/api'
}]

GN.urls = {

    main: DOMAIN,
    gene: DOMAIN + '/api/v1/gene',
    transcript: DOMAIN + '/api/v1/transcript',
    transcriptBars: DOMAIN + '/api/v1/transcriptBars',
    pathway: DOMAIN + '/api/v1/pathway',
    coregulation: DOMAIN + '/api/v1/coregulation',
    tissues: DOMAIN + '/api/v1/tissues',
    cofunction: DOMAIN + '/api/v1/cofunction',
    pc: DOMAIN + '/api/v1/pc',
    
    suggest: DOMAIN + '/socketapi/suggest',
    diagnosisSuggest: DOMAIN + '/socketapi/diagnosisSuggest',
    pathwayanalysis: DOMAIN + '/socketapi/pathwayanalysis',
    geneprediction: DOMAIN + '/socketapi/geneprediction',
    network: DOMAIN + '/socketapi/network',
    genescores: DOMAIN + '/socketapi/genescores',
    genevsnetwork: DOMAIN + '/socketapi/genevsnetwork',

    prioritization: DOMAIN + '/api/v1/prioritization',
    
    genePage: DOMAIN + '/gene/',
    termPage: DOMAIN + '/term/',
    networkPage: DOMAIN + '/network/',
    diagnosisPage: DOMAIN + '/diagnosis',

    svg2pdf: DOMAIN + '/api/v1/svg2pdf',
    // diagnosisResults: DOMAIN + '/api/v1/diagnosisResults',
    tabdelim: DOMAIN + '/api/v1/tabdelim',
    
    diagnosisVCF: DOMAIN + '/api/v1/vcf',
}

GN.pageTitleSuffix = ' - Gene Network'

var MenuBar = React.createClass({
    render: function() {
        var that = this
        var items = _.map(that.props.items, function(item, i) {
            // return (<Link key={item.name} className={'menuitem ' + (i === 0 ? 'first' : i === that.props.items.length - 1 ? 'last' : '')} to={item.route}>{item.name}</Link>)
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
                <div>TBA</div>
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

var Box = React.createClass({
    getInitialState: function() {
      return {
        color: color.colors.gngray
      }
    },

    onMouseOver: function() {
      this.setState({
        color: color.colors.gndarkgray
      })
    },

    onMouseOut: function() {
      this.setState({
        color: color.colors.gngray
      })
    },

    render: function(){
      // padding: '40px 40px 40px 40px', margin: '10px',
      return (
        <div>
          <div className='box-sizing' style={{backgroundColor: color.colors.gnlightergray, border: '20px solid #fff', padding: '40px', width: '33.33333%', float: 'left', minWidth: '350px'}} >
            <h3 style={{color: color.colors.gndarkgray}}>{this.props.title}</h3>
            <p style={{color: color.colors.gndarkgray}}>{this.props.text}</p>
            <div style={{float: 'right'}}>
              <Link style={{color: this.state.color, fontSize: '10pt'}} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} className='nodecoration black clickable' to={this.props.url}>
                <SVGCollection.ArrowRight color={this.state.color} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} /> 
                <b style={{paddingLeft: '5px'}}>CONTINUE</b>
              </Link>
            </div>
          </div>
        </div>
        )
    }
})

var Tools = React.createClass({
	render: function(){
		return (
			<div style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '20px'}}>
				<Box 
            title="DIAGNOSIS"
            text="Prioritize genes for HPO phenotypes. Small description about diagnosis page, what it does, how it works, etc etc etc etc."
			       url={GN.urls.diagnosisPage} />
      </div>
			)
	}
})

var Landing = React.createClass({

    mixins: [ReactRouter.History],

    getInitialState: function() {
        return {}
    },

    componentWillReceiveProps: function(nextProps) {
        console.log(nextProps)
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
                              }))
                              var sorted = _.chain(options)
                                  .sortBy(function(item){return item.label.split(' - ')[0]}) //sorts on name of gene/term/network
                                  .sortBy(function(item){return item.value.split('!')[0]}) //sorts on type of entry (first gene, then term, then network)
                                  .value()
                              return callback(null, {options: sorted, complete: false})
                          } else {
                              return callback(null, {})
                          }
                      })
    },

    onSelectChange: function(value, options) {
        
        if (value.indexOf('!') > -1) {
            
            var type = value.substring(0, value.indexOf('!'))
            var id = value.substring(value.indexOf('!') + 1)
            this.history.pushState(null, '/' + type + '/' + id)
        }
    },

    onLogoClick: function() {
        this.history.pushState(null, '/')
    },
    
    render: function() {
        console.log(this.props)
        var topSearch = (<div className='flex11' />)
        var topBanner = null
        if (_.size(this.props.params) === 0) {
            if (this.props.location.pathname.indexOf('diagnosis') === 1) {
                topBanner = (null)
            } else {
                topBanner = (<div className='searchcontainer'>
                             <div className='searchheader noselect defaultcursor'>
                             Predict gene functions. Discover potential disease genes.
                             </div>
                             <div className='selectcontainer'>
                             <Select
                             ref='select'
                     name='search'
                     value={'Search here'}
                     matchPos='any'
                     matchProp='label'
                     placeholder=''
                     autoload={false}
                     cacheAsyncResults={false}
                     asyncOptions={this.getSuggestions}
                     onChange={this.onSelectChange} />
                             </div>
                             <div className='examples noselect defaultcursor'>For example:&nbsp;
                             <Link className='clickable' title='SMIM1' to='/gene/SMIM1'>SMIM1</Link>,&nbsp;
                             <Link className='clickable' title='Interferon signaling' to='/term/REACTOME:INTERFERON_SIGNALING'>Interferon signaling</Link>,&nbsp;
                             <Link className='clickable' title='Migraine' to='/network/3ZLYoS' params={{ids: 'Migraine'}}>Migraine</Link>,&nbsp;
                             <Link className='clickable' title='Autism' to='/network/2iGTR8' params={{ids: 'Autism'}}>Autism</Link>
                             {/*<Link className='clickable' title='Migraine' to='/network/4CiuBn' params={{ids: 'Migraine'}}>Migraine</Link>,&nbsp;
                             <Link className='clickable' title='Autism' to='/network/2jujak' params={{ids: 'Autism'}}>Autism</Link>*/}
                             </div>
                             </div>)
            }
        } else {
            topSearch = (<div className='gn-top-search flex11' style={{margin: '0 20px'}}>
                             <Select
                             ref='select'
                     name='search'
                     value={'Search here'}
                     matchPos='any'
                     matchProp='label'
                     placeholder=''
                     autoload={false}
                     cacheAsyncResults={false}
                     asyncOptions={this.getSuggestions}
                     onChange={this.onSelectChange} />
                         </div>)
        }
        var that = this
        // 'Enter your search or paste a gene list here'
                //{!this.props.children || this.props.children.props.route.path.indexOf('network') < 0 ? <Footer /> : null}
        // {!this.props.children || (this.props.children.props.route.path.indexOf('network') < 0) ? <Footer /> : null}
        console.log('this.props.childr')
        console.log(this.props.children)
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
                {/*} {!this.props.children || (this.props.children.props.route.path.indexOf('network') < 0 && this.props.children.props.route.path.indexOf('diagnosis') < 0) ? <Footer /> : null} */}
                {!this.props.children || this.props.children.props.route.path.indexOf('network') < 0 ? <Footer /> : null}
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

        <Route>
        <Route path='/' component = {Landing}>
        <Route path='/how' component = {How} />
        <Route path='/about' component = {About} />
        <Route path='/api' component = {Api} />
        <Route path='/gene/:geneId' component={Gene} />
        <Route path='/term/:termId' component = {Term} />
        <Route path='/network/:ids' component = {Network} />
        <Route path='/ontology/:id' component = {Ontology} />
        <Route path='/diagnosis' component = {DiagnosisMain} />
        <Route path='/diagnosis/:id' component = {Diagnosis} />
        </Route>
        </Route>
)

var history = createBrowserHistory()
ReactDOM.render(<Router history={history}>
                {GN.routes}
                </Router>,
                document.getElementById('reactcontainer')
               )
