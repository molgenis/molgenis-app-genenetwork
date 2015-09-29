var React = require('react')
var SVGCollection =  require('./SVGCollection')
var color = require('../../js/color')

var NetworkControlPanel = React.createClass({

    propTypes: {
        onSelectionModeChange: React.PropTypes.func.isRequired,
        download: React.PropTypes.func.isRequired,
        selectionMode: React.PropTypes.string.isRequired,
        onZoom: React.PropTypes.func,
        isZoomedMax: React.PropTypes.bool,
        isZoomedMin: React.PropTypes.bool
    },

    render: function() {
        
        var zoomInStyle = {padding: '10px', borderBottom: '1px solid #dcdcdc'}
        if (this.props.isZoomedMax) zoomInStyle.backgroundColor = '#f5f5f5'
        var zoomOutStyle = {padding: '10px', borderBottom: '1px solid #dcdcdc'}
        if (this.props.isZoomedMin) zoomOutStyle.backgroundColor = '#f5f5f5'

        var selectIconStyles = [{padding: '10px'}, {backgroundColor: color.colors.gnyellow, padding: '10px'}]
        if (this.props.selectionMode === 'move') {
            selectIconStyles.reverse()
        }
        selectIconStyles[0].borderBottom = '1px solid #dcdcdc'
        
        return (
                <div className='gn-network-controlpanel' style={{display: 'inline-block',
                                                                 position: 'absolute',
                                                                 top: '0px',
                                                                 left: '0px',
                                                                 padding: '10px 0 0 10px',
                                                                 zIndex: 1,
                                                                 backgroundColor: color.colors.gnwhite,
                                                                 opacity: 0.95}}>
                <div className='gn-network-controlpanel-group bordered'>
                <div className='gn-network-controlpanel-control clickable' style={zoomInStyle} onClick={this.props.isZoomedMax ? null : this.props.onZoom.bind(null, 1.5)}>
                <SVGCollection.Plus />
                </div>
                <div className='gn-network-controlpanel-control clickable' style={zoomOutStyle} onClick={this.props.isZoomedMin ? null : this.props.onZoom.bind(null, 1/1.5)}>
                <SVGCollection.Minus />
                </div>
                </div>
                <div className='gn-network-controlpanel-group bordered' style={{marginTop: '10px'}}>
                <div style={selectIconStyles[0]} className='gn-network-controlpanel-selectionmode clickable' onClick={this.props.onSelectionModeChange.bind(null, 'move')}>
                <SVGCollection.Move />
                </div>
                <div style={selectIconStyles[1]} className='gn-network-controlpanel-selectionmode clickable' onClick={this.props.onSelectionModeChange.bind(null, 'select')}>
                <SVGCollection.Crop />
                </div>
                </div>
                <div className='gn-network-controlpanel-group bordered' style={{marginTop: '10px'}}>
                <div className='gn-network-controlpanel-control clickable noselect' style={{padding: '10px', borderBottom: '1px solid #dcdcdc'}} onClick={this.props.download.bind(null, 'pdf')}>
                <SVGCollection.Download text='PDF' />
                </div>
                <div className='gn-network-controlpanel-control clickable noselect' style={{padding: '10px'}} onClick={this.props.download.bind(null, 'png')}>
                <SVGCollection.Download text ='PNG' />
                </div>
                </div>
                </div>
        )
    }
})

module.exports = NetworkControlPanel
