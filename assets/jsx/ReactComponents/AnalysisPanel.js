var React = require('react')
var PredictedGenesPanel = require('./PredictedGenesPanel')
var PWAPanel = require('./PWAPanel')
var SVGCollection = require('./SVGCollection')
var color = require('../../js/color.js')

var AnalysisPanel = React.createClass({

    propTypes: {

        analysisGroup: React.PropTypes.object.isRequired,
        coloring: React.PropTypes.string.isRequired,
        onClose: React.PropTypes.func.isRequired,
        onTermSelect: React.PropTypes.func.isRequired,
        onColoring: React.PropTypes.func.isRequired,
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
        this.refs.pwa.pwaRequest(this.props.analysisGroup)
        this.refs.pred.gpRequest(this.props.analysisGroup)
    },

    onTabSelect: function(index) {
        this.setState({
            activeTab: index
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

        // style={this.props.analysisGroup ? {visibility: 'visible'} : {visibility: 'hidden'}}>
        return (
                <div className='analysispanel bordered vflex' style={this.props.style}>
                <div className='flex00'>
                <div className={classNames[0]} onClick={this.onTabSelect.bind(null, 0)}>PATHWAYS & PHENOTYPES</div>
                <div className={classNames[1]} onClick={this.onTabSelect.bind(null, 1)}>SIMILAR GENES</div>
                <div className='clickable xbutton' style={{float: 'right', padding: '0 10px'}} onClick={this.props.onClose}>
                <SVGCollection.X size={16} />
                </div>
                </div>
                <PWAPanel
            ref='pwa'
            style={styles[0]}
            selectedTerm={this.props.selectedTerm}
            group={this.props.analysisGroup}
            termColoring={this.props.termColoring}
            areNodesColoredByTerm={this.props.coloring == 'term'}
            onTermClick={this.props.onTermSelect}
            onColoring={this.props.onColoring} />
                <PredictedGenesPanel
            ref='pred'
            style={styles[1]}
            group={this.props.analysisGroup}
            onGeneAdd={this.props.onGeneAdd}
            onGeneRemove={this.props.onGeneRemove}
            addedGenes={this.props.addedGenes}
            d3fd={d3fd}/>
                </div>
        )
    }
})

module.exports = AnalysisPanel

//     <div className='analysispanel' style={this.state.analysisGroup ? {visibility: 'visible'} : {visibility: 'hidden'}}>
//     <Tabs onSelect={this.handleTabSelect}>
//     <TabList>
//     <Tab>PATHWAYS & PHENOTYPES</Tab>
//     <Tab>SIMILAR GENES</Tab>
//     </TabList>
//     <TabPanel>
//     <div className='bordered smallpadding' style={{height: '100%', overflow: 'hidden', backgroundColor: color.colors.gnwhite, margin: '10px 0'}}>
//     <PWAPanel ref='pwa' selectedTerm={this.state.selectedTerm} group={this.state.analysisGroup}
// termColoring={this.state.termColoring} areNodesColoredByTerm={this.state.coloring == 'term'}
// onTermClick={this.selectTerm} onColoring={this.handleTermColoring} />
//     </div>
//     </TabPanel>
//     <TabPanel>
//     <div className='bordered smallpadding' style={{height: '100%', overflow: 'hidden', backgroundColor: color.colors.gnwhite}}>
//     <PredictedGenesPanel ref='pred' group={this.state.analysisGroup} onGeneAdd={this.addGeneRequest} onGeneRemove={this.removeGene} addedGenes={this.state.addedGenes} d3fd={d3fd}/>
//     </div>
//     </TabPanel>
//     </Tabs>
//     </div>
