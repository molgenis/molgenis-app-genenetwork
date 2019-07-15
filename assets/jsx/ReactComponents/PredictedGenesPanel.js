'use strict'

var _ = require('lodash')
var htmlutil = require('../../js/htmlutil.js')
var React = require('react')
var SVGCollection = require('./SVGCollection')
var Disetti = require('./Disetti')
var color = require('../../js/color')

var AddGeneSVG = createReactClass({

    propTypes: {
        gene: PropTypes.object.isRequired
    },
    
    render: function() {
        
        return (
                <div style={this.props.style}>
                <svg viewBox='0 0 10 10' width={this.props.w} height={this.props.h}>
                <rect x1='0' y1='0' width='10' height='10' style={{fill: color.biotype2color[this.props.gene.biotype] || color.colors.default}} />
                <line x1='5' y1='2' x2='5' y2='8' style={{stroke: color.colors.gnwhite, shapeRendering: 'crispEdges', strokeWidth: 2}}></line>
                <line x1='2' y1='5' x2='8' y2='5' style={{stroke: color.colors.gnwhite, shapeRendering: 'crispEdges', strokeWidth: 2}}></line>
                </svg>
                </div>
        )
    }
})

var RemoveGeneSVG = createReactClass({

    propTypes: {
        gene: PropTypes.object.isRequired
    },
    
    render: function() {

        return (
                <div style={this.props.style}>
                <svg viewBox='0 0 10 10' width={this.props.w} height={this.props.h}>
                <rect x1='0' y1='0' width='10' height='10' style={{fill: color.biotype2color[this.props.gene.biotype] || color.colors.default}} />
                <line x1='2' y1='5' x2='8' y2='5' style={{stroke: color.colors.gnyellow, shapeRendering: 'crispEdges', strokeWidth: 2}}></line>
                </svg>
                </div>
        )
    }
})
    
var PredictedGenesPanel = createReactClass({

    propTypes: {
        group: PropTypes.object,
        onGeneAdd: PropTypes.func,
        onGeneRemove: PropTypes.func,
        addedGenes: PropTypes.array,
        d3fd: PropTypes.object, // TODO remove, put getNodeById() in the data object itself?
    },

    getInitialState: function() {

        return {}
    },
    
    componentDidMount: function() {

        this.setSocketListeners()
        // this.gpRequest()
    },

    componentWillUnmount: function() {

        io.socket._raw.removeListener('geneprediction.queueEvent', this._onIOQueueEvent)
        io.socket._raw.removeListener('geneprediction.error', this._onIOError)
        io.socket._raw.removeListener('geneprediction.result', this._onIOResult)
        io.socket._raw.removeListener('geneprediction.end', this._onIOEnd)
    },
    
    _onIOQueueEvent: function(msg) {

        if (msg.queueLength || msg.queueLength === 0) {
            var str = htmlutil.intToStr(msg.queueLength) + ' analyses'
            if (msg.queueLength === 0) str = 'Starting analysis...'
            else if (msg.queueLength < 2) str = 'Your analysis will start in a few seconds...'
            else if (msg.queueLength < 10) str = 'Your analysis will start in less than a minute, please be patient.'
                + 'I\'m ' + htmlutil.intToOrdinalStr(msg.queueLength) + ' in the queue.'
            else str = 'This will take some time as our servers are busy right now, please be patient. '
                + 'I\'m ' + htmlutil.intToOrdinalStr(msg.queueLength) + ' in the queue.'
            this.setState({
                gpMessage: str
            })
        } else {
            console.log('PredictedGenesPanel.setSocketListeners: unhandled queueEvent')
        }
    },

    _onIOResult: function(msg) {

        if (msg.gpResults.auc && msg.gpResults.auc > 0) {
            
            this.setState({
                gpAUC: msg.gpResults.auc
            })
            
        } else {
            
            var oldResults = this.state.gpResults
            if (!oldResults) {
                oldResults = []
            }
            var newResults = []
            var curI = 0
            // maintain results sorted
            var r = msg.gpResults.results
            for (var i = 0; i < oldResults.length; i++) {
                while (curI < r.length && r[curI].p < oldResults[i].p) {
                    //TODO inefficient
                    if (!this.props.d3fd.getNodeById(r[curI].gene.id)) {
                        newResults.push(r[curI])
                    } else {
                        // console.log(r[curI].gene.name + ' already in network')
                    }
                    ++curI
                }
                newResults.push(oldResults[i])
            }

            for (var i = curI; i < r.length; i++) {
                if (!this.props.d3fd.getNodeById(r[i].gene.id)) {
                    newResults.push(r[i])
                } else {
                    // console.log('Gene ' + r[i].gene.name + ' already in network!')
                }
            }

            this.setState({
                gpMessage: null,
                gpResults: newResults,
                gpStatus: msg.gpStatus,
                gpRunning: true,
                gpAUC: msg.gpResults.auc
            })
        }
    },
    
    _onIOError: function(msg) {

        this.setState({
            gpMessage: msg.gpMessage,
            gpRunning: false
        })
    },

    _onIOEnd: function(msg) {

        this.props.onPredFinish()

        this.setState({
            gpMessage: msg.gpMessage,
            gpRunning: false
        })
    },
    
    setSocketListeners: function() {
        io.socket.on('geneprediction.queueEvent', this._onIOQueueEvent)
        io.socket.on('geneprediction.error', this._onIOError)
        io.socket.on('geneprediction.result', this._onIOResult)
        io.socket.on('geneprediction.end', this._onIOEnd)
    },
    
    gpRequest: function(group, geneOfInterest) {
        group = group || this.props.group


        if (!group) {
            
            console.log('PredictedGenesPanel.gpRequest: no group!')
            
        } else {

            if (this.state.gpRunning === true) {
                window.alert('Gene prediction requested but one is already running, not starting a new one.')
            } else {
                console.log('PredictedGenesPanel.gpRequest: sending gene prediction request')
                var genes = _.map(group.nodes, function(gene) { return gene })
                io.socket.get(GN.urls.geneprediction, {genes: genes, geneOfInterest: geneOfInterest}, function(res, jwres) {
                    if (jwres.statusCode !== 200) {
                        window.alert('Please try again later.')
                    }
                    //console.log('gp res:', res, jwres)
                })
            }
            
            this.props.onPredStart()
            
            this.setState({
                gpMessage: 'Analysis requested...',
                gpStatus: null,
                gpResults: null,
                gpRunning: true
            })
        }
    },

    download: function() {

        var form = document.getElementById('gn-network-gpform')
        form['data'].value = JSON.stringify(this.state.gpResults)
        form['name'].value = this.props.group.name
        form['genes'].value = JSON.stringify(this.props.group.nodes)
        form.submit()
    },
    
    addGene: function(gene) {
    },

    shouldComponentUpdate: function(nextProps, nextState) {

        return nextState.gpMessage != this.state.gpMessage
            || nextState.gpRunning != this.state.gpRunning
            || nextState.gpResults != this.state.gpResults
            || (nextProps.addedGenes && this.props.addedGenes
                && nextProps.addedGenes.length != this.props.addedGenes.length)
            || nextProps.style.display != this.props.style.display
    },
    
    render: function() {
        if (!this.props.group) return null
        if (!this.state.gpResults && this.state.gpMessage) {
            return (<div style={this.props.style}>
                    <div>{this.state.gpMessage}</div>
                    </div>
                   )
        } else if (this.state.gpResults) {
            var rows = [(<tr key='gpheader' className='headerrow'>
                         <th style={{textAlign: 'center'}}></th>
                         <th>GENE</th>
                         <th className='pvalueheader'>P-VALUE</th>
                         </tr>)]
            var rowNum = 0
            for (var i = 0; i < this.state.gpResults.length; i++) {
                var result = this.state.gpResults[i]
                var desc = (result.gene.description || 'no description').replace(/\[[^\]]+\]/g, '')
                //TODO efficiency
                rows.push(
                    (
	                    <tr key={i} >
                            {this.props.addedGenes.indexOf(result.gene.id) < 0 ?
                             (<td title={result.gene.biotype.replace(/_/g, ' ')} className='clickable addremove' onClick={this.props.onGeneAdd.bind(null, result.gene)}>
                              <AddGeneSVG gene={result.gene} w={20} h={20} style={{marginRight: '8px'}} />
                              </td>) :
                             (<td title={result.gene.biotype.replace(/_/g, ' ')} className='clickable addremove' onClick={this.props.onGeneRemove.bind(null, result.gene)}>
                              <RemoveGeneSVG gene={result.gene} w={20} h={20} style={{marginRight: '8px'}} />
                              </td>)}
        	            <td><a title={desc} className='black nodecoration' href={GN.urls.genePage + result.gene.id} target='_blank'>{result.gene.name}</a></td>
                            <td className='pvalue' dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(result.p)}}></td>
    		            </tr>
                    ))
            }
            
            var aucDiv = (<div>
                          {this.state.gpAUC > 0 ? ' AUC ' + Math.round(1000 * this.state.gpAUC) / 1000 : ' (AUC not calculated)'}
                          </div>)

            return (
                    <div className='scrollable' style={this.props.style}>
                    <p>These genes are the most similar to <strong>{this.props.group.name}</strong> <br/> outside of the shown network.</p>
                    <table className='gptable fullwidth'>
                    <tbody>
                    {rows}
                </tbody>
                    </table>
      	            </div>
            )
        } else {
            return(<div>Loading...</div>)
        }
    }
})

module.exports = PredictedGenesPanel
