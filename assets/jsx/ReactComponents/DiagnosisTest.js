'use strict'

var _ = require('lodash')
var React = require('react')
var DocumentTitle = require('react-document-title')
var color = require('../../js/color.js')
var Select = require('react-select')

var reactable = require('reactable')
var Tr = reactable.Tr
var Td = reactable.Td
var Th = reactable.Th
var Thead = reactable.Thead
var Table = reactable.Table

var SVGCollection = require('./SVGCollection')
var UploadPanel = require('./UploadPanel')

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
                <Tr>
                    <Td column="TERM" className='text'>
                        <span style={{color: color.colors.gngray, fontStyle: 'italic'}}>No terms selected</span>
                    </Td>
                    <Td column="ID" style={{whiteSpace: 'nowrap', textAlign: 'center'}} ></Td>
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
                    </Tr>
                    )
            })
        }

        return (
            <div>
                <Table id='hpo-table' className='datatable hpo-table' style={{margin: '40px 0 40px 0'}}>
                    <Thead>
                    <Th column="TERM">TERM</Th>
                    <Th column="ID" style={{width: '100px'}}>ID</Th>
                </Thead>
                {rows}
                </Table>

            </div>
            )
    }
})

var Diagnosis = React.createClass({

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

    onSelectChange: function(value, options) {
        this.state.selectedTerms.push({value: value, name: options[0].name})
        var terms = this.state.selectedTerms
        this.setState({
            selectedTerms: terms
        })
    },

    onTermRemove: function(id) {
        // selectedTerms.filter, remove given id
    },

    onClick: function() {
        var terms = _.map(this.state.selectedTerms, function(term){
            return term.value
        })
        window.location = GN.urls.diagnosisPage + terms.join(',')
    },
    
    render: function() {
        // console.log('STATE')
        // console.log(this.state)

        return (
                <DocumentTitle title={'Diagnosis' + GN.pageTitleSuffix}>
                <div className='flex10' style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '40px'}}>
                <div style={{}}>
                    <h2>DIAGNOSIS</h2>
                    <p>Search for HPO terms below to add, or upload a file with HPO term ID's.</p>
                </div>
                    <div className='hflex' style={{marginTop: '40px'}}>
                        <div className='' style={{width: '60%', minWidth: '300px', paddingRight: '40px'}}>

                            <div style={{float: 'right', paddingBottom: '20px'}} >
                                <UploadPanel text={'UPLOAD FILE'} />
                            </div>

                            <div style={{float: 'left', width: 'calc(100% - 160px)', paddingBottom: '20px'}}>
                                
                                <Select
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
                             asyncOptions={this.getSuggestions}
                             onChange={this.onSelectChange} 
                             />

                            </div>     

                            <TermTable terms={this.state.selectedTerms}/>

                            <div className='button noselect clickable' onClick={this.onClick}>Prioritize genes for given HPO terms</div>

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

module.exports = Diagnosis
