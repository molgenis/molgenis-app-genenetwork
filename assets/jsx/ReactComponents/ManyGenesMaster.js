var _ = require('lodash')
var React = require('react')
var Router = require('react-router')
var DocumentTitle = require('react-document-title')
var Cookies = require('cookies-js')

var Network = require('./Network')
//var NetworkMenu = require('./NetworkMenu')
//var NetworkInfo = require('./NetworkInfo')

var ManyGenesMaster = React.createClass({

    mixins: [Router.State, Router.Navigation],

    loadData: function() {
        var ids = this.props.params.ids.replace(/(\r\n|\n|\r)/g, ',')
        console.log('loading', this.props.params)
        this.setState({data: null})
        var data = {
            format: 'network',
            genes: ids,
        }
        $.ajax({
            url: window.GN.urls.coregulation,
            method: 'POST',
            data: data,
            dataType: 'json',
            success: function(data) {
                this.setState({
                    data: data,
                    error: null
                })
            }.bind(this),
            error: function(xhr, status, err) {
                if (err === 'Not Found') {
                    this.setState({
                        data: null,
                        error: ids + ' not found',
                        errorTitle: xhr.status
                    })
                } else {
                    this.setState({
                        data: null,
                        error: 'Something is wrong, please try again later. Error: ' + err,
                        errorTitle: xhr.status
                    })
                }
            }.bind(this)
        })
    },

    getInitialState: function() {
        return {
            activeGroup: 0,
            activeTab: 1,
            activeMenuTab: 1
        }
    },

    componentDidMount: function() {
        //console.log('"Many" mounted')
        this.loadData()
    },

    componentWillReceiveProps: function() {
        //console.log('"Many" will receive props')
        this.loadData()
    },

    shouldComponentUpdate: function(nextProps, nextState) {
	return nextState != this.state
    },

    handleRemoveGroup: function(groupIndex) {
	var newData = this.refs.network.removeGroup(groupIndex)
    	this.refs.network.refresh()
    	var amt = this.state.activeMenuTab - 1
    	if (this.state.activeMenuTab === -1) {
    	    amt = _.size(this.state.data.elements.groups)
    	}
    	if (amt === 2 && this.state.data.elements.groups[-1] && this.state.data.elements.groups[-1].length === 0) {
    	    amt = 1
    	}
        this.setState({data: newData, activeMenuTab: amt, activeGroup: 0})
    },

    handleHotNet: function(groupIndex) {
        var newData = this.refs.network.hotnet(0.5, 0.2)
        this.refs.network.refresh()
        this.setState({data: newData})
    },

    //TODO move to Network.js
    handleThresholdChange: function(newThreshold) {
        return
        var scaledThreshold = Math.round(10 * newThreshold * (this.state.data.edgeValueScales[0][2] - this.state.data.edgeValueScales[0][0]) - this.state.data.edgeValueScales[0][0]) / 10
        //var scaledThreshold = Math.round(10 * newThreshold * (this.state.data.edgeValueScale[2] - this.state.data.edgeValueScale[1]) - this.state.data.edgeValueScale[1]) / 10
        if (scaledThreshold != this.state.data.threshold) {
            //console.log('threshold change to', newThreshold, 'scaled', scaledThreshold)
            var oldThreshold = this.state.data.threshold
            this.state.data.threshold = scaledThreshold
            this.setState({data: this.state.data})
            this.refs.network.changeThreshold(scaledThreshold, oldThreshold)
        }
    },

    render: function() {
        // console.log('"Many" rendering, state:', this.state)
        if (this.state.error) {
            return (
		    <DocumentTitle title={this.state.errorTitle + GN.pageTitleSuffix}>
                    <div>
                    <span> {this.state.error} </span>
                    </div>
		    </DocumentTitle>
            )
        } else {//if (this.state.data) {
            // console.log('data received')
            if (this.props.params.ids) {
                // kludge - textarea value doesn't always update if genes are appended to the url
                $('#manytextarea').val(this.props.params.ids)
            }
            var title = this.state.data ? this.state.data.elements.nodes.length + ' genes - network' + GN.pageTitleSuffix : 'Loading' + GN.pageTitleSuffix
            return (
		    <DocumentTitle title={title}>
                    <Network
                data={this.state.data}
                selectedGene={this.state.selectedGene}
                activeGroup={this.state.activeGroup}
                onThresholdChange={this.handleThresholdChange}
                coloring={this.state.networkColoring}
                onColoring={this.handleColoring}
                ref='network' />
                    </DocumentTitle>
            )
        }
    }
})

module.exports = ManyGenesMaster
