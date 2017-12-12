var _ = require('lodash')
var React = require('react')
var SVGCollection = require('./SVGCollection')
var color = require('../../js/color')

var GroupPanel = React.createClass({

    propTypes: {
        data: React.PropTypes.object.isRequired,
        activeGroup: React.PropTypes.object,
        coloring: React.PropTypes.string,
        isGeneListShown: React.PropTypes.bool,
        onGroupClick: React.PropTypes.func,
        onAnalyse: React.PropTypes.func
    },

    componentDidMount: function() {
    },

    download: function() {
        
        var form = document.getElementById('gn-network-groupform')
        form['genes'].value = JSON.stringify(_.map(this.props.data.elements.nodes, function(node) { return node.data.id }))
        form['groups'].value = JSON.stringify(this.props.data.elements.groups)
        form.submit()
    },
    
    render: function() {

        var elems = []
        var options = this.props.data.elements.groups

        for (var i = 0, ii = options.length; i < ii; i++) {
            group = options[i]
            var isActiveGroup = (group === this.props.activeGroup)
            var className = 'group clickable'
            var clr, title, listVisibility
            if (isActiveGroup) {
                clr = color.colors.textdefault
                title = ''
                listVisibility = 'visible'
            } else {
                clr = color.colors.gngray
                title = 'Select ' + group.name
                listVisibility = 'hidden'
            }
            
            elems.push(<tr key={group.name.toUpperCase()}>
                       <td title={title} className={className} style={{color: clr}} onClick={this.props.onGroupClick.bind(null, group)}>
                       {group.name.toUpperCase()}
                       </td>
                       <td className='verysmalldescription clickable' style={{textAlign: 'right', color: clr}}  onClick={this.props.onGroupClick.bind(null, group)}>
                       {group.nodes.length}
                       </td>
                       </tr>)
        }

        var geneStr = this.props.activeGroup.nodes.join(',')
        // Analyse {this.props.activeGroup.nodes.length} {this.props.activeGroup.nodes.length === 1 ? 'gene' : 'genes'}
        // {this.props.activeGroup.nodes.length === 1 ? <span style={{visibility: 'hidden'}}>s</span> : ''}
        return (
                <div id='grouppanel' className='networkleftpanel bordered smallpadding paddingbottom noshrink smallfont' style={this.props.style || {}}>
                <div id='downloadgroups' title='Download gene lists' style={{position: 'absolute', top: '16px', right: '6px'}} onClick={this.download}>
                <SVGCollection.Download text='TXT' size={24} />
                </div>
                <div style={{overflow: 'auto', maxHeight: (this.props.style && this.props.style.maxHeight - 60) || '100%'}}>
                <table style={{width: '100%', paddingRight: '32px'}}>
                <tbody>
                {elems}
            </tbody>
                </table>
                </div>
                <br/>
                {this.props.activeGroup.nodes.length > 4 ?
                 (<div title='Run pathway analysis and gene prediction' className='button clickable' onClick={this.props.onAnalyse.bind(null, this.props.activeGroup)}>
                  ANALYSE {this.props.activeGroup.name.toUpperCase()}
                  </div>) :
                 (<div title='At least five genes are needed for analysis' className='button disabled'>
                  ANALYSE {this.props.activeGroup.name.toUpperCase()}
                  </div>)}
                </div>
        )
    }
})

module.exports = GroupPanel

//                 <div style={{display: 'flex', flexFlow: 'row nowrap', alignItems: 'flex-start'}}>
