var React = require('react')

var ProgressBar = React.createClass({

    componentDidMount: function() {
    },

    componentWillReceiveProps: function(nextProps) {
        //console.log(nextProps.initProgress, nextProps.layoutProgress)
        //this.forceUpdate()
    },
    
    render: function() {
 
        if (!this.props.done) {
            //console.log('render', this.props.initProgress, this.props.layoutProgress, this.props.centerY, this.props.centerX, this.props.w, this.props.h)
            //var date = new Date()
            //console.log(this.props.initProgress, date.getMilliseconds())
            return (
                    <div className='networkprogress' style={{top: this.props.centerY, left: this.props.centerX}}>
                    <svg viewBox='0 0 100 10' width={this.props.w} height={this.props.h}>
                    <rect x='0' y='0' width='100' height='10' style={{fill: '#dcdcdc'}} />
                    <rect x='0' y='0' width={this.props.initProgress / 2 || '0'} height='10' style={{fill: '#ff9999'}} />
                    <rect x='50' y='0' width={this.props.layoutProgress / 2 || '0'} height='10' style={{fill: '#999999'}} />
                    </svg>
                    </div>
            )
        } else {
            return null
        }
    }
})

module.exports = ProgressBar
