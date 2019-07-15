'use strict'

var React = require('react')

var UploadPanel = createReactClass({

    propTypes: {
        
        //onClick: PropTypes.func.isRequired,
        text: PropTypes.string,
    },
    
    render: function() {
        
        return (
            
                <div id='uploadpanel' className='clickable button noselect' style={{position: 'relative', width: '100%'}} onClick={this.props.onClick}>
                    <div style={{position: 'absolute', top: '0px', left: '0px', height: '100%', padding: '0 8px 0 8px', backgroundColor: 'rgb(255,225,0)'}}>
                    <svg viewBox='0 0 100 100' width='20' height='20' className='arrow'>
                        <polyline points='10,50 50,0 90,50' />
                        <line x1='50' y1='0' x2='50' y2='100' />
                    </svg>
                    </div>
                    <span style={{paddingLeft: '35px'}}>{this.props.text || 'UPLOAD'}</span>
                </div>
        )
    }

})

module.exports = UploadPanel
