var _ = require('lodash')
var React = require('react')
var TriangleDown = require('./SVGCollection').TriangleDown
var TriangleUp = require('./SVGCollection').TriangleUp
var color = require('../../js/color')

var OpenMenu = createReactClass({

    propTypes: {
        options: PropTypes.array,
        style: PropTypes.object,
        selected: PropTypes.string
    },
    
    getInitialState: function() {
        return {
            isExpanded: false
        }
    },
    
    onClick: function() {
        this.setState({
            isExpanded: !this.state.isExpanded
        })
    },

    onMouseLeave: function(e) {
        if (!e.currentTarget.getAttribute('data-openmenu')) {
            this.setState({
                isExpanded: false
            })
        }
    },
    
    render: function() {
        var that = this
        var text = 'bug'
        var cls = this.state.isExpanded ? '' : 'invisible'
        options = _.map(this.props.options, function(opt, i) {
            var className = 'dropupoption noselect'
            if (opt.key === that.props.selected) {
                text = opt.label
                className += ' selectedbutton'
            }
            var style = (i === that.props.options.length - 1) ? {borderBottom: '1px solid #dcdcdc'} : {}
            return (
                    <div data-openmenu='true' key={i} className={cls} style={style} onMouseLeave={that.onMouseLeave}>
                    <span data-openmenu='true' className={className} style={{display: 'block'}} onClick={that.props.onSelect.bind(null, opt.key)}>
                    {opt.label.toUpperCase().replace(/EXAC/, 'ExAC')}</span>
                    </div>
            )
        })
        
        return (
                <div className='dropup clickable noselect' style={this.props.style} onClick={this.onClick} onMouseLeave={this.onMouseLeave}>
                <div className='outer'>
                {options}
            </div>
                <div data-openmenu='true' style={{minWidth: '150px'}}><span>{text.toUpperCase()}</span>
                <TriangleUp data-openmenu='true' className='dropuptriangle' />
                </div>
                </div>
        )
    }
})

module.exports = OpenMenu
