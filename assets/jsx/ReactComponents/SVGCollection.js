var _ = require('lodash')
var React = require('react')
var Chr = require('../../js/chr')
var htmlutil = require('../htmlutil.js')
var color = require('../../js/color.js')
var exp = {}

exp.X = React.createClass({

    propTypes: {
        size: React.PropTypes.number.isRequired
    },
    
    render : function() {
        return (
                <svg viewBox='0 0 24 24' width={this.props.size} height={this.props.size} strokeWidth={4}>
                <line x1='2' y1='2' x2='22' y2='22' />
                <line x1='22' y1='2' x2='2' y2='22' />
                </svg>
        )
    }
})

exp.SquareSVG = React.createClass({

    propTypes: {
        size: React.PropTypes.number.isRequired,
        biotype: React.PropTypes.string,
        color: React.PropTypes.string,
        padding: React.PropTypes.string
    },
    
    render : function() {
        var clr = this.props.color || (this.props.biotype && color.biotype2color[this.props.biotype]) || color.colors.gnblack
        return (
                <div style={{float: 'left', padding: this.props.padding || '2px 2px 0 0'}}>
                <svg viewBox='0 0 10 10' width={this.props.size} height={this.props.size}>
                <rect x1='0' y1='0' width='10' height='10' style={{fill: clr}} />
                </svg>
                </div>
        )
    }
})

exp.Download = React.createClass({
    propTypes: {
        text: React.PropTypes.string,
        size: React.PropTypes.number
    },
    render: function() {
        return (
                <svg fill='none' width={this.props.size || 28} height={this.props.size || 28} viewBox='0 0 100 100' strokeWidth='6' stroke='#4d4d4d' style={{cursor: 'pointer'}}>
                <text x='10' y='40' fill ='#4d4d4d' style={{fontSize: '3em'}} strokeWidth='4'>{this.props.text}</text>
                <polyline points='25,72 50,98 75,72' />
                <line x1='50' y1='50' x2='50' y2='100' />
                </svg>
        )
    }
})

exp.Plus = React.createClass({
    render: function() {
        return (
                <svg fill='4d4d4d' width='28' height='28' viewBox='0 0 24 24' strokeWidth='2' stroke='#4d4d4d'>
                <line x1='12' x2='12' y1='3' y2='21' />
                <line x1='3' x2='21' y1='12' y2='12' />
                </svg>
        )
    }
})

exp.Minus = React.createClass({
    render: function() {
        return (
                <svg fill='4d4d4d' width='28' height='28' viewBox='0 0 24 24' strokeWidth='2' stroke='#4d4d4d'>
                <line x1='3' x2='21' y1='12' y2='12' />
                </svg>
        )
    }
})

exp.Move = React.createClass({
    // https://www.google.com/design/icons/
    render: function() {
        return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="#4d4d4d" height="28" viewBox="0 0 24 24" width="28">
                <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
        )
    }
})

exp.Hand = React.createClass({
    
    render: function() {
        return (
                <svg height='36' width = '36' viewBox='0 0 300 300'>
                <path style={{fill:'none', fillRule:'evenodd', stroke:'#000000', strokeWidth:'7.5', strokeLinecap:'butt', strokeLinejoin:'miter', strokeMiterlimit:'4', strokeDasharray:'none', strokeOpacity:1}} d="M 155.66475,205.40012 C 162.29804,186.8186 184.02023,183.2838 200.1093,176.71493 C 214.86791,167.97579 225.48561,144.22372 246.93551,148.87873 C 257.42104,149.67278 270.65218,155.22101 263.60925,170.45861 C 242.65503,180.13389 236.41826,197.78511 220.96681,209.34493 C 208.75081,225.63782 199.41313,245.73169 180.08046,254.96632 C 168.5305,260.58598 155.61581,271.06227 159.46703,285.46537 C 163.81526,302.83559 145.26883,301.48405 134.16765,305.075 C 124.82793,306.37898 115.53581,305.62481 106.27465,304.28886 C 97.013492,302.9529 87.783287,301.03516 78.567389,300.01198 C 60.403329,292.95427 80.076399,271.2916 66.548699,260.89913 C 54.058629,250.28831 46.740169,233.10105 44.662149,217.27493 C 41.159419,201.65288 43.253559,187.8889 46.175509,172.2701 C 45.820579,152.18293 28.624989,137.40605 20.783949,121.39782 C 12.331184,105.60719 1.8726552,88.953055 5.2691996,72.694558 C 13.899079,57.256918 28.393725,72.589302 35.345795,81.990552 C 44.412135,94.673242 57.054439,117.22761 71.388049,131.97772 C 84.893279,135.8026 72.463829,117.0155 70.714059,108.55962 C 63.339543,84.702532 57.678489,65.903928 55.192939,46.063408 C 54.432139,30.181408 71.480609,18.169858 80.656439,34.307338 C 88.993565,54.437748 92.210335,77.110478 99.695385,99.221193 C 103.80077,107.55448 103.79039,119.75478 113.35538,122.45524 C 124.29964,123.96397 118.01258,84.810088 115.93524,65.165308 C 114.06143,49.440538 107.65961,15.700488 122.27625,5.4471909 C 140.86642,-2.6608651 146.49028,16.275868 148.23513,40.771738 C 149.76238,60.962948 150.09066,80.549668 150.30593,98.388908 C 152.16583,111.0501 152.89182,131.73698 161.92993,114.29675 C 166.50619,102.30624 169.5236,87.357158 175.25437,68.885248 C 179.53377,46.618638 186.29739,35.341908 200.20226,43.927318 C 211.91729,55.713348 204.24927,77.777708 200.42034,93.052488 C 196.02693,112.4188 188.86438,132.50474 184.63462,150.45798 C 183.29467,160.27456 183.0596,171.03998 188.53624,179.74432" />
                </svg>
        )
    }
})

exp.ZoomIn = React.createClass({
    // https://www.google.com/design/icons/
    render: function() {
        return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="36" viewBox="0 0 24 24" width="36">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                </svg>
        )
    }
}),

exp.ZoomOut = React.createClass({
    // https://www.google.com/design/icons/
    render: function() {
        return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="36" viewBox="0 0 24 24" width="36">
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
                </svg>
        )
    }
}),

exp.Crop = React.createClass({
    // https://www.google.com/design/icons/
    render: function() {
        return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="#4d4d4d" height="28" viewBox="0 0 24 24" width="28">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/>
                </svg>
        )
    }
})

exp.Rectangle = React.createClass({
    render: function() {
            return (
                    <div className={this.props.className} title={this.props.title}>
                    <svg viewBox='0 0 16 16' width='12' height='12' >
                    <rect x='0' y='0' width='16' height='16' style={{strokeWidth: 0, fill: this.props.fill}} shapeRendering='crispEdges' />
                    </svg>
                    </div>
            )
    }
})

exp.TriangleUp = React.createClass({
    render: function() {
        return (
                <div className={this.props.className} style={this.props.divStyle}>
                <svg style={this.props.svgStyle} viewBox='0 0 16 16' width='14' height='14'>
                <polyline points='1,15 8,5 15,15' />
                </svg>
                </div>
        )
    }
})

exp.TriangleDown = React.createClass({
    render: function() {
        return (
                <div className={this.props.className} style={this.props.divStyle}>
                <svg viewBox='0 0 16 16' width='14' height='14'>
                <polyline points='1,6 8,15 15,6' />
                </svg>
                </div>
        )
    }
})

exp.Annotated = React.createClass({
    render: function() {
        return (
                <svg viewBox='0 0 16 16' width='16' height='16'>
                <polyline points='1,11 6,15 15,6' style={{strokeWidth: '2.5px', stroke: color.colors.gngreen, fill: 'none'}} />
                </svg>
        )
    }
})

exp.NotAnnotated = React.createClass({
    render: function() {
        return (
                <svg viewBox='0 0 16 16' width='16' height='16'>
                <polyline points='1,10 15,10' style={{strokeWidth: '2.5px', stroke: color.colors.gnred, fill: 'none'}} />
                </svg>
        )
    }
})

exp.NetworkIcon = React.createClass({
    render: function() {
        return (
                <svg viewBox='0 0 16 16' width='16' height='16' style={{stroke: color.colors.gndarkgray, strokeWidth: '1px', fill: 'none'}}>
                <polyline points='2,10 9,8 14,3' />
                <polyline points='14,14 9,8 7,14' />
                <circle cx='2' cy='10' r='1.5' style={{fill: color.colors.gndarkgray}}/>
                <circle cx='9' cy='8' r='1.5' style={{fill: color.colors.gnred, stroke: color.colors.gnred}}/>
                <circle cx='14' cy='3' r='1.5' style={{fill: color.colors.gndarkgray}}/>
                <circle cx='14' cy='14' r='1.5' style={{fill: color.colors.gndarkgray}}/>
                <circle cx='7' cy='14' r='1.5' style={{fill: color.colors.gndarkgray}}/>
                </svg>
        )
    }
})

exp.ListIcon = React.createClass({

    propTypes: {
        w: React.PropTypes.number.isRequired,
        h: React.PropTypes.number.isRequired,
        n: React.PropTypes.number,
        color: React.PropTypes.string
    },
    
    render: function() {
        return (
                <div style={{display: 'inline-block'}}>
                <svg viewBox='0 0 16 16' width={this.props.w} height={this.props.h} style={{shapeRendering: 'crispEdges', strokeWidth: 1, stroke: this.props.color || color.colors.gngray}}>
                <line x1='0' y1='2' x2='16' y2='2' />
                <line x1='0' y1='7' x2='16' y2='7' />
                {!this.props.n || this.props.n > 2 ?
                 (<line x1='0' y1='12' x2='16' y2='12' />) :
                 null}
            </svg>
                </div>
        )
    }
})

exp.Chromosome = React.createClass({

    propTypes: {
        chr: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]).isRequired,
        position: React.PropTypes.number
    },

    render: function() {

        if (!Chr.arms[this.props.chr]) {
            return null
        }

        var c = this.props.chr
        var w = 100 // Chr.arms[c][3] / Chr.arms[1][3] * 100
        var cm = (Chr.arms[c][1] + Chr.arms[c][2]) / 2 / Chr.arms[c][3] * 100
        var cm1 = cm - 4
        var cm2 = cm + 4
        
        var relPosition = this.props.position >= 0 && Math.round(this.props.position / Chr.arms[c][3] * 100)
        // TODO proper drawing if gene is next to centromere
        // if (relPosition === 49) relPosition = 48
        // if (relPosition === 50) relPosition = 51
        // var lineElem = null
        // if (relPosition === 48) {
        //     lineElem = (<path className='chrlinethin' d={'M' + cm1 + ',0 ' +
        //                                                  'C' + (cm1 + 5) + ',0 ' + (cm1 + 5) + ',16 ' + cm1 + ',16 ' +
        //                                                  'L' + cm1 + ',0'}
        //                 />)
        // } else if (relPosition === 51) {
        //     lineElem = (<path className='chrlinethin' d={'M' + cm2 + ',0 ' +
        //                                                  'C' + (cm2 - 5) + ',0 ' + (cm2 - 5) + ',16 ' + cm2 + ',16 ' +
        //                                                  'L' + cm2 + ',0'}
        //                 />)
        // } else {
        lineElem = (<line x1={relPosition} y1='0' x2={relPosition} y2='16' className='chrline' />)
        // }

        return (
                <div style={this.props.style || {}} title={this.props.start > 0 && this.props.stop > 0 && 'Gene length: ' + htmlutil.prettyNumber(this.props.stop - this.props.start + 1) + ' base pairs'}>
                <svg viewBox='-5 0 110 16' preserveAspectRatio='none' width={w || '100'} height={this.props.h || '12'}>
                <path className='chrpath' d={'M0,0 L' + cm1 + ',0 ' +
                                             'C' + (cm1 + 5) + ',0 ' + (cm2 - 5) + ',16 ' + cm2 + ',16 ' +
                                             'L100,16 ' +
                                             'C105,16 105,0 100,0 ' +
                                             'L' + cm2 +',0 ' +
                                             'C' + (cm2 - 5) + ',0 ' + (cm1 + 5) + ',16 ' + cm1 + ',16 ' +
                                             'L0,16 ' +
                                             'C-5,16 -5,0 0,0'
                                            }/>
                {this.props.chr == 6 ? (<rect x={Math.round(20*1000*1000 / Chr.arms[6][3] * 100)} y='0' width={Math.round(20*1000*1000 / Chr.arms[6][3] * 100)} height='16' className='hlarect' />) : null}
                {lineElem}
                </svg>
                </div>
        )
    }
})

exp.TranscriptBars = React.createClass({

    render: function() {
        var bars = _.map(this.props.values, function(value, i){
            return (
                    <g key={i}>
                        <title>{this.props.transcripts[i]}</title>
                        <rect style={{transform: 'translate(x,y)'}} fill={this.props.hoverItem === this.props.transcripts[i] ? color.colors.gndarkgray : this.props.selectedTranscript === this.props.transcripts[i] ? color.colors.gndarkgray : color.colors.gngray} width="5" height={value*16} y={20-(value*16)} x={(7*i)+14} onMouseOver={this.props.onMouseOver.bind(null, this.props.transcripts[i])} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onClick={this.props.onTranscriptBarClick.bind(null, this.props.transcripts[i])}></rect>
                    </g>
                )
        }.bind(this))

        var graph = this.props.showBars ? (
            <g>
                <g fill={color.colors.gndarkgray}>
                            {bars}
                            <line x1="14" y1="20" x2={(this.props.values.length*7)+9} y2="20" stroke={color.colors.gngray}/>
                        </g>
                        {this.props.showTranscriptBarArrows ? <g>
                            <polygon fill={this.props.endTranscriptbars === 'left' ? color.colors.gnlightgray : this.props.hoverItem === 'left' ? color.colors.gndarkgray : color.colors.gngray} onMouseOver={this.props.onMouseOver.bind(null, 'left')} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onClick={this.props.endTranscriptbars === 'left' ? undefined : this.props.onTranscriptArrowClick.bind(null, 'left')} points="0.9,14 7.7,10.1 7.7,18 " />
                            <polygon fill={this.props.endTranscriptbars === 'right' ? color.colors.gnlightgray : this.props.hoverItem === 'right' ? color.colors.gndarkgray : color.colors.gngray} onMouseOver={this.props.onMouseOver.bind(null, 'right')} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onClick={this.props.endTranscriptbars === 'right' ? undefined : this.props.onTranscriptArrowClick.bind(null, 'right')} points="95.1,14 88.3,18 88.3,10.1 "/>
                </g> : null}
            </g>
        ) : null

        return (
            <div style={{display: 'inline-block'}}>
                <svg width="150" height="20">
                    {graph}
                </svg>
            </div>
        )
    }
})

exp.I = React.createClass({

    propTypes: {
        title: React.PropTypes.string.isRequired
    },

    render: function() {
        return (
            <div style={{display: 'inline-block', position: 'relative', top: '5px'}}>
                <svg width="20" height="20" viewBox="0 0 22 22" style={{cursor: 'pointer'}}>
                    <g>
                        <title>{this.props.title}</title>
                        <circle fill={color.colors.gnlightgray} cx="9.8" cy="9.5" r="9.2"/>
                        <text fill={color.colors.gndarkgray} transform="matrix(1 0 0 1 7.761 14.583)">i</text>
                    </g>
                </svg>
            </div>
        )
    }
})

module.exports = exp
