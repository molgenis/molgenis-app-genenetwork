'use strict'

var _ = require('lodash')
var React = require('react')
var HomoSapiens = require('./HomoSapiens')
var htmlutil = require('../../htmlutil')
var SVGCollection = require('../SVGCollection')
var ListIcon = SVGCollection.ListIcon
var TranscriptBars = SVGCollection.TranscriptBars
var I = SVGCollection.I
var OpenMenu = require('./../OpenMenu')
var TriangleDown = require('../SVGCollection').TriangleDown
var TriangleUp = require('../SVGCollection').TriangleUp

var reactable = require('reactable')
var Tr = reactable.Tr
var Td = reactable.Td
var Th = reactable.Th
var Thead = reactable.Thead
var Table = reactable.Table
var unsafe = reactable.unsafe

var DataTable = React.createClass({

    getInitialState: function() {
        return {}
    },

	handleTranscriptBarHover: function(item) {
        this.setState({
            transcriptBarHover: item
        });
	},

    componentWillMount: function() {
        var indices = this.props.fixed.indices
        var avg = this.props.values.avg
        this.sortedItems = _.sortBy(this.props.fixed.header, function(item){
            return avg[indices[item.name]]
        }).reverse()
    },

    render: function() {
        var indices = this.props.fixed.indices
        var avg = this.props.transcript ? this.props.transcript.avg : this.props.values.avg
        var z = this.props.transcript ? this.props.transcript.z : this.props.values.z
        var stdev = this.props.transcript ? this.props.transcript.stdev : this.props.values.stdev
        var auc = this.props.transcript ? this.props.transcript.auc : this.props.values.auc
        var transcriptBars = this.props.transcriptBars
    	var rows = _.map(this.sortedItems, function(item, i){
    	    return(
                <Tr key={item.name} className='clickable' onClick={this.props.onClick.bind(null, item)} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onMouseOver={this.props.onMouseOver.bind(null, item)} style={this.props.hoverItem === item.name || this.props.clickedItem === item.name ? {backgroundColor: 'rgb(255,225,0)'} : {}}>
                <Td column="">{item.name === "Brain" || item.name === "Blood" ? <ListIcon w={10} h={10} /> : null}</Td>
                <Td column="tissue">{item.name}</Td>
                <Td column="samples">{item.numAnnotated}</Td>
                <Td column="average">{avg[indices[item.name]]}</Td> 
                <Td column="auc">{auc[indices[item.name]]}</Td>
                <Td column="transcripts">
                    <TranscriptBars
                        showBars={this.props.showTranscriptBars}
                        values={transcriptBars[item.name]}
                        transcripts={this.props.transcripts}
                        endTranscriptbars={this.props.endTranscriptbars}
                        onTranscriptArrowClick={this.props.onTranscriptArrowClick}
                        onTranscriptBarClick={this.props.onTranscriptBarClick}
                        onClick={this.props.onClick}
                        onMouseOver={this.handleTranscriptBarHover}
                        hoverItem={this.state.transcriptBarHover}
                        selectedTranscript={this.props.selectedTranscript}
                        showTranscriptBarArrows={this.props.showTranscriptBarArrows} />
                    </Td>
                </Tr>
    	    )
    	}.bind(this))

        return (
            <Table className='sortable tissues-table' sortable={['tissue',
                {
                	column: 'samples',
                	sortFunction: function(a, b) {return b - a}
                },
                {
                	column: 'average',
                	sortFunction: function(a, b) {return b - a}
                },
                {
                	column: 'auc',
                	sortFunction: function(a, b) {return b - a}
                }                
            ]}
            >
            <Thead>
            	<Th>{""}</Th>
            	<Th column="tissue"><span>{"TISSUE"}</span></Th>
            	<Th column="samples"><span title="Number of samples">{"SAMPLES"}</span> <I title="Number of samples"/></Th>
            	<Th column="average"><span title="Average">{"AVERAGE"}</span> <I title="Average"/></Th>
            	<Th column="auc"><span title="The area under the curve was calculated by comparing the tissue-specific samples with the rest of the samples using a Wilcoxon test.">{"AUC"}</span> <I title="The area under the curve was calculated by comparing the tissue-specific samples with the remaining samples using a Wilcoxon test."/></Th>
            	<Th column="transcripts"><span style={{cursor: 'pointer'}} title="Expression per tissue for each transcript.">{"TRANSCRIPTS"}</span> <I title="Expression per tissue for each transcript."/></Th>
            </Thead>
            {rows}
            </Table>
        )
    }
})

var Tissues = React.createClass({

    getInitialState: function() {
        return {}
    },

    componentWillMount: function() {
        this.setState({
            currentTranscriptbars: 10,
            endTranscriptbars: 'left'
        })
    },
    
    handleMouseOver: function(item) {
        var hoverItem = typeof item === "object" ? item.name : item
        this.setState({
            hoverItem: hoverItem
        });
    },

    handleTranscriptArrowClick: function(item) {
        var that = this
        var transcripts        
        if (item === 'right'){ //when clicked on the right arrow, select the next 10 transcripts
            transcripts = this.props.data.gene.transcripts.slice(this.state.currentTranscriptbars, this.state.currentTranscriptbars + 10)
            this.setState({currentTranscripts: transcripts})
            this.setState(function(previousState) {
                return {currentTranscriptbars: previousState.currentTranscriptbars + 10} 
            })
            //when reached the end, right arrow is not clickable anymore
            this.setState({
            	endTranscriptbars: this.state.currentTranscriptbars + 20 > this.props.data.gene.transcripts.length ? 'right' : undefined
            })
        } else { //when clicked on the left arrow, select the previous 10 transcripts
            transcripts = this.props.data.gene.transcripts.slice(this.state.currentTranscriptbars - 20, this.state.currentTranscriptbars - 10)
            this.setState({currentTranscripts: transcripts})
            this.setState(function(previousState) {return {currentTranscriptbars: previousState.currentTranscriptbars - 10}})
            //makes left arrow not clickable at start
            this.setState({
            	endTranscriptbars: this.state.currentTranscriptbars === 20 ? 'left' : undefined
            })
        }
        //get transcript bar data
        $.ajax({
            url: GN.urls.transcriptBars + '/' + this.props.data.gene.id + ',' + transcripts,
            datatype: 'binary',
            success: function(data) {
                this.setState({
                    transcriptBars: data
                })
            }.bind(that),
            error: function(xhr, status, err) {
                console.log(xhr)
                this.setState({
                    error: 'Error' + xhr.status
                })
            }.bind(that)
        })
    },

    handleTranscriptBarClick: function(item) {
        if (this.state.selectedTranscript == item) { //deselect transcript
            this.setState({
                transcript: undefined,
                selectedTranscript: undefined
            })
        } else {
            var that = this
            $.ajax({
                url: GN.urls.transcript + '/' + item,
                dataType: 'json',
                success: function(data) {
                    this.setState({
                        transcript: data,
                        selectedTranscript: item.toString()
                    })
                }.bind(that),
                error: function(xhr, status, err) {
                    console.log(xhr)
                    this.setState({
                        error: 'Error' + xhr.status
                    })
                }.bind(that)
            })
        }
    },

    handleClick: function(item) {
    	var clickedItem = typeof item === "object" ? item.name : item
        this.setState({
        	clickedItem: clickedItem === this.state.clickedItem ? undefined : clickedItem
        })
    },
  
    render: function() {

        if (!this.props.celltypes) return null
    	return (
            <div>
        		<div className="hflex">
            		<div className="flex11" style={{height: '550px'}}>
                    	<DataTable
                            values={this.state.transcript ? this.state.transcript : this.props.celltypes.values}
                            transcripts={this.state.currentTranscripts ? this.state.currentTranscripts : this.props.data.gene.transcripts}
                            fixed={this.props.celltypes.fixed}
                            onClick={this.handleClick}
                            clickedItem={this.state.clickedItem}
                            hoverItem={this.state.hoverItem}
                            onMouseOver={this.handleMouseOver}
                            showTranscriptBars={this.props.data.gene.transcripts ? true : false}
                            showTranscriptBarArrows={!this.props.data.gene.transcripts ? false : this.props.data.gene.transcripts.length >= 10 ? true : false}
                            selectedTranscript={!this.props.data.gene.transcripts ? 0 : this.state.selectedTranscript}
                            transcriptBars={this.state.transcriptBars ? this.state.transcriptBars : this.props.celltypes.transcriptBars}
                            endTranscriptbars={this.state.endTranscriptbars}
                            onTranscriptArrowClick={this.handleTranscriptArrowClick}
                            onTranscriptBarClick={this.handleTranscriptBarClick} />

                	</div>
                	<div className="flex11" style={{minWidth: '50px', width: '60%', position: 'relative'}}> 
                   		<HomoSapiens
                            values={this.state.transcript ? this.state.transcript : this.props.celltypes.values}
                            fixed={this.props.celltypes.fixed}
                            onClick={this.handleClick}
                            clickedItem={this.state.clickedItem}
                            hoverItem={this.state.hoverItem}
                            onMouseOver={this.handleMouseOver} />
                    </div>
                </div>       
            </div>
    	)
    }
})

module.exports = Tissues
