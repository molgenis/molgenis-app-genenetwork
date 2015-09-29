var _ = require('lodash')
var React = require('react')
var Disetti = require('./Disetti.js')
var SVGCollection = require('./SVGCollection')
var color = require('../../js/color')

var ListPanel = React.createClass({

    getInitialState: function() {
        return {
            showType: 'name'
        }
    },
    
    propTypes: {
        geneIds: React.PropTypes.array.isRequired,
        hashNodes: React.PropTypes.object.isRequired
    },

    changeShowType: function(type) {
        this.setState({
            showType: type
        })
    },

    download: function() {
        window.alert('todo')
        // var form = document.getElementById('genenameform')
        // form['data'].value = JSON.stringify(this.props.gpResults)
        // form['name'].value = this.props.group.name
        // form['genes'].value = JSON.stringify(this.props.group.nodes)
        // form.submit()
    },
    
    render: function() {

        var that = this
        // TODO too inefficient for long lists
        var rows = _.map(this.props.geneIds, function(id, i) {
            var gene = that.props.hashNodes[id].data
            return (
                    <tr key={id}>
                    <td>
                    <SVGCollection.SquareSVG size={12} biotype={gene.biotype} />
                    </td>
                    <td className={(i++ % 2 === 0) ? 'evenrow fullwidth' : 'oddrow fullwidth'}>
                    <a className={'select externallink nodecoration black'} href={GN.urls.genePage + gene.name} target='_blank'>
                    {that.state.showType == 'name' ? gene.name : id}
                    </a>
                    </td>
                    </tr>
            )
        })

	return (
                <div id='listpanel' className='networkleftpanel scrollable' style={{maxHeight: this.props.maxHeight || '25vh', marginBottom: '0px'}}>
                <div style={{position: 'absolute', padding: '0px 10px 0 0', top: '0px', right: '0px'}}>
                <div title='Download these results'>
                <Disetti onClick={this.download} />
                </div>
                </div>
                <div style={{display: 'inline-block', paddingBottom: '10px'}}>
                <div className={this.state.showType == 'name' ? 'clickable smallbutton selectedbutton' : 'clickable smallbutton'} style={{display: 'inline-block'}} onClick={this.changeShowType.bind(null, 'name')}>
                Name
            </div>
                <div className={this.state.showType == 'id' ? 'clickable smallbutton selectedbutton' : 'clickable smallbutton'} style={{display: 'inline-block'}} onClick={this.changeShowType.bind(null, 'id')}>
                ENSG
            </div>
                </div>
                <table className='listtable'>
                <tbody>
                {rows}
            </tbody>
                </table>
            </div>
	)
    }
})

module.exports = ListPanel
