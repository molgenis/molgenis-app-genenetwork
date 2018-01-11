'use strict'

var _ = require('lodash')
var React = require('react')
var DocumentTitle = require('react-document-title')
var color = require('../../js/color.js')
var Select = require('react-select');
var Async = Select.Async;
var reactable = require('reactable')
var ReactRouter = require('react-router')
var Router = ReactRouter.Router
var Link = ReactRouter.Link
var Tr = reactable.Tr
var Td = reactable.Td
var Th = reactable.Th
var Thead = reactable.Thead
var Table = reactable.Table

var SVGCollection = require('./SVGCollection')
var UploadPanel = require('./UploadPanel')
var Back = require('./Back')

var TermTable = React.createClass({

    componentDidUpdate: function() {
        var terms = this.props.terms
        if (!terms.length < 1){
            var lastTerm = terms.slice(-1)[0]
            var row = document.getElementById(lastTerm.value)
            row.scrollIntoView()
        }
    },
    
    render: function() {

        var terms = this.props.terms
        var rows = []

        if (terms.length < 1){
            rows.push(
                <Tr id='no-term-selected'>
                    <Td column="TERM" className='text'>
                        <span style={{color: color.colors.gngray, fontStyle: 'italic'}}>No terms selected</span>
                    </Td>
                    <Td column="ID" style={{whiteSpace: 'nowrap', textAlign: 'center'}} ></Td>
                    <Th column="REMOVE"></Th>
                </Tr>
                )
        } else {
            _.map(terms, function(term){
                rows.push(
                    <Tr id={term.value}>
                        <Td column="TERM" className='text'>
                            {term.name}
                        </Td>
                        <Td column="ID" style={{whiteSpace: 'nowrap', textAlign: 'center'}} >{term.value}</Td>
                        <Th column="REMOVE"><span className='clickable' onClick={this.props.removeTerm.bind(null, term.value)}>X</span></Th>
                    </Tr>
                    )
            }.bind(this))
        }

        return (
            <div>
                <Table id='hpo-table' className='datatable hpo-table' style={{margin: '40px 0 40px 0'}}>
                    <Thead>
                    <Th column="TERM">TERM</Th>
                    <Th column="ID" style={{width: '100px'}}>ID</Th>
                    <Th column="REMOVE" style={{width: '30px'}}></Th>
                </Thead>
                {rows}
                </Table>

            </div>
            )
    }
})

var DiagnosisMain = React.createClass({

    getInitialState: function() {
        return {
            selectedTerms: Array(),
        }
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
                                  if (result._type === 'term') {
                                    if (result._source.database == 'HPO'){
                                      return {
                                          value: result._source.id,                                          
                                          label: result._source.name + ' - ' + result._source.id,
                                          name: result._source.name
                                      }
                                    }
                                  } else {
                                      return null
                                  }
                              }))
                              var sorted = _.chain(options)
                                  .sortBy(function(item){return item.label.split(' - ')[0]}) //sorts on name of gene/term/network
                                  // .sortBy(function(item){return item.value.split('!')[0]}) //sorts on type of entry (first gene, then term, then network)
                                  .value()
                                // console.log(sorted)
                              return callback(null, {options: sorted, complete: false})
                          } else {
                              return callback(null, {})
                          }
                      })
    },

    onSelectChange: function(selectedOption) {
        var terms = this.state.selectedTerms;
        terms.push({value: selectedOption.value, name: selectedOption.name});
        this.setState({
            selectedTerms: terms
        })
    },

    removeTerm: function(value) {
      var terms = _.filter(this.state.selectedTerms, function(term){
        return term.value != value
      })
      this.setState({
        selectedTerms: terms
      })
    },

    render: function() {
        // console.log('STATE')
        // console.log(this.state)
        var terms = _.map(this.state.selectedTerms, function(term){ return term.value }).join(',')
        
        return (
                <DocumentTitle title={'Diagnosis' + GN.pageTitleSuffix}>
                <div className='flex10' style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '40px'}}>
                <div style={{width: '100%'}}>
                    <h2 style={{display: 'inline'}}>DIAGNOSIS</h2> <Back url={GN.urls.main} />
                    <p>Search for HPO terms below to add, or upload a file with HPO term ID's.</p>

                </div>
                    <div className='hflex' style={{marginTop: '40px'}}>
                        <div className='' style={{width: '60%', minWidth: '300px', paddingRight: '40px'}}>

                            <div style={{float: 'right', paddingBottom: '20px'}} >
                                <UploadPanel text={'UPLOAD FILE'} />
                            </div>

                            <div style={{float: 'left', width: 'calc(100% - 160px)', paddingBottom: '20px'}}>

                                <Async
                                 // ref='select'
                                 name='diagnosis-search'
                                 // options={options}
                                 // multi={true}
                                 // value={'Search here'}
                                 // matchPos='any'
                                 // matchProp='label'
                                 // placeholder=''
                                 autoload={false}
                                 cacheAsyncResults={false}
                                 loadOptions={this.getSuggestions}
                                 onChange={this.onSelectChange}
                                 />

                            </div>     

                            <TermTable terms={this.state.selectedTerms} removeTerm={this.removeTerm}/>

                            <Link onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} className='nodecoration black clickable' to={GN.urls.diagnosisPage + '/' + terms}>
                              <span className='button noselect clickable'>Prioritize genes for given HPO terms</span>
                            </Link>
                        </div>

                        <div className='' style={{width: '40%', minWidth: '300px', paddingLeft: '40px'}}>
                        <p>Predict genes for HPO terms. Description about this page, how it works, etc etc. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                        </div>
                    </div>
                </div>
                </DocumentTitle>
        )
    }
})

module.exports = DiagnosisMain
