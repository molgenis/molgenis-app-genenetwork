'use strict'

var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var Select = require('react-select')
var color = require('../../js/color.js')
var Link = Router.Link

var DiagnosisMain = React.createClass({

    mixins: [Router.History],

    onClick: function(){
        var form = document.getElementById('gn-diagnosis-continue')
        var terms = form['terms'].value.trim().replace(/ /g, ',')
        window.location = GN.urls.diagnosisPage + terms
    },


    render: function() {

        var content = null
        // console.log(this.state)
        console.log(this.props)
        
        return (
                <div>
                <div className='searchcontainer'>
                    <div className='searchheader noselect defaultcursor' style={{textAlign: 'center', padding: '30px'}}>
                Discover disease genes for your patients.
                    </div>
                
                </div>
                <div style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '20px'}}>
                    <div style={{textAlign: 'center'}}>
                        Enter your HPO terms:
                        <form id='gn-diagnosis-continue' style={{padding: '20px', resize: 'none'}} method='post' >
                            <textarea id='terms' style={{width: '300px', height: '150px'}} ></textarea>
                        </form>
                        <div className='button clickable noselect' onClick={this.onClick} >Continue</div>
                    </div>
                </div>
                </div>
            )
    }
})

module.exports = DiagnosisMain
