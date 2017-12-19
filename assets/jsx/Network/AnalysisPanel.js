var React = require('react')
var PredictedGenesPanel = require('../ReactComponents/PredictedGenesPanel')
var PWAPanel = require('../ReactComponents/PWAPanel')
var SVGCollection = require('../ReactComponents/SVGCollection')
var color = require('../../js/color.js')
var DownloadPanel = require('../ReactComponents/DownloadPanel');

var AnalysisPanel = React.createClass({

    propTypes: {

        analysisGroup: React.PropTypes.object.isRequired,
        coloring: React.PropTypes.string.isRequired,
        onClose: React.PropTypes.func.isRequired,
        onTermSelect: React.PropTypes.func.isRequired,
        onGeneAdd: React.PropTypes.func.isRequired,
        onGeneRemove: React.PropTypes.func.isRequired,
        addedGenes: React.PropTypes.array.isRequired,

        selectedTerm: React.PropTypes.object,
        termColoring: React.PropTypes.string,
    },

    getInitialState: function() {
        return {
            activeTab: 0
        }
    },
    
    componentDidMount: function() {
        console.log('analysis group')
        console.log(this.props.analysisGroup)
        if (this.refs.pwa.pwaRequest(this.props.analysisGroup)) {
            this.refs.pred.gpRequest(this.props.analysisGroup)
        }
    },

    componentWillReceiveProps: function(newProps) {
        if (newProps.analysisGroup !== this.props.analysisGroup) {
            if (this.refs.pwa.pwaRequest(newProps.analysisGroup)) {
                this.refs.pred.gpRequest(newProps.analysisGroup)
            }
        }
    },

    onTabSelect: function(index) {
        this.setState({
            activeTab: index
        })
    },

    onPWAStart: function() {
        this.setState({
            pwaDownloadable: false
        })
    },

    onPWAFinish: function() {
        this.setState({
            pwaDownloadable: true
        })
    },

    onPredStart: function() {
        this.setState({
            predDownloadable: false
        })
    },

    onPredFinish: function() {
        this.setState({
            predDownloadable: true
        })
    },

    render: function() {

        var d3fd = {getNodeById: function() { return null }}
        var styles = [
            // {position: 'relative', height: '100%', overflow: 'hidden', backgroundColor: color.colors.gnwhite},//, position: 'relative'},
            // {position: 'relative', height: '100%', overflow: 'hidden', backgroundColor: color.colors.gnwhite, display: 'none'}//, position: 'relative'}
            {position: 'relative', backgroundColor: color.colors.gnwhite},
            {position: 'relative', backgroundColor: color.colors.gnwhite, display: 'none'}
        ]
        var classNames = ['button selectedbutton clickable', 'button clickable']
        if (this.state.activeTab === 1) {
            styles.reverse()
            classNames.reverse()
        }

        return (
                <div className='analysispanel bordered vflex' style={this.props.style}>
                <div className='flex00'>
                <div className={classNames[0]} onClick={this.onTabSelect.bind(null, 0)}>PATHWAYS & PHENOTYPES</div>
                <div className={classNames[1]} onClick={this.onTabSelect.bind(null, 1)}>GENES</div>
                <div style={{float: 'right', display: 'inline-block'}}>
                <div style={{display: 'inline-block'}}>
                {this.state.activeTab === 0 && this.state.pwaDownloadable ? <DownloadButton comp={this.refs.pwa} /> : null}
                {this.state.activeTab === 1 && this.state.predDownloadable ? <DownloadButton comp={this.refs.pred} /> : null}
            </div>
                <div className='clickable xbutton' style={{display: 'inline-block', margin: '0 10px', verticalAlign: 'top'}} onClick={this.props.onClose}>
                <SVGCollection.X size={12} />
                </div>
                </div>
                </div>
                <PWAPanel
            ref='pwa'
            style={styles[0]}
            maxTableHeight={(this.props.style.maxHeight && (this.props.style.maxHeight - 120) + 'px') || '100%'}
            selectedTerm={this.props.selectedTerm}
            group={this.props.analysisGroup}
            termColoring={this.props.termColoring}
            areNodesColoredByTerm={this.props.coloring == 'term'}
            onPWAStart={this.onPWAStart}
            onPWAFinish={this.onPWAFinish}
            onTermClick={this.props.onTermSelect} />
                <PredictedGenesPanel
            ref='pred'
            style={styles[1]}
            group={this.props.analysisGroup}
            onPredStart={this.onPredStart}
            onPredFinish={this.onPredFinish}
            onGeneAdd={this.props.onGeneAdd}
            onGeneRemove={this.props.onGeneRemove}
            addedGenes={this.props.addedGenes}
            d3fd={d3fd}/>
                </div>
        )
    }
});

var DownloadButton = React.createClass({

    propTypes: {
        comp: React.PropTypes.object.isRequired
    },

    render: function() {

        return (
                <div title='Download these results' onClick={this.props.comp.download}>
                <SVGCollection.Download text='TXT' size={24} />
                </div>
        )
    }
})

module.exports = AnalysisPanel
