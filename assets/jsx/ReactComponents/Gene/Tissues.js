'use strict'

var _ = require('lodash')
var React = require('react')
var HomoSapiens = require('./HomoSapiens')
var htmlutil = require('../../htmlutil')
var SVGCollection = require('../SVGCollection')
var ListIcon = SVGCollection.ListIcon
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

    componentWillMount: function() {
        var indices = this.props.names.indices
        var avg = this.props.values.avg
        this.sortedItems = _.sortBy(this.props.names.header, function(item){
            return avg[indices[item.name]]
        }).reverse()
    },

    render: function() {
        var indices = this.props.names.indices
        var avg = this.props.transcript ? this.props.transcript.avg : this.props.values.avg
        var z = this.props.transcript ? this.props.transcript.z : this.props.values.z
        var stdev = this.props.transcript ? this.props.transcript.stdev : this.props.values.stdev
        var auc = this.props.transcript ? this.props.transcript.auc : this.props.values.auc

        this.sortedItems = this.props.transcript ? _.sortBy(this.props.names.header, function(item){
            return avg[indices[item.name]]
        }).reverse() : this.sortedItems

    	var rows = _.map(this.sortedItems, function(item, i){
    	    return(
                <Tr key={item.name} className='clickable' onClick={this.props.onClick.bind(null, item)} onMouseOut={this.props.onMouseOver.bind(null, undefined)} onMouseOver={this.props.onMouseOver.bind(null, item)} style={this.props.hoverItem === item.name || this.props.clickedItem === item.name ? {backgroundColor: 'rgb(255,225,0)'} : {}}>
                <Td column="">{item.name === "Skin" || item.name === "Brain" || item.name === "Blood" ? <ListIcon w={10} h={10} /> : null}</Td>
                <Td column="TISSUE">{item.name}</Td>
                <Td column="SAMPLES">{item.numAnnotated}</Td>
                <Td column="AVERAGE">{avg[indices[item.name]]}</Td>
                <Td column="Z SCORE">{z[indices[item.name]]}</Td>
                <Td column="SD">{stdev[indices[item.name]]}</Td>
                <Td column="AUC">{auc[indices[item.name]]}</Td>
                <Td column="NETWORK">{item.name === 'Blood' ?  <a href={GN.urls.networkPage} target="_blank"><SVGCollection.NetworkIcon /></a> : null}</Td>
                </Tr>
    	    )
    	}.bind(this))

        return (
            <Table className='sortable tissues-table' style={{width: '100%'}}

            sortable={[

                'TISSUE',

                {
                    column: 'SAMPLES',
                    sortFunction: function(a, b) {
                        return b - a
                    }
                },

                {
                    column: 'AVERAGE',
                    sortFunction: function(a, b) {
                        return b - a
                    }
                },

                {
                    column: "Z SCORE",
                    sortFunction: function(a, b) {
                        return b - a

                        // if (a.length < 5) {
                        //     if (b.length < 5) {             {/* a ?? b */}
                        //         return a - b
                        //     } else if (b[0] != '<') {    {/* a > b */}
                        //         return 1
                        //     } else {                        {/* a > b */}
                        //         return 1
                        //     }
                        // } else if (a[0] != '<') {
                        //     if (b.length < 5) {             {/* a < b */}
                        //         return -1
                        //     } else if (b[0] != '<') {    {/* a ?? b */}

                        //         a = a.toString()
                        //         var aExponent = a.slice(53)
                        //         var aExp = aExponent.slice(0, aExponent.indexOf("<"))
                        //         var aNumber = a.slice(0,3)

                        //         b = b.toString()
                        //         var bExponent = b.slice(53)
                        //         var bExp = bExponent.slice(0, bExponent.indexOf("<"))
                        //         var bNumber = b.slice(0,3)

                        //         return aExp - bExp || aNumber - bNumber

                        //     } else {                        {/* a > b */}
                        //         return 1
                        //     }
                        // } else {
                        //     if (b.length < 5) {             {/* a < b */}
                        //         return -1
                        //     } else if (b[0] != '<') {    {/* a <b */}
                        //         return -1
                        //     } else {

                        //         a = a.toString()
                        //         var aExponent = a.slice(55)
                        //         var aExp = aExponent.slice(0, aExponent.indexOf("<"))
                        //         var aNumber = a.slice(2,5)

                        //         b = b.toString()
                        //         var bExponent = b.slice(55)
                        //         var bExp = bExponent.slice(0, bExponent.indexOf("<"))
                        //         var bNumber = b.slice(2,5)

                        //         return aExp - bExp || aNumber - bNumber

                        //     }
                        // }
                    }
                },

                {
                    column: 'SD',
                    sortFunction: function(a, b) {
                        return b - a
                    }
                },

                {
                    column: 'AUC',
                    sortFunction: function(a, b) {
                        return b - a
                    }
                }
            ]}
            >
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
    	var options = _.map(this.props.transcripts, function(transcript){
            return {"key": transcript[0], "label": transcript[0]}
        })
        var that = this
        var text = 'Select transcript'
        var cls = this.state.isExpanded ? '' : 'invisible'
        var options = _.map(options, function(opt, i) {
            var className = 'dropdownoption noselect'
            if (opt.key === that.props.selected) {
                text = opt.label
                className += ' selectedbutton'
            }
            return (
                    <div data-openmenu='true' key={i} className={cls} onMouseLeave={that.onMouseLeave}>
                    <span data-openmenu='true' className={className} style={{display: 'block', borderTop: '1px solid #dcdcdc'}} onClick={that.props.onClick.bind(null, opt.key)}>
                    {opt.label.toUpperCase().replace(/EXAC/, 'ExAC')}</span>
                    </div>
            )
        })
        
        return (
                <div className='dropdown clickable noselect' onClick={this.onClick} onMouseLeave={this.onMouseLeave}>
	                <div data-openmenu='true' style={{minWidth: '150px'}}><span>{text.toUpperCase()}</span>
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

    handleClick: function(item) {     
        if (_.startsWith(item, 'ENST')){
            var that = this
            $.ajax({
                url: GN.urls.transcript + '/' + item,
                dataType: 'json',
                success: function(data) {
                    this.setState({
                        transcript: data,
                        selectedTranscript: item
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
    },
   
    render: function(){

        if (!this.props.celltypes) return null

    	return (
            <div>
        		<div className="hflex">
            		<div className="flex11" style={{height: '550px', overflow: "auto"}}>
            			<div className="flex11" style={{height: '50px', position: 'relative'}}>
            				{this.state.selectedTranscript ? <span className='button clickable noselect' onClick={this.handleClick.bind(null, 'backToGene')}>BACK TO GENE</span> : ""}	
            				<DropwDown transcripts={this.props.data.gene.transcripts} selected={this.state.selectedTranscript} onClick={this.handleClick} />
            			</div>
                    	<DataTable values={this.state.transcript ? this.state.transcript : this.props.celltypes.values} names={this.props.celltypes.names} onClick={this.handleClick} clickedItem={this.state.clickedItem} hoverItem={this.state.hoverItem} onMouseOver={this.handleMouseOver} />
                	</div>
                	<div className="flex11" style={{minWidth: '50px', width: '45%'}}>
                   		<HomoSapiens values={this.state.transcript ? this.state.transcript : this.props.celltypes.values} names={this.props.celltypes.names} onMouseOver={this.handleMouseOver} onClick={this.handleClick} hoverItem={this.state.hoverItem} clickedItem={this.state.clickedItem} />
                    </div>
                </div>       
            </div>
    	)
    }
})

module.exports = Tissues
