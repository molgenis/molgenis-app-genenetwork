'use strict'

var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Select = require('react-select')
var color = require('../../js/color.js')

var DiagnosisMain = React.createClass({

    mixins: [Router.History],

    // DiagnosisMain is stateless
    // Selected terms are stored in the state of DiagnoseButton instead
    // because re-rendering DiagnosisMain would cause the Select component to lose its selections
    onSelectChange: function(value, options) {

        this.refs.diagnosebutton.setState({
            selectedTerms: _.map(options, function(opt) { return opt.id }),
            error: null
        })
    },

    componentDidMount: function() {

        this.refs.select.focus()
    },

    getPhenotypeSuggestions: function(input, callback) {

        if (!input || input.length < 2) {
            return callback(null, {})
        }
        
        var ts = Date.now()

        io.socket.get(GN.urls.diagnosisSuggest,
                      {
                          q: input
                      },
                      function(res, jwres) {
                          if (jwres.statusCode === 404) {
                              callback(null, {options: [], complete: false})
                          }
                      })
        
        io.socket.on('suggestions', function(res) {

            var options = _.map(res, function(o) {
                return {id: o._source.id, value: o._source.name, label: o._source.name}
            })
            
            callback(null, {options: options, complete: false})
            // console.debug('%d ms socket suggest: %d options', new Date() - ts, res.length)
        })
    },

    diagnose: function() {

        if (this.refs.diagnosebutton.state.selectedTerms.length === 0) {
            this.refs.diagnosebutton.setState({
                error: 'Please enter phenotypes above first'
            })
        } else {
            this.history.pushState(null, `/diagnosis/${this.refs.diagnosebutton.state.selectedTerms.join(',')}`)
        }
    },

    render: function() {

        return (
                <div className='searchcontainer'>
                <div className='searchheader noselect defaultcursor'>
                Discover disease genes for your patients.
                </div>
                <div className='selectcontainer'>
                <Select
            ref='select'
            name='search'
            matchPos='any'
            matchProp='label'
            multi={true}
            placeholder='Search for phenotypes here'
            searchPromptText=''
            autoload={false}
            asyncOptions={this.getPhenotypeSuggestions}
            onChange={this.onSelectChange} />
                </div>
                <DiagnoseButton ref='diagnosebutton' onDiagnose={this.diagnose} />
                </div>)
    }
})

var DiagnoseButton = React.createClass({

    getInitialState: function() {

        return {
            error: null,
            selectedTerms: [],
            buttonClasses: ['button', 'inversebutton', 'noselect', 'clickable', 'disabledbutton', 'flex00']
        }
    },

    onKeyPress: function(e) {
        if (e.key.toLowerCase() === 'enter') {
            this.props.onDiagnose()
        }
    },
    
    render: function() {
        
        return (
                <div className='hflex'>
                <div tabIndex={0} className={this.state.buttonClasses.join(' ')} onClick={this.props.onDiagnose} onKeyPress={this.onKeyPress} style={{margin: '20px'}}>
                DIAGNOSE
            </div>
                <div className='flex11 flexselfcenter' style={{color: color.colors.gnyellow}}>{this.state.error}</div>
                </div>
        )
    }
})

module.exports = DiagnosisMain
