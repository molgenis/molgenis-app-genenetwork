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

	handleTranscriptHover: function(item) {
        this.setState({
            transcriptHover: item
        });
	},

    componentWillMount: function() {
        var indices = this.props.fixed.indices
        var avg = this.props.values.avg
        this.sortedItems = _.sortBy(this.props.fixed.header, function(item){
            return avg[indices[item.name]]
        }).reverse()
        _.map(this.props.transcriptBars, function(transcript){
        	return transcript.reverse()
        })
    },

    render: function() {
        var indices = this.props.fixed.indices
        var avg = this.props.transcript ? this.props.transcript.avg : this.props.values.avg
        var z = this.props.transcript ? this.props.transcript.z : this.props.values.z
        var stdev = this.props.transcript ? this.props.transcript.stdev : this.props.values.stdev
        var auc = this.props.transcript ? this.props.transcript.auc : this.props.values.auc
        var transcriptBars = this.props.transcriptBars

        this.sortedItems = this.props.transcript ? _.sortBy(this.props.fixed.header, function(item){
            return avg[indices[item.name]]
        }).reverse() : this.sortedItems

    	var rows = _.map(this.sortedItems, function(item, i){
    	    return(
                <Tr key={item.name} className='clickable' onClick={this.props.onClick.bind(null, item)} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onMouseOver={this.props.onMouseOver.bind(null, item)} style={this.props.hoverItem === item.name || this.props.clickedItem === item.name ? {backgroundColor: 'rgb(255,225,0)'} : {}}>
                <Td column="">{item.name === "Skin" || item.name === "Brain" || item.name === "Blood" ? <ListIcon w={10} h={10} /> : null}</Td>
                <Td column="tissue">{item.name}</Td>
                <Td column="samples">{item.numAnnotated}</Td>
                <Td column="average">{avg[indices[item.name]]}</Td> 
                <Td column="auc">{auc[indices[item.name]]}</Td>
                <Td column="transcripts"><TranscriptBars values={transcriptBars[item.name]} endTranscriptbars={this.props.endTranscriptbars} onClick={this.props.onClick} onMouseOver={this.handleTranscriptHover} transcriptHover={this.state.transcriptHover} hoverItem={this.state.transcriptHover} selectedTranscript={this.props.selectedTranscript} arrows={this.props.numTranscripts >= 10 ? true : false} /></Td>
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
                },
                {
                	column: 'transcripts',
                	sortFunction: function(a, b) {
                		return _.sum(_.toArray(b)[4].values) - _.sum(_.toArray(a)[4].values)
                	}
                }
            ]}
            >
            <Thead>
            	<Th>{""}</Th>
            	<Th column="tissue"><span>{"TISSUE"}</span></Th>
            	<Th column="samples"><span title="Number of samples annotated">{"SAMPLES"}</span></Th>
            	<Th column="average"><span title="Average expression">{"AVERAGE"}</span></Th>
            	<Th column="auc"><span title="Area under the curve">{"AUC"}</span></Th>
            	<Th column="transcripts"><span title="Expression per transcript">{"TRANSCRIPTS"}</span></Th>
            </Thead>
            {rows}
            </Table>
        )
    }
})

var DropwDown = React.createClass({

    propTypes: {
        options: React.PropTypes.array,
        style: React.PropTypes.object,
        selected: React.PropTypes.string
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
        var text = 'Select transcript'
        var cls = this.state.isExpanded ? '' : 'invisible'
        var options = _.map(this.props.transcripts, function(opt, i) {
            var className = 'dropdownoption noselect'
            if (opt === that.props.selected) {
                text = opt
                className += ' selectedbutton'
            }
            return (
                    <div data-openmenu='true' key={i} className={cls} onMouseLeave={that.onMouseLeave}>
                    <span data-openmenu='true' className={className} style={{display: 'block', borderTop: '1px solid #dcdcdc'}} onClick={that.props.onClick.bind(null, opt)}>
                    {opt.toUpperCase().replace(/EXAC/, 'ExAC')}</span>
                    </div>
            )
        })
        
        return (
                <div className='dropdown clickable noselect' onClick={this.onClick} onMouseLeave={this.onMouseLeave}>
	                <div data-openmenu='true' style={{minWidth: '200px'}}><span>{text.toUpperCase()}</span>
               			<TriangleDown data-openmenu='true' className='dropdowntriangle' />
                	</div>
	                <div className='outer'>
	                	{options}
	            	</div>
                </div>
        )
    }
})

var Tissues = React.createClass({

    getInitialState: function() {
        return {}
    },
    
    handleMouseOver: function(item) {
        var hoverItem = typeof item === "object" ? item.name : item
        this.setState({
            hoverItem: hoverItem
        });
    },

    // >> split up for readability 
    handleClick: function(item) {
        item = typeof item === 'number' ? this.props.data.gene.transcripts[item + this.state.currentTranscriptbars - 10] : item
        console.log(item)
        // get transcript
        if (_.startsWith(item, 'ENST')){
            if (this.state.selectedTranscript == item) {
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
        } else if (item === 'left' || item === 'right'){
        	// get new transcript bars
    		var that = this
            var transcripts
            
            this.setState({
                transcript: undefined,
                selectedTranscript: undefined
            })

            if (item === 'right'){ // when clicked on the right arrow, select the next 10 transcripts
                transcripts = this.props.data.gene.transcripts.slice(this.state.currentTranscriptbars, this.state.currentTranscriptbars + 10)                
                this.setState(function(previousState, currentProps) {
                    return {currentTranscriptbars: previousState.currentTranscriptbars + 10} 
                })
                if (this.state.currentTranscriptbars + 20 > this.props.data.gene.transcripts.length){
                    this.setState({endTranscriptbars: 'right'})
                } else {
                    this.setState({endTranscriptbars: undefined})
                }
            } else { // when clicked on the left arrow, select the previous 10 transcripts
                transcripts = this.props.data.gene.transcripts.slice(this.state.currentTranscriptbars - 20, this.state.currentTranscriptbars - 10)
                this.setState(function(previousState, currentProps) {
                    return {currentTranscriptbars: previousState.currentTranscriptbars - 10} 
                })
                if (this.state.currentTranscriptbars === 20){
                    this.setState({endTranscriptbars: 'left'})
                } else {
                    this.setState({endTranscriptbars: undefined})
                }
            }

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
        } else {
        	var clickedItem = typeof item === "object" ? item.name : item
	        if (clickedItem === this.state.clickedItem){
	            this.setState({
	            	clickedItem: undefined
	            })
	        } else if (clickedItem === 'backToGene'){
	        	this.setState({
	        		transcript: undefined,
	        		selectedTranscript: undefined
	        	})
	        } else {
	            this.setState({
	                clickedItem: clickedItem
	            });
	        }
        }     
    },

    componentWillMount: function() {
        this.setState({
            currentTranscriptbars: 10,
            endTranscriptbars: 'left'
        })
        console.log(this.props.data.gene.transcripts.length)
    },
   
    render: function() {

        if (!this.props.celltypes) return null

        console.log('SELECTED TRANSCRIPT: ' + (this.props.data.gene.transcripts.indexOf(this.state.selectedTranscript) % 10))

    	return (
            <div>
        		<div className="hflex">
            		<div className="flex11" style={{height: '550px'}}>
            			<div className="flex11" style={{height: '50px', position: 'relative'}}>
                            <DropwDown transcripts={this.props.data.gene.transcripts} selected={this.state.selectedTranscript} onClick={this.handleClick} />
                            {this.state.selectedTranscript ? <span className='button clickable noselect' onClick={this.handleClick.bind(null, 'backToGene')} style={{float: 'left', marginLeft: '230px'}}>BACK TO GENE</span> : ""}	
            			</div>
                    	<DataTable
                            numTranscripts={this.props.data.gene.transcripts.length}
                            selectedTranscript={this.props.data.gene.transcripts.indexOf(this.state.selectedTranscript) % 10}
                            transcriptBars={this.state.transcriptBars ? this.state.transcriptBars : this.props.celltypes.transcriptBars}
                            endTranscriptbars={this.state.endTranscriptbars}
                            values={this.state.transcript ? this.state.transcript : this.props.celltypes.values}
                            fixed={this.props.celltypes.fixed}
                            onClick={this.handleClick}
                            clickedItem={this.state.clickedItem}
                            hoverItem={this.state.hoverItem}
                            onMouseOver={this.handleMouseOver} />
                	</div>
                	<div className="flex11" style={{minWidth: '50px', width: '50%', position: 'relative'}}> 
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
