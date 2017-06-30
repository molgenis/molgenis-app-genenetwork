'use strict'

var _ = require('lodash')
var htmlutil = require('../htmlutil.js')
var color = require('../../js/color.js')
var React = require('react')
var ReactDOM = require('react-dom')
var StatusBar = require('./StatusBar')
var Disetti = require('./Disetti')
var SVGCollection = require('./SVGCollection')
var Rectangle = SVGCollection.Rectangle
var Cookies = require('cookies-js')

// TODO handle resize: width

var PWAPanel = React.createClass({

    propTypes: {
        group: React.PropTypes.object,
        selectedTerm: React.PropTypes.object,
        termColoring: React.PropTypes.string,
        areNodesColoredByTerm: React.PropTypes.bool
    },

    keyListener: function(e) {

        var pwaResults = this.state.pwaResults && this.state.pwaResults[this.state.currentDatabase]
        var domNode = ReactDOM.findDOMNode(this)
        
        if (e.keyCode === 38 && pwaResults) { // bob marley - wake up and live
            if (this.props.selectedTerm && pwaResults[0].pathway != this.props.selectedTerm) {
                e.preventDefault()
                e.stopPropagation()
                var numTerms = pwaResults.length
                for (var i = 1; i < numTerms; i++) {
                    if (pwaResults[i].pathway == this.props.selectedTerm) {
                        this.props.onTermClick(pwaResults[i-1].pathway)
                        if (this.refs && this.refs.selectedrow) {
                            var offset = this.refs.selectedrow.offsetHeight
                            domNode.scrollTop -= offset
                        }
                        break
                    }
                }
            }
        } else if (e.keyCode === 40 && pwaResults) { // sentenced - down
            if (this.props.selectedTerm && _.last(pwaResults).pathway != this.props.selectedTerm) {
                e.preventDefault()
                e.stopPropagation()
                var numTerms = pwaResults.length
                for (var i = 0; i < numTerms - 1; i++) {
                    if (pwaResults[i].pathway == this.props.selectedTerm) {
                        this.props.onTermClick(pwaResults[i+1].pathway)
                        if (this.refs && this.refs.selectedrow) {
                            var offset = this.refs.selectedrow.offsetHeight
                            domNode.scrollTop += offset
                        }
                        break
                    }
                }
            }
        } else if (e.keyCode === 37 && pwaResults) { // entombed - left hand path
            if (this.props.selectedTerm && pwaResults[0].pathway != this.props.selectedTerm) {
                e.preventDefault()
                e.stopPropagation()
                var numTerms = pwaResults.length
                for (var i = 1; i < numTerms; i++) {
                    if (pwaResults[i].pathway == this.props.selectedTerm) {
                        var numMoved = (i - 10 >= 0) ? 10 : i
                        this.props.onTermClick(pwaResults[i - numMoved].pathway)
                        if (this.refs && this.refs.selectedrow) {
                            var offset = this.refs.selectedrow.offsetHeight
                            domNode.scrollTop -= numMoved * offset
                        }
                        break
                    }
                }
            }
        } else if (e.keyCode === 39 && pwaResults) { // right is the new wrong
            if (this.props.selectedTerm && _.last(pwaResults).pathway != this.props.selectedTerm) {
                e.preventDefault()
                e.stopPropagation()
                var numTerms = pwaResults.length
                for (var i = 0; i < numTerms - 1; i++) {
                    if (pwaResults[i].pathway == this.props.selectedTerm) {
                        var numMoved = (i + 10 <= numTerms - 1) ? 10 : i
                        this.props.onTermClick(pwaResults[i + numMoved].pathway)
                        if (this.refs && this.refs.selectedrow) {
                            var offset = this.refs.selectedrow.offsetHeight
                            domNode.scrollTop += numMoved * offset
                        }
                        break
                    }
                }
            }
        }
    },
    
    getInitialState: function() {

        return {
            currentDatabase: Cookies.get('pwadb') || 'REACTOME',
            progress: 0,
            pwaResults: {}
        }
    },
    
    componentDidMount: function() {

        console.log('PWAPanel.componentDidMount: called')
        this.w = ReactDOM.findDOMNode(this).offsetWidth - 3 * 10 - 16 // 3 * padding - diskette width
        window.addEventListener('resize', this.handleResize)
        $(document).keydown(this.keyListener)
        this.setSocketListeners()
    },
    
    shouldComponentUpdate: function(nextProps, nextState) {

        return _.size(this.state.pwaResults) === 0
            || nextState.currentDatabase != this.state.currentDatabase
            || nextState.progress != this.state.progress
            || nextState.filterValue !== this.state.filterValue
            || nextState.pwaRunning != this.state.pwaRunning
            || nextProps.selectedTerm != this.props.selectedTerm
            || nextProps.termColoring != this.props.termColoring
            || nextProps.areNodesColoredByTerm != this.props.areNodesColoredByTerm
            || nextProps.style.display != this.props.style.display
    },
    
    componentWillReceiveProps: function(nextProps) {

        this.w = ReactDOM.findDOMNode(this).offsetWidth - 3 * 10 - 16 // 3 * padding - diskette width
    },

    handleResize: function(e) {

        this.w = ReactDOM.findDOMNode(this).offsetWidth - 3 * 10 - 16 // 3 * padding - diskette width
        this.setState({
            w: this.w
        })
    },
    
    componentWillUnmount: function() {

        console.log('PWAPanel.componentWillUnmount: called')
        window.removeEventListener('resize', this.handleResize)
        $(document).unbind('keydown', this.keyListener)
        io.socket._raw.removeListener('pathwayanalysis.queueEvent', this._onIOQueueEvent)
        io.socket._raw.removeListener('pathwayanalysis.error', this._onIOError)
        io.socket._raw.removeListener('pathwayanalysis.result', this._onIOResult)
        io.socket._raw.removeListener('pathwayanalysis.end', this._onIOEnd)
    },

    _onIOQueueEvent: function(msg) {

        if (!this.isMounted()) {
            console.warn('PWAPanel.setSocketListeners: pathwayanalysis.queueEvent received but component not mounted')
        }
        if (msg.queueLength || msg.queueLength === 0) {
            var str = htmlutil.intToStr(msg.queueLength) + ' analyses'
            if (msg.queueLength === 0) str = 'Analysis started'
            else if (msg.queueLength < 2) str = 'Your analysis will start in a few seconds...'
            else if (msg.queueLength < 8) str = 'Your analysis will start in less than a minute, please be patient.<br/>'
                + 'I\'m ' + htmlutil.intToOrdinalStr(msg.queueLength) + ' in the queue.'
            else str = 'This will take some time as our servers are busy right now, please be patient.<br/>'
                + 'I\'m ' + htmlutil.intToOrdinalStr(msg.queueLength) + ' in the queue.'
            this.setState({
                pwaMessage: str,
                currentDatabase: msg.db || this.state.currentDatabase
            })
        } else {
            console.log('PWAPanel.setSocketListeners: unhandled queueEvent')
        }
    },

    _onIOError: function(msg) {
        if (!this.isMounted()) {
            console.warn('PWAPanel.setSocketListeners: pathwayanalysis.error received but component not mounted')
        }
        console.log('_onIOERROR')
        console.log(msg)
        
        this.setState({
            pwaMessage: msg.pwaMessage,
            pwaRunning: false
        })
    },

    _onIOResult: function(msg) {

        if (!this.isMounted()) {
            console.warn('PWAPanel.setSocketListeners: pathwayanalysis.result received but component not mounted')
        }
        
        // console.log(msg)
        var allResults = this.state.pwaResults // also other databases, should probably go to some storage
        var oldResults = allResults[msg.db] || []
        var newResults = []
        var curI = 0
        for (var i = 0; i < oldResults.length; i++) {
            while (curI < msg.pwaResults.length && msg.pwaResults[curI].p < oldResults[i].p) {
                newResults.push(msg.pwaResults[curI])
                curI++
            }
            newResults.push(oldResults[i])
        }
        for (var i = curI; i < msg.pwaResults.length; i++) {
            newResults.push(msg.pwaResults[i])
        }
        allResults[msg.db] = newResults
        this.setState({
            pwaMessage: 'Analysis ' + msg.progress + ' % done',
            pwaResults: allResults,
            pwaRunning: true,
            progress: msg.progress,
            currentDatabase: msg.db,
            testType: msg.testType,
            availableDatabases: msg.availableDatabases
        })
    },

    _onIOEnd: function(msg) {

        if (!this.isMounted()) {
            console.warn('PWAPanel.setSocketListeners: pathwayanalysis.end received but component not mounted')
        }
        Cookies.set('pwadb', msg.db)
        this.props.onPWAFinish()
        this.setState({
            pwaRunning: false
        })
    },
    
    setSocketListeners: function() {

        // TODO own vs broadcast
        io.socket.on('pathwayanalysis.queueEvent', this._onIOQueueEvent)
        io.socket.on('pathwayanalysis.error', this._onIOError)
        io.socket.on('pathwayanalysis.result', this._onIOResult)
        io.socket.on('pathwayanalysis.end', this._onIOEnd)
    },

    handleDatabaseClick: function(db) {

        if (!db) return

        if (this.state.pwaResults[db]) { // results already fetched
            this.setState({
                currentDatabase: db
            })
        } else {
            this.state.pwaResults[db] = []
            this.pwaRequest(this.state.group, db)
        }
    },
    
    pwaRequest: function(group, db) {

        if (!this.isMounted()) {
            console.warn('PWAPanel.pwaRequest: component not mounted!')
            return false
        }
        
        this.clearFilter()
        
        group = group || this.props.group
        if (!group) {
            console.warn('PWAPanel.pwaRequest: no group!')
            return false
        }
        
        if (this.state.pwaRunning === true) {
            
            window.alert('A pathway analysis is already running, not starting a new one.')
            return false
            
        } else {
            
            var db = db || this.state.currentDatabase
            console.log('PWAPanel.pwaRequest: sending pathway analysis request: ' + db)
            var genes = _.map(group.nodes, function(gene) { return gene })

            io.socket.get(GN.urls.pathwayanalysis,
                          {db: db,
                           genes: genes},
                          function(res, jwres) {
                              if (jwres.statusCode === 500) {
                                  that.setState({
                                      pwaMessage: 'Please try again later.'
                                  })
                              }
                          }.bind(this))
            
            this.props.onPWAStart()
            this.state.pwaResults[db] = null
            this.setState({
                pwaMessage: 'Analysis requested',
                progress: 0,
                pwaResults: this.state.pwaResults,
                pwaRunning: true
            })
            
            return true
            
        }
    },

    download: function() {
        var form = document.getElementById('gn-network-pwaform')
        form['data'].value = JSON.stringify(this.state.pwaResults[this.state.currentDatabase])
        form['name'].value = this.props.group.name
        form['db'].value = this.state.currentDatabase
        form['genes'].value = JSON.stringify(this.props.group.nodes)
        form['testType'].value = this.state.testType
        form.submit()
    },

    clearFilter: function() {
        this.setState({
            filterValue: ''
        })
    },
    
    handleFilterChange: function(e) {
        this.setState({
            filterValue: e.target.value.toLowerCase()
        })
    },

    // TODO move stuff to componentWillUpdate for speedup
    render: function() {

        if (!this.props.group) return (<div />)

        var that = this
        var numDatabasesWithResults = _.size(this.state.pwaResults)
        if (numDatabasesWithResults === 0 && this.state.pwaMessage) {
            return (<div className='flex10' style={{position: 'relative'}}>
                    <div dangerouslySetInnerHTML={{__html: this.state.pwaMessage}} />
                    </div>)
        } else if (numDatabasesWithResults > 0) {
            //TODO fix 'HPO' .. type of database over the wire
            var rows = []
            if (this.state.pwaResults[this.state.currentDatabase]) {
                rows.push((<tr key='pwaheader' className='headerrow'><th>{this.state.currentDatabase == 'HPO' ? 'PHENOTYPE' : 'PATHWAY'}</th><th className='pvalueheader'>P-VALUE</th></tr>))
                rows.push.apply(rows, _.map(this.state.pwaResults[this.state.currentDatabase], function(result, rowNum) {
                    if (!that.state.filterValue || result.pathway.name.toLowerCase().indexOf(that.state.filterValue) >= 0) {
                        var cls = rowNum++ % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'
                        if (that.props.selectedTerm && that.props.selectedTerm.id == result.pathway.id) {
                            return (
                                    <tr ref='selectedrow' key={result.pathway.database + result.pathway.id} className='datarow selectedrow'>
        	                    <td className='clickable' title={result.pathway.numAnnotatedGenes + ' annotated genes, prediction accuracy ' + Math.round(100 * result.pathway.auc) / 100} onClick={that.props.onTermClick.bind(null, null)}>{result.pathway.name}</td>
                                    <td className='pvalue' style={{whiteSpace: 'nowrap'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(result.p)}}></td>
    		                    </tr>
                            )
                        } else {
                            return (
                                    <tr key={result.pathway.database + result.pathway.id} className={cls}>
        	                    <td className='clickable' title={result.pathway.numAnnotatedGenes + ' annotated genes, prediction accuracy ' + Math.round(100 * result.pathway.auc) / 100} onClick={that.props.onTermClick.bind(null, result.pathway)}>{result.pathway.name}</td>
                                    <td className='pvalue' style={{whiteSpace: 'nowrap'}} dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(result.p)}}></td>
    		                    </tr>
                            )
                        }
                    }
                }))
            }

            // console.log(this.state.progress)
            var clrs = [color.colors.gngray, color.colors.gngray]
            var buttonClasses = this.state.pwaRunning ? ['button small disabled noselect', 'button small disabled noselect'] : ['clickable button small noselect', 'clickable button small noselect']
            buttonClasses = ['clickable noselect', 'clickable noselect']
            if (this.props.areNodesColoredByTerm && this.props.termColoring == 'prediction') {
                // buttonClasses = ['noselect', 'noselect']//['clickable button small selectedbutton noselect', 'clickable button small noselect']
                clrs[0] = color.colors.gndarkgray
            } else if (this.props.areNodesColoredByTerm && this.props.termColoring == 'annotation') {
                // buttonClasses = ['noselect', 'noselect']//['clickable button small noselect', 'clickable button small selectedbutton noselect']
                clrs[1] = color.colors.gndarkgray
            }
            var buttonTitles = this.state.pwaRunning
                ? ['Waiting for the analysis to finish', 'Waiting for the analysis to finish']
                : ['Color genes by Gene Network prediction score', 'Color genes by ' + (this.state.currentDatabase || '') + ' annotation']

            var databaseButtons = _.map(this.state.availableDatabases, function(db) {
                var cls = 'button small noselect ' + (that.state.pwaRunning ? 'disabled' : 'clickable')
                if (db.id == that.state.currentDatabase) {
                    cls += ' selectedbutton'
                }
                return (
                        <div key={db.id} onClick={that.handleDatabaseClick.bind(that, db.id)} className={cls} style={{float: 'left'}}>
                        {db.id.replace('-', ' ')}
                    </div>
                )
            })


//            var message = {These are <strong>pathways</strong})
            return (
                    <div className='vflex flexnowrap' style={this.props.style}>
                    <div className='flex00'>
                    {databaseButtons}
                </div>
                    {this.state.progress !== 100 ?
                     <span style={{padding: '10px 0'}}>
                     {this.state.pwaMessage}
                     </span> :
                     <span style={{padding: '10px 0'}}>
                     This is <strong>{this.state.currentDatabase}</strong> pathway enrichment for <strong>{this.props.group.name}.</strong>
                     </span>}
                {rows.length > 0 ? <Filter filterValue={this.state.filterValue} onChange={this.handleFilterChange} onClear={this.clearFilter} /> : null}
                    <div style={{overflow: 'auto', maxHeight: this.props.maxTableHeight}}>
                    <table className='pwatable'><tbody>{rows}</tbody></table>
                    </div>
      	            </div>
            )
        } else {
            return(<div>Loading...</div>)
        }
    }
})

var Filter = React.createClass({

    render: function() {
        
        return (
                <div className='flex00 hflex'>
                <form className='flex00' onSubmit={function(e) { e.preventDefault() }}>
                <input ref='pwfilter' type='text' name='pwfilter' placeholder='filter' autoComplete='off' value={this.props.filterValue} onChange={this.props.onChange}/>
                </form>
                {this.props.filterValue && this.props.filterValue.length > 0 ?
                 (<div style={{padding:'1px 0px 0px 3px'}} className='flex00'>
                  <svg viewBox='0 0 16 16' width='12' height='12' className='clickable delete' onClick={this.props.onClear}>
                  <line x1='2' x2='14' y1='2' y2='14' />
                  <line x1='14' x2='2' y1='2' y2='14' />
                  </svg>
                  </div>) : null}
            </div>
        )
    }
})
                              

module.exports = PWAPanel
