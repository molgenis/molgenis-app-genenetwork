var _ = require('lodash')
var React = require('react')

var Logo = React.createClass({

    propTypes: {
        w: React.PropTypes.number.isRequired,
        h: React.PropTypes.number.isRequired,
        style: React.PropTypes.object,
        progress: React.PropTypes.array,
        mirrored: React.PropTypes.bool,
    },
    
    componentDidMount: function() {
    },

    componentWillReceiveProps: function(nextProps) {
        //console.log(nextProps.initProgress, nextProps.layoutProgress)
        //this.forceUpdate()
    },
    
    render: function() {
        var strokes = ['#4d4d4d', '#4d4d4d', '#4d4d4d']
        if (this.props.progress) {
            strokes = ['#4d4d4d', '#4d4d4d', '#999999']
        }
        var x = [30, 5, 50, 26, 34, 50, 34, 20, 50, 22, 5, 22, 34, 5]
        var y = [3, 28, 72, 97, 12, 28, 44, 28, 28, 88, 72, 56, 72, 72]
        if (this.props.mirrored) {
            x = _.map(x, function(c) {
                return 55 - c
            })
        }
        return (
                <div style={this.props.style} title='Gene Network' >
                <svg viewBox='0 0 55 100' width={this.props.w} height={this.props.h} fill='none' strokeWidth={6}>
                    <g
                        id="g36"
                        transform="matrix(1.3333333,0,0,-1.3333333,0,264.444)"><g
                        id="g38" /><g
                        id="g40"><g
                        id="g42"
                        clip-path="url(#clipPath46)"><g
                        id="g48"
                        transform="translate(90.0036,173.2074)"><path
                        d="M 0,0 -11.496,-39.793"
                        style="fill:none;stroke:#8a8889;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path50" /></g><g
                        id="g52"
                        transform="translate(159.9997,101.6146)"><path
                        d="M 0,0 -26.506,2.685"
                        style="fill:none;stroke:#8a8889;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path54" /></g><g
                        id="g56"
                        transform="translate(156.7897,163.7874)"><path
                        d="M 0,0 -24.296,-30.373"
                        style="fill:none;stroke:#8a8889;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path58" /></g><g
                        id="g60"
                        transform="translate(46.2419,68.6234)"><path
                        d="M 0,0 14.072,20.158"
                        style="fill:none;stroke:#8a8889;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path62" /></g><g
                        id="g64"
                        transform="translate(42.028,140.974)"><path
                        d="M 0,0 17.308,-15.119"
                        style="fill:none;stroke:#8a8889;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path66" /></g><text
                        transform="matrix(1,0,0,-1,8.0601,25.335)"
                        style="font-variant:normal;font-weight:normal;font-size:24.2267px;font-family:'Lucida Grande';-inkscape-font-specification:LucidaGrande;writing-mode:lr-tb;fill:#8a8889;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="text70"><tspan
                        x="0 15.335501 21.852484 36.606544 51.16679 64.176529"
                        y="0"
                        id="tspan68">Kidney</tspan></text><text
                        transform="matrix(1,0,0,-1,84.39843,25.335)"
                        style="font-variant:normal;font-weight:bold;font-size:24.2267px;font-family:'Lucida Grande';-inkscape-font-specification:LucidaGrande-Bold;writing-mode:lr-tb;fill:#ce5961;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="text74"><tspan
                        x="0 18.145798 31.85811 41.18539 61.608498 76.604828 87.14344"
                        y="0"
                        id="tspan72">Network</tspan></text><g
                        id="g76"
                        transform="translate(78.5075,70.0326)"><path
                        d="M 0,0 C -10.02,6.176 -13.135,19.305 -6.959,29.324"
                        style="fill:none;stroke:#ffffff;stroke-width:4;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path78" /></g><path
                        d="m 166.5729,163.7874 c 0,-5.403 -4.38,-9.783 -9.783,-9.783 -5.403,0 -9.782,4.38 -9.782,9.783 0,5.403 4.379,9.783 9.782,9.783 5.403,0 9.783,-4.38 9.783,-9.783"
                        style="fill:#ce5961;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path80" /><path
                        d="m 51.8112,140.974 c 0,-5.403 -4.381,-9.783 -9.783,-9.783 -5.404,0 -9.783,4.38 -9.783,9.783 0,5.403 4.379,9.783 9.783,9.783 5.402,0 9.783,-4.38 9.783,-9.783"
                        style="fill:#ce5961;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path82" /><path
                        d="m 46.862,140.974 c 0,-2.67 -2.164,-4.834 -4.834,-4.834 -2.67,0 -4.834,2.164 -4.834,4.834 0,2.669 2.164,4.833 4.834,4.833 2.67,0 4.834,-2.164 4.834,-4.833"
                        style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path84" /><path
                        d="m 161.6237,163.7874 c 0,-2.669 -2.164,-4.834 -4.834,-4.834 -2.669,0 -4.833,2.165 -4.833,4.834 0,2.67 2.164,4.834 4.833,4.834 2.67,0 4.834,-2.164 4.834,-4.834"
                        style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path86" /><path
                        d="m 96.2135,173.2074 c 0,-3.43 -2.78,-6.21 -6.21,-6.21 -3.43,0 -6.21,2.78 -6.21,6.21 0,3.43 2.78,6.21 6.21,6.21 3.43,0 6.21,-2.78 6.21,-6.21"
                        style="fill:#8a8889;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path88" /><path
                        d="m 52.4518,68.6234 c 0,-3.43 -2.78,-6.21 -6.21,-6.21 -3.43,0 -6.21,2.78 -6.21,6.21 0,3.43 2.78,6.21 6.21,6.21 3.43,0 6.21,-2.78 6.21,-6.21"
                        style="fill:#8a8889;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path90" /><path
                        d="m 166.2096,101.6146 c 0,-3.43 -2.78,-6.21 -6.21,-6.21 -3.43,0 -6.21,2.78 -6.21,6.21 0,3.43 2.78,6.21 6.21,6.21 3.43,0 6.21,-2.78 6.21,-6.21"
                        style="fill:#ce5961;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path92" /><path
                        d="m 87.7546,57.3255 -10e-4,42.889 c 0,2.009 -0.644,2.654 -2.65,2.656 l -1.713,10e-4 c 0.119,-1.112 0.231,-2.163 0.464,-3.154 1.107,-4.719 0.315,-9.526 -2.229,-13.536 -2.46,-3.877 -6.29,-6.541 -10.786,-7.498 -1.226,-0.261 -2.455,-0.393 -3.655,-0.393 -4.411,0 -8.675,1.79 -12.674,5.32 -4.608,4.069 -7.414,9.558 -8.344,16.317 -1.912,13.904 2.046,26.039 11.763,36.066 4.314,4.453 9.339,7.186 14.933,8.122 1.422,0.238 2.807,0.358 4.119,0.358 5.374,0 9.85,-1.996 13.303,-5.932 5.933,-6.759 5.232,-17.105 -1.594,-23.551 -0.702,-0.663 -1.343,-1.397 -1.995,-2.174 0.442,-0.039 0.889,-0.092 1.338,-0.172 5.513,-0.97 9.689,-5.831 9.712,-11.305 0.045,-10.22 0.036,-20.609 0.028,-30.656 l -0.008,-11.562 c 0,-0.21 -0.036,-0.375 -0.061,-0.484 l -0.231,-1.219 -1.262,-0.093 z"
                        style="fill:#ce5961;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path94" /><path
                        d="m 76.9821,145.974 v 0 c -1.395,0 -2.863,-0.128 -4.366,-0.379 -5.918,-0.99 -11.222,-3.869 -15.765,-8.557 -10.054,-10.376 -14.148,-22.931 -12.17,-37.315 0.98,-7.126 3.953,-12.925 8.837,-17.237 4.281,-3.78 8.879,-5.696 13.667,-5.696 1.305,0 2.639,0.143 3.967,0.426 4.893,1.043 9.063,3.942 11.741,8.163 2.761,4.353 3.621,9.567 2.422,14.68 -0.098,0.416 -0.173,0.855 -0.237,1.312 h 0.024 c 0.641,-10e-4 0.928,-0.1 1.014,-0.138 0.038,-0.086 0.137,-0.375 0.137,-1.019 l 10e-4,-30.432 v -9.696 -1.26 -3 h 3 6.957 2.493 l 0.457,2.449 c 0.041,0.183 0.104,0.474 0.104,0.846 10e-4,3.831 0.004,7.662 0.008,11.493 0.009,10.071 0.018,20.485 -0.027,30.732 -0.025,5.736 -4.073,10.875 -9.616,12.468 0.03,0.029 0.06,0.057 0.09,0.085 7.416,7.005 8.159,18.263 1.693,25.632 -3.751,4.275 -8.607,6.443 -14.431,6.443 m 0,-3 c 4.635,0 8.811,-1.586 12.176,-5.421 5.408,-6.163 4.643,-15.672 -1.498,-21.473 -1.39,-1.312 -2.546,-2.871 -3.811,-4.316 l 0.252,-0.277 c 1.225,-0.101 2.467,-0.107 3.672,-0.319 4.7,-0.828 8.452,-5.073 8.474,-9.835 0.06,-14.071 0.02,-28.141 0.018,-42.212 0,-0.071 -0.024,-0.141 -0.054,-0.295 h -6.957 v 1.26 c 0,13.376 0.001,26.752 -10e-4,40.129 0,2.846 -1.308,4.153 -4.148,4.156 -0.38,0 -0.759,0 -1.155,0 -0.671,0 -1.391,0 -2.242,0 0.229,-1.73 0.311,-3.398 0.686,-4.997 2.049,-8.736 -3.198,-17.377 -11.867,-19.223 -1.147,-0.244 -2.26,-0.361 -3.342,-0.361 -4.388,0 -8.248,1.914 -11.682,4.945 -4.615,4.075 -7.03,9.429 -7.85,15.397 -1.842,13.392 1.924,25.087 11.353,34.818 3.867,3.99 8.546,6.756 14.105,7.686 1.319,0.221 2.612,0.338 3.871,0.338"
                        style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path96" /><path
                        d="m 97.9001,57.3099 v 42.854 c 0,7.261 4.646,12.254 11.665,12.695 -0.304,0.305 -0.648,0.572 -1.063,0.893 -0.404,0.311 -0.828,0.641 -1.275,1.048 -2.794,2.541 -4.622,5.689 -5.434,9.357 -1.026,4.632 -0.035,9.48 2.721,13.299 2.769,3.838 7.083,6.32 11.835,6.811 0.869,0.089 1.742,0.135 2.595,0.135 5.99,0 11.456,-2.135 16.71,-6.527 7.173,-5.995 11.776,-14.157 13.681,-24.257 1.46,-7.739 0.764,-14.939 -2.067,-21.402 -2.998,-6.843 -7.743,-11.27 -14.104,-13.158 -1.626,-0.481 -3.285,-0.727 -4.93,-0.727 -5.13,0 -9.934,2.347 -13.18,6.438 -3.3,4.159 -4.485,9.568 -3.254,14.842 0.203,0.865 0.31,1.767 0.424,2.723 l 0.066,0.54 c -0.368,0.004 -0.725,0.008 -1.077,0.008 -0.493,0 -0.973,-0.007 -1.453,-0.031 -1.022,-0.051 -1.791,-0.863 -1.829,-1.931 -0.028,-0.803 -0.022,-1.606 -0.015,-2.409 l 0.005,-1.048 -10e-4,-40.153 z"
                        style="fill:#8a8889;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path98" /><path
                        d="m 118.945,145.9017 c -0.904,0 -1.829,-0.048 -2.749,-0.143 -5.178,-0.534 -9.879,-3.24 -12.898,-7.425 -3.005,-4.165 -4.088,-9.451 -2.969,-14.502 0.871,-3.933 2.819,-7.314 5.792,-10.053 -5.893,-1.705 -9.721,-6.835 -9.721,-13.615 v -30.327 -9.705 -1.322 -3 h 3 7.02 3 v 3 1.145 11.789 l 0.001,25.72 c 0,0.354 -0.003,0.709 -0.006,1.064 -0.006,0.813 -0.012,1.581 0.015,2.338 0.008,0.233 0.137,0.474 0.405,0.487 0.234,0.012 0.483,0.02 0.757,0.025 -0.068,-0.498 -0.146,-0.975 -0.251,-1.426 -1.337,-5.722 -0.047,-11.595 3.539,-16.114 3.531,-4.453 8.763,-7.006 14.353,-7.006 1.791,0 3.594,0.265 5.358,0.789 6.804,2.019 11.868,6.727 15.051,13.993 2.954,6.745 3.684,14.242 2.167,22.282 -1.971,10.451 -6.746,18.906 -14.193,25.131 -5.458,4.562 -11.403,6.875 -17.671,6.875 m 0,-3 c 5.955,0 11.13,-2.318 15.747,-6.177 7.316,-6.116 11.422,-14.122 13.169,-23.385 1.322,-7.011 0.928,-13.914 -1.967,-20.522 -2.613,-5.965 -6.765,-10.425 -13.157,-12.321 -1.525,-0.453 -3.037,-0.665 -4.504,-0.665 -9.637,0 -17.372,9.161 -14.972,19.438 0.282,1.202 0.392,2.447 0.548,3.676 0.055,0.423 0.009,0.859 0.009,1.416 -0.929,0 -1.785,0.02 -2.612,0.02 -0.515,0 -1.018,-0.007 -1.521,-0.033 -1.802,-0.089 -3.188,-1.547 -3.253,-3.376 -0.042,-1.168 -0.011,-2.34 -0.011,-3.509 0,-12.503 -0.001,-25.006 -0.001,-37.509 v -1.145 H 99.4 v 1.322 40.032 c 0,6.766 4.419,11.213 11.156,11.227 0.327,0.001 0.656,1 1.175,1 -0.93,1.799 -2.096,2.245 -3.494,3.518 -2.564,2.333 -4.229,5.181 -4.98,8.572 -1.966,8.88 4.204,17.361 13.247,18.294 0.828,0.085 1.641,0.127 2.441,0.127"
                        style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"
                        id="path100" /><g
                        id="g102"
                        transform="translate(124.7106,126.9398)"><path
                        d="M 0,0 C -0.328,-8.143 -7.195,-14.477 -15.338,-14.148"
                        style="fill:none;stroke:#ffffff;stroke-width:2.77;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path104" /></g><g
                        id="g106"
                        transform="translate(124.7038,126.9383)"><path
                        d="M 0,0 C -0.328,-8.143 -7.195,-14.477 -15.338,-14.148"
                        style="fill:none;stroke:#ffffff;stroke-width:2.77;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path108" /></g><g
                        id="g110"
                        transform="translate(124.7028,126.8631)"><path
                        d="M 0,0 C -0.329,-8.143 -7.196,-14.478 -15.339,-14.149"
                        style="fill:none;stroke:#ffffff;stroke-width:2.77;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path112" /></g><g
                        id="g114"
                        transform="translate(109.3923,102.7274)"><path
                        d="M 0,0 C 8.016,1.47 15.705,-3.836 17.176,-11.852"
                        style="fill:none;stroke:#ffffff;stroke-width:2.77;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path116" /></g><g
                        id="g118"
                        transform="translate(109.3942,102.8451)"><path
                        d="M 0,0 C 8.016,1.47 15.705,-3.836 17.175,-11.852"
                        style="fill:none;stroke:#ffffff;stroke-width:2.77;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path120" /></g><g
                        id="g122"
                        transform="translate(66.6149,88.8236)"><path
                        d="M 0,0 C 0.329,8.143 7.196,14.477 15.339,14.148"
                        style="fill:none;stroke:#ffffff;stroke-width:2.77;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path124" /></g><g
                        id="g126"
                        transform="translate(86.235,112.9769)"><path
                        d="M 0,0 C -8.098,-0.915 -15.404,4.908 -16.319,13.005"
                        style="fill:none;stroke:#ffffff;stroke-width:2.77;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
                        id="path128" /></g></g></g></g>
                </svg>
                </div>
        )
        // return (
        //         <div style={this.props.style} title='Gene Network' >
        //         <svg viewBox='0 0 55 100' width={this.props.w} height={this.props.h} fill='none' strokeWidth={6}>
        //         <polyline points='30,3 5,28 50,72 26,97' style={{stroke: strokes[2]}} />
        //         <polyline points='34,12 50,28 34,44' style={{stroke: strokes[0]}} />
        //         <line x1='20' y1='28' x2='50' y2='28' style={{stroke: strokes[0]}} />
        //         <polyline points='22,88 5,72 22,56' style={{stroke: strokes[1]}} />
        //         <line x1='34' y1='72' x2='5' y2='72' style={{stroke: strokes[1]}} />
        //         </svg>
        //         </div>
        // )
    }
})

module.exports = Logo
