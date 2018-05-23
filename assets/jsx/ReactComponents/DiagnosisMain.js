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
        // var terms = this.props.terms
        // if (!terms.length < 1){
        //     var lastTerm = terms.slice(-1)[0]
        //     var row = document.getElementById(lastTerm.value)
        //     row.scrollIntoView()
        // }
    },
    
    render: function() {

        var terms = this.props.terms
        var rows = []

        if (terms.length < 1){
            rows.push(
                <Tr id='no-term-selected' key='no-term-selected'>
                    <Td column="TERM" className='text'>
                        <span style={{color: color.colors.gngray, fontStyle: 'italic'}}>No terms selected</span>
                    </Td>
                    <Td column="ID" style={{whiteSpace: 'nowrap', textAlign: 'center'}} data=''></Td>
                    <Td column="REMOVE" data=''></Td>
                </Tr>
                )
        } else {
            _.map(terms, function(term){
                rows.push(
                    <Tr id={term.value} key={term.value}>
                        <Td column="TERM" style={{width: '100%'}} className='text' data={term.name}></Td>
                        <Td column="ID" style={{whiteSpace: 'nowrap', minWidth: '110px', textAlign: 'center'}} data={term.value}></Td>
                        <Td column="REMOVE" style={{minWidth: '80px', textAlign: 'center'}}><span className='clickable' onClick={this.props.removeTerm.bind(null, term.value)}>X</span></Td>
                    </Tr>
                    )
            }.bind(this))
        }

        return (
            <div>
                <Table id='hpo-table' className='datatable hpo-table' style={{margin: '0px 0 30px 0'}}>
                    <Thead>
                      <Th column="TERM" style={{width: '100%'}}>TERM</Th>
                      <Th column="ID" style={{minWidth: '110px', textAlign: 'center'}}>ID</Th>
                      <Th column="REMOVE" style={{minWidth: '80px', textAlign: 'center'}}></Th>
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
            checkbox: false,
            filename: 'CHOOSE A FILE...'
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

    onCheckboxClick: function(){
      var checkbox = this.state.checkbox ? false : true
      this.setState({
        checkbox: checkbox
      })
    },

    onTextAreaChange: function(){
      var textlen = document.getElementById('textarea-genelist').value.length
      var checkbox = textlen > 0 ? true : false
       this.setState({
          checkbox: checkbox
       })
    },

    onFileUploadClick: function() {

        document.getElementById('file-genelist').onchange = function(){
            var filename = document.getElementById('file-genelist').files[0].name
            filename = filename.length > 30 ? (filename.slice(0, 15) + '...') : filename
            this.setState({
                filename: filename,
                checkbox: true
            })
        }.bind(this)
    },

    onSubmit: function(){
      var genes = document.getElementById('textarea-genelist').value
      var terms = _.map(this.state.selectedTerms, function(term){ return term.value }).join(',')
      var useCustomGeneSet = this.state.checkbox ? true : false
      var file = document.getElementById('file-genelist').files[0]

      if (!file){
        this.props.history.pushState({
          genes: genes,
          useCustomGeneSet: useCustomGeneSet
        }, GN.urls.diagnosisPage + '/' + terms)
      } else {
          var fd = new FormData()
          fd.append('genelist', file)

          $.ajax({
              url: GN.urls.fileupload,
              data: fd,
              processData: false,
              contentType: false,
              type: 'POST',
              success: function(data){
                  this.props.history.pushState({
                    genes: data,
                    useCustomGeneSet: useCustomGeneSet
                  }, GN.urls.diagnosisPage + '/' + terms)
              }.bind(this)
          })
      }


    },

    render: function() {
        var textcolor = this.state.checkbox ? '#000' : color.colors.gngray
        var style = this.state.checkbox ? {transition: 'all .5s ease-in-out', height: '100px', overflow: 'hidden'} : {transition: 'all .5s ease-in-out', overflow: 'hidden', height: '0px'}
        var textsize = {fontSize: '10pt'}
        

        // <div id='step1' className='hflex'>
                            
        //                     <div style={{width: '40px'}}><h2>1.</h2></div>
                          
        //                     <div id='step1content' style={{width: '100%',  paddingTop: '4px'}}>
                            

        return (
                <DocumentTitle title={'Diagnosis' + GN.pageTitleSuffix}>
                <div className='flex10' style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '40px'}}>
                <div style={{width: '100%'}}>
                    <h2 style={{display: 'inline'}}>HPO GENE PRIORITIZATION</h2> <Back url={GN.urls.main} />

                </div>
                    <div className='hflex' style={{marginTop: '40px'}}>
                        <div className='' style={{width: '55%', minWidth: '600px', paddingRight: '60px'}}>
                          <ol className='simple-list'>
                          <li><h3>Select HPO terms</h3>

                                <div className='hflex' style={{paddingTop: '20px'}}>
                                  <div className='flex10' style={{float: 'left', paddingBottom: '20px', width: 'calc(100% - 200px)'}}>

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
                                  <div className='flex10'>
                                    <label htmlFor='file-termlist' onClick={this.onFileUploadClick} style={{float: 'right'}}>
                                      <UploadPanel text={this.state.filename} />
                                    </label>
                                  </div>
                                  </div>

                                  <TermTable terms={this.state.selectedTerms} removeTerm={this.removeTerm}/>

                          </li>

                                
                            <li>
  

                                <label htmlFor="checkbox" onClick={this.onCheckboxClick} style={{position: 'absolute'}}>
                                    <SVGCollection.CheckBox selected={this.state.checkbox}/>
                                  </label>
                                  
                                    
                                      <div><h3 style={{paddingLeft: '30px', color: textcolor, cursor: 'pointer'}} onClick={this.onCheckboxClick}>OPTIONAL: filter output on candidate genes</h3></div>

                                    <input type="checkbox" id="checkbox" style={{display: 'none'}}/>

                                    <div style={style} className='hflex'>
                                      <div className='flex10' style={{paddingTop: '20px', width: 'calc(100% - 200px)'}}>
                                        <textarea id="textarea-genelist" placeholder='Paste a list of genes here...' onChange={this.onTextAreaChange} cols="40" rows="5" className='textarea-genes' style={{width: '100%', height: '65px', border: '1px solid ' + color.colors.gngray, color: textcolor, outline: 'none'}}></textarea>
                                      </div>
                                      <div className='flex10' style={{paddingTop: '20px'}}>
                                        <label htmlFor='file-genelist' onClick={this.onFileUploadClick} style={{float: 'right'}}>
                                          <UploadPanel text={this.state.filename} />
                                        </label>
                                      </div>

                                  </div>
                              </li>

                                <form encType='multipart/form-data'>
                                  <input id="file-genelist" type="file" style={{display: 'none'}}/>
                                </form>

                                <form encType='multipart/form-data'>
                                  <input id="file-termlist" type="file" style={{display: 'none'}}/>
                                </form>



                                <span onClick={this.onSubmit} className='button noselect clickable' style={{marginTop: '20px'}}>Prioritize genes for given HPO terms</span>
                            
                                </ol>
                              </div>

                              <div id='text-right' style={{width: '45%', padding: '20px', backgroundColor: color.colors.gnyellow, lineHeight: '1'}}>

                              <span style={textsize}>Using the HPO gene prioritization it possible to rank genes based on a patient’s phenotypes.</span><br /><br />
                           
                              <ol className='simple-list'>
                                <li><span style={textsize}>Fill in the phenotypes of a patient as HPO terms (<a href='http://compbio.charite.de/hpoweb/showterm?id=HP:0000118' className='externallink' target='_blank'>compbio.charite.de/hpoweb/showterm?id=HP:0000118</a>). Try to be as specific as possible, if a term could not be found then a more general term should be used. If the exact phenotype of a patient is unclear it is better to use a more general term, as a wrongly assigned specific term might hinder accurate ranking. For example, there are many subclasses of seizures (<a href='http://compbio.charite.de/hpoweb/showterm?id=HP:0001250' className='externallink' target='_blank'>compbio.charite.de/hpoweb/showterm?id=HP:0001250</a>), if it clear that a patient shows a specific subclass then the HPO term for this subclass should be used, if this is not clear then it is best to use the general seizures term. It is also best to only use distinct HPO terms to describe a patient’s phenotypes. If two close related terms are used to describe the same phenotype, then these will result in some bias towards this phenotype in the prioritization. Please use the HPO number or the primary name, synonyms are not supported at the moment.</span></li>
                                <li><span style={textsize}>Optional list of genes to be ranked using the HPO terms. This could for instance be the genes in which a patient has candidate disease causing mutations that require classification or follow-up analysis. The genes that prioritize on top are the most likely candidates based on our HPO term predictions. If no gene list is provided we will simply rank all genes based on the provided HPO terms.</span></li>
                              </ol>
                    
                            <h3 style={{paddingTop: '15px'}}>FAQ</h3>
                            <ul>
                              <li><span style={textsize}><i>Why is my term not found? </i><br />
                                We do not have significant predictions for all HPO terms. Either because very few genes are known for a term of because our current dataset is unable to reliable predict back the known genes for a term. At the moment the best course of action is to manually select a more generic term. We are currently working on an extension to automatically suggest more general terms if one of these terms is entered. At the moment we don’t support searching using the synonym names of HPO terms, this will be resolved in a future version.</span></li><br />
                              <li><span style={textsize}><i>My favorite candidate gene for patient is found back in the top of the results?</i> <br />
                              Gene expression patterns are not informative for all genes. If an expected gene is not found back this is the most likely explanation.</span></li>
                            </ul>

                            
                        </div>

                        </div>
                    </div>

                </DocumentTitle>
        )
    }
})

module.exports = DiagnosisMain
