'use strict'

var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Select = require('react-select')
var color = require('../../js/color.js')

var DiagnosisMain = React.createClass({

    mixins: [Router.History],

    getInitialState: function() {
        return {}
    },
    
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
        this.addFileListener()
    },

    // getPhenotypeSuggestions: function(input, callback) {

    //     if (!input || input.length < 2) {
    //         return callback(null, {})
    //     }
        
    //     var ts = Date.now()

    //     io.socket.get(GN.urls.diagnosisSuggest,
    //                   {
    //                       q: input
    //                   },
    //                   function(res, jwres) {
    //                       if (jwres.statusCode === 404) {
    //                           callback(null, {options: [], complete: false})
    //                       }
    //                   })
        
    //     io.socket.on('suggestions', function(res) {

    //         var options = _.map(res, function(o) {
    //             return {id: o._source.id, value: o._source.name, label: o._source.name}
    //         })
            
    //         callback(null, {options: options, complete: false})
    //         // console.debug('%d ms socket suggest: %d options', new Date() - ts, res.length)
    //     })
    // },

    // http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
    addFileListener: function() {
 
        var input = document.getElementById('vcffile')
        var label = input.nextElementSibling
        var labelVal = label.innerHTML

        input.addEventListener('change', function(e) {
            
            var fileName = ''
            
            if (input.files && input.files.length > 1) {
                fileName = (input.getAttribute('data-multiple-caption') || '').replace('{count}', input.files.length)
            } else {
                fileName = e.target.value.split('\\').pop()
            }
            
            if (fileName) {
                label.innerHTML = fileName
            } else {
                label.innerHTML = labelVal
            }

            this.setState({
                fileSelected: true
            })
            
        }.bind(this))
    },
    
    uploadVCF: function() {

    },

    vcfSelectionDone: function() {

        // if file selected, upload/download it
        if (this.state.fileSelected) {
            var form = document.getElementById('gn-diagnosis-vcfform')
            form.submit()
            this.setState({
                isDownloading: true
            })
        }
        
        this.setState({
            vcfSelectionDone: true
        })
        
        console.log('continue to phenotype selection')
    },

    render: function() {

        var content = null
        
        if (!this.state.fileSelected) {
            content =
                <div>
                <div style={{color: color.colors.gnyellow}}>OR</div>
                <ContinueButton ref='continuebutton' text="I DON'T HAVE A VCF FILE" onClick={this.vcfSelectionDone} />
                </div>
        } else {
            content =
                <div>
                <ContinueButton ref='continuebutton' text='CONTINUE' onClick={this.vcfSelectionDone} />
                </div>
        }

        return (
                <div className='searchcontainer'>
                <div className='searchheader noselect defaultcursor' style={{textAlign: 'center'}}>
                Discover disease genes for your patients.
                </div>
                <div style={{textAlign: 'center'}}>
                <form id='gn-diagnosis-vcfform' method='post' encType='multipart/form-data' action={GN.urls.diagnosisVCF}>
                <input id='vcffile' name='vcffile' type='file' className='vcffileinput' />
                <label htmlFor='vcffile' className='button inversebutton noselect clickable' style={{margin: '20px'}}>
                UPLOAD A VCF FILE
            </label>
                </form>
                {content}
                </div>
                </div>)
    }
})

var ContinueButton = React.createClass({

    getInitialState: function() {

        return {
            error: null,
            selectedTerms: [],
            buttonClasses: ['button', 'inversebutton', 'noselect', 'clickable', 'disabledbutton', 'flex00']
        }
    },

    onKeyPress: function(e) {
        if (e.key.toLowerCase() === 'enter') {
            this.props.onClick()
        }
    },
    
    render: function() {
        
        return (
                <div className='hflex' style={{display: 'inline-block'}}>
                <div tabIndex={0} className={this.state.buttonClasses.join(' ')} onClick={this.props.onClick} onKeyPress={this.onKeyPress} style={{margin: '20px'}}>
                {this.props.text}
            </div>
                <div className='flex11 flexselfcenter' style={{color: color.colors.gnyellow}}>{this.state.error}</div>
                </div>
        )
    }
})

var UploadButton = React.createClass({

    getInitialState: function() {

        return {
            error: null,
            selectedTerms: [],
            buttonClasses: ['button', 'inversebutton', 'noselect', 'clickable', 'disabledbutton', 'flex00']
        }
    },

    onKeyPress: function(e) {
        if (e.key.toLowerCase() === 'enter') {
            this.props.onClick()
        }
    },
    
    render: function() {
        
        return (
                <div className='hflex' style={{display: 'inline-block'}}>
                <div tabIndex={0} className={this.state.buttonClasses.join(' ')} onClick={this.props.onClick} onKeyPress={this.onKeyPress} style={{margin: '20px'}}>
                UPLOAD A VCF FILE
            </div>
                <div className='flex11 flexselfcenter' style={{color: color.colors.gnyellow}}>{this.state.error}</div>
                </div>
        )
    }
})

module.exports = DiagnosisMain
