'use strict';

var _ = require('lodash')
var React = require('react')
var ReactTabs = require('react-tabs');

var NetworkPanel = require('./NetworkPanel')
var GroupPanel = require('./GroupPanel')
var GenePanel = require('./GenePanel')
var ListPanel = require('./ListPanel')
var AnalysisPanel = require('./AnalysisPanel')
var ProgressBar = require('./ProgressBar')
var NetworkControlPanel = require('./NetworkControlPanel')
var LegendPanel = require('./LegendPanel')
var DownloadPanel = require('./DownloadPanel')
var OpenMenu = require('./OpenMenu')
var SVGCollection = require('./SVGCollection')
var Logo = require('./Logo')
var Footer = require('./Footer') 

//var gzip = require('gzip-js')
var Cookies = require('cookies-js')
var D3Network = require('../../js/D3Network.js')
var color = require('../../js/color')

var ZOOM_SCALE = [0.05, 10]

//TODO move to PWAPanel
var keyListener = function(e) {
    if (e.altKey && e.keyCode === 78) { // alt+n secret key combo easter egg idbeholdi
        this.state.njetwork && this.state.njetwork.toggleNegative()
        this.setState({
            hasNegatives: !this.state.hasNegatives
        })
    } else if (e.keyCode === 38) { // up
        if (this.state.selectedTerm && this.state.pwaResults[0].pathway != this.state.selectedTerm) {
            e.preventDefault()
            e.stopPropagation()
            var numTerms = this.state.pwaResults.length
            for (var i = 1; i < numTerms; i++) {
                if (this.state.pwaResults[i].pathway == this.state.selectedTerm) {
                    this.selectTerm(this.state.pwaResults[i-1].pathway)
                    if (this.refs.pwa && this.refs.pwa.refs && this.refs.pwa.refs.selectedrow) {
                        var offset = this.refs.pwa.refs.selectedrow.getDOMNode().offsetHeight
                        this.refs.pwa.getDOMNode().scrollTop -= offset
                    }
                    break
                }
            }
        }
    } else if (e.keyCode === 40) { // sentenced - down
        if (this.state.selectedTerm && _.last(this.state.pwaResults).pathway != this.state.selectedTerm) {
            e.preventDefault()
            e.stopPropagation()
            var numTerms = this.state.pwaResults.length
            for (var i = 0; i < numTerms - 1; i++) {
                if (this.state.pwaResults[i].pathway == this.state.selectedTerm) {
                    this.selectTerm(this.state.pwaResults[i+1].pathway)
                    if (this.refs.pwa && this.refs.pwa.refs && this.refs.pwa.refs.selectedrow) {
                        var offset = this.refs.pwa.refs.selectedrow.getDOMNode().offsetHeight
                        this.refs.pwa.getDOMNode().scrollTop += offset
                    }
                    break
                }
            }
        }
    } else if (e.keyCode === 37) { // entombed - left hand path
        if (this.state.selectedTerm && this.state.pwaResults[0].pathway != this.state.selectedTerm) {
            e.preventDefault()
            e.stopPropagation()
            var numTerms = this.state.pwaResults.length
            for (var i = 1; i < numTerms; i++) {
                if (this.state.pwaResults[i].pathway == this.state.selectedTerm) {
                    var numMoved = (i - 10 >= 0) ? 10 : i
                    this.selectTerm(this.state.pwaResults[i - numMoved].pathway)
                    if (this.refs.pwa && this.refs.pwa.refs && this.refs.pwa.refs.selectedrow) {
                        var offset = this.refs.pwa.refs.selectedrow.getDOMNode().offsetHeight
                        this.refs.pwa.getDOMNode().scrollTop -= numMoved * offset
                    }
                    break
                }
            }
        }
    } else if (e.keyCode === 39) { // right
        if (this.state.selectedTerm && _.last(this.state.pwaResults).pathway != this.state.selectedTerm) {
            e.preventDefault()
            e.stopPropagation()
            var numTerms = this.state.pwaResults.length
            for (var i = 0; i < numTerms - 1; i++) {
                if (this.state.pwaResults[i].pathway == this.state.selectedTerm) {
                    var numMoved = (i + 10 <= numTerms - 1) ? 10 : i
                    this.selectTerm(this.state.pwaResults[i + numMoved].pathway)
                    if (this.refs.pwa && this.refs.pwa.refs && this.refs.pwa.refs.selectedrow) {
                        var offset = this.refs.pwa.refs.selectedrow.getDOMNode().offsetHeight
                        this.refs.pwa.getDOMNode().scrollTop += numMoved * offset
                    }
                    break
                }
            }
        }
    }
}

var Network = React.createClass({

    propTypes: {
        data: React.PropTypes.object,
        forceToArea: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        onNodeClick: React.PropTypes.func,
    },

    getInitialState: function() {
        var coloring = Cookies.get('networkcoloring') || 'biotype'
        // coloring by term prediction/annotation not available until pathway analysis has been done
        if (coloring == 'term') coloring = 'biotype'
        console.log('Network.getInitialState: coloring: ' + coloring)
        return {
            njetwork: null,
            hasNegatives: false,
            selectionMode: 'move',
            coloring: coloring,
            coloringOptions: [
                {key: 'biotype', label: 'Biotype'},
                {key: 'chr', label: 'Chromosome'},
                {key: 'cluster', label: 'Cluster'}
            ],
            //threshold: this.props.data.threshold,
            //activeGroup: this.props.data.elements.groups[0],
            progress: {loadProgress: 0, initProgress: 0, layoutProgress: 0, done: false},
            addedGenes: []
        }
    },

    componentDidMount: function() {
        // console.log('network mount')
        var el = document.getElementById('network')//svgcontainer')
        //el.appendChild()
        // console.log(el.offsetHeight, React.findDOMNode(this).offsetHeight)
        var width = React.findDOMNode(this).offsetWidth
        var height = React.findDOMNode(this).offsetHeight
        var ts = new Date()
        var njetwork = new D3Network(el, {
            width: width,
            height: height,
            minZoomScale: ZOOM_SCALE[0],
            maxZoomScale: ZOOM_SCALE[1],
            labelSizeEm: 1,
            labelColor: color.colors.gnwhite,
            nodeHeight: 30,
            gravity: 0.8,
            charge: -10000,
            distance: 10,
            onSelect: this.updateGroup,
            onSelectionModeChange: this.onSelectionModeChange,
            onZoomEnd: this.checkZoomBounds,
            onProgress: this.updateProgress
        })
        this.setState({
            width: width,
            height: height,
            njetwork: njetwork
        })
        // d3fd.create(el, {
        //     width: that.w,
        //     height: that.h,
        //     nodeRadius: 30,
        //     labelColor: color.colors.gnwhite,
        //     labelSize: '12pt',
        //     gravity: 0.4,
        //     charge: -2000,
        //     distance: 300,
        //     updateProgress: that.updateProgress
        // }, that.updateGroup)
        this.setGeneAddSocketListeners()
        window.addEventListener('resize', this.handleResize)
        $(document).keydown(keyListener.bind(this))
    },

    componentWillUnmount: function() {
        console.log('Network will unmount')
        var el = this.getDOMNode()
        // this.state.njetwork.destroy(el)
        window.removeEventListener('resize', this.handleResize)
        $(document).unbind('keydown')
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.data && nextProps.data != this.props.data) {
            console.log('url: ' + nextProps.data.href)

            var coloring = this.state.coloring
            if (_.compact(_.filter(nextProps.data.elements.groups, function(group) {
                return group.type == 'custom'
            })).length > 0 && !_.includes(this.state.coloringOptions, 'custom')) {
                this.state.coloringOptions.push({key: 'custom', label: 'My coloring'})
                coloring = 'custom'
                this.handleColoring('custom')
            } else if (coloring == 'custom') {
                coloring = 'biotype'
            }

            var hashNodes = _.indexBy(nextProps.data.elements.nodes, function(node) {
                return node.data.id
            })
            
            this.setState({
                activeGroup: nextProps.data.elements.groups[0],
                hashNodes: hashNodes,
                threshold: nextProps.data.threshold,
                progress: {
                    loadProgress: 100,
                    initProgress: 0,
                    layoutProgress: 0
                },
                coloring: coloring,
                coloringOptions: this.state.coloringOptions
            })
            this.state.njetwork.draw(nextProps.data)
            this.state.njetwork.colorBy(coloring)
        }
    },

    handleResize: function(e) {
        var el = document.getElementById('network')
        this.state.njetwork.resize(el.offsetWidth, el.offsetHeight)
    },
    
    setGeneAddSocketListeners: function() {
        var that = this
        io.socket.on('genevsnetwork.result', function(msg) {
            that.addGene(msg.gene, msg.zScores)
        })
    },

    updateProgress: function(progress) {
        this.setState({progress: progress})
    },

    // TODO remove / fix
    removeGroup: function(groupIndex) {
        // return this.state.njetwork.removeGroup(groupIndex)
    },

    // TODO remove
    // groups: function() {
    //     return d3fd.groups()
    // },

    changeThreshold: function(threshold, oldThreshold) {
        console.log('Network.changeThreshold: TODO')
        // d3fd.changeThreshold(threshold, oldThreshold)
        this.setState({threshold: threshold})
    },
    
    handleColoring: function(type) {
        var type2 = null
        if (type == 'term') {
            type2 = Cookies.get('termcoloring') || 'prediction'
            // console.log('coloring by ' + type2)
            this.state.njetwork.colorBy(type2)
            this.setState({
                coloring: type,
                termColoring: type2
            })
        } else {
            // console.log('coloring by ' + type)
            this.state.njetwork.colorBy(type)
            this.setState({
                coloring: type
            })
        }
        Cookies.set('networkcoloring', type, { expires: 365 * 24 * 60 * 60 })
    },

    handleTermColoring: function(type) {
        if (this.refs.pwa && this.refs.pwa.state.pwaRunning) return
        // console.log('term coloring: ' + type)
        var that = this
        if (!this.state.selectedTerm) {
            this.selectTerm(this.refs.pwa.state.pwaResults[this.refs.pwa.state.currentDatabase][0].pathway, function() {
                this.state.njetwork.colorBy(type)
                Cookies.set('termcoloring', type)
                that.setState({
                    coloring: 'term',
                    termColoring: type
                })
            })
        } else {
            this.state.njetwork.colorBy(type)
            Cookies.set('termcoloring', type)
            this.setState({
                coloring: 'term',
                termColoring: type
            })
        }
    },

    onLegendSelect: function(filter) {
        
    },
    
    updateGroup: function(group, updateD3) {
        if (!_.isPlainObject(group)) {
            console.warn('Network.updateGroup: argument must be an object, got ' + typeof group)
        }
        updateD3 && this.state.njetwork.highlightGroup(this.props.data.elements.groups.indexOf(group))
        this.setState({
            activeGroup: group
        })
    },

    //TODO remove
    // updateGroup: function(groupIndex) {
    //     if (groupIndex && !_.isNumber(groupIndex)) {
    //         return console.log('Network.updateGroup(groupIndex): groupIndex (optional) must be a number')
    //     }
    //     if (groupIndex == null || groupIndex == undefined) {
    //         groupIndex = this.props.data.elements.groups.length - 1
    //     }
    //     this.setState({
    //         activeGroup: this.props.data.elements.groups[groupIndex],
    //         isGeneListShown: (this.props.data.elements.groups[groupIndex].nodes.length < 2) ? false : this.state.isGeneListShown
    //     })
    // },

    onGroupListClick: function(group) {
        return this.setState({
            isGeneListShown: !this.state.isGeneListShown
        })
    },

    onAnalyse: function(group) {
        if ((this.refs.pwa && this.refs.pwa.state.pwaRunning === true) || (this.refs.gp && this.refs.gp.state.gpRunning === true)) {
            window.alert('It seems that an analysis is already running or queued, please wait for its results first.')
        } else {
            this.setState({
                analysisGroup: group
            })
            // if (this.refs.pwa) {
            //     this.refs.pwa.pwaRequest(group)
            // } else {
            //     console.log('PWA panel not there!')
            // }
            // if (this.refs.pred) {
            //     this.refs.pred.gpRequest(group) //TODO, 'MCM3')
            // } else {
            //     console.log('Predicted genes panel not there!')
            // }
            // setTimeout(
            //     d3fd.showBackgroundRects(group), 100)
        }
    },
    
    selectTerm: function(term, callback) {
        if (!term) return
        var geneIndices = _.map(this.props.data.elements.nodes, function(node) { return node.data.index_ })
        var ts = new Date()
        var that = this
        io.socket.get(GN.urls.genescores, {term: term, geneIndices: geneIndices}, function(res, jwres) {
            if (!res || !res.zScores) {
                console.log('could not get z-scores for ' + term)
            } else {
                console.log((new Date() - ts) + 'ms: scoreRequest')
                for (var i = 0; i < res.zScores.length; i++) {
                    that.props.data.elements.nodes[i].data.zScore = res.zScores[i]
                    that.props.data.elements.nodes[i].data.annotated = res.annotations[i]
                }
                that.handleColoring('term')
                if (!_.includes(_.pluck(that.state.coloringOptions, 'key'), 'term')) {
                    that.state.coloringOptions.push({key: 'term', label: term.database === 'HPO' ? 'Phenotype' : 'Pathway'})
                }
                that.setState({
                    selectedTerm: term,
                    coloringOptions: that.state.coloringOptions,
                    // additionalColoringOptions: [
                    //     {key: 'term', label: term.database === 'HPO' ? 'Phenotype' : 'Pathway'} // TODO proper pathway/phenotype distinction
                    // ]
                })
                if (callback) callback()
            }
        })
    },

    addGeneRequest: function(gene) {
        var that = this
        io.socket.get(GN.urls.genevsnetwork,
                      {geneIndex: gene.index_,
                       geneIndices: _.map(this.props.data.elements.nodes, function(d) { return d.data.index_ })},
                      function(res, jwres) {
                          if (jwres.statusCode !== 200) {
                              that.setState({
                                  gpMessage: 'Please try again later.'
                              })
                          }
                      })
    },

    addGene: function(gene, zScores) {
        this.state.njetwork.addNodeToDataAndNetwork(gene, zScores)
        this.state.njetwork.colorBy(this.state.coloring)
        var addedGenes = this.state.addedGenes.slice(0)
        addedGenes.push(gene.id)
        if (this.state.coloring == 'zscore' && this.state.selectedTerm) {
            console.log('reselecting ' + this.state.selectedTerm.name)
            this.selectTerm(this.state.selectedTerm)
        }
        this.setState({
            addedGenes: addedGenes
        })
    },
    
    removeGene: function(gene) {
        this.state.njetwork.removeGeneFromNetwork(gene.id)
        var addedGenes = this.state.addedGenes.slice(0)
        var index = addedGenes.indexOf(gene.id)
        if (index > -1) {
            addedGenes.splice(index, 1)
            this.setState({
                addedGenes: addedGenes
            })
        }
    },
    
    download: function(format) {
        var elem = document.getElementById('networksvg')
        var xml = (new XMLSerializer()).serializeToString(elem)
        var form = document.getElementById('gn-network-svgform')
        form['format'].value = format
        form['data'].value = xml
        // var gzipped = gzip.zip(xml, {name: 'network.gz'})
        // form['data'].value = gzipped
        form.submit()
    },
    
    onSelectionModeChange: function(type) {
        this.state.njetwork.setSelectionMode(type)
        this.setState({
            selectionMode: type
        })
    },
    
    handleAnalysisPanelClose: function() {
        this.setState({
            analysisGroup: null
        })
    },

    onZoom: function(factor) {
        var newScale = this.state.njetwork.tweenZoom(factor, 200)
        this.checkZoomBounds(newScale)
    },

    checkZoomBounds: function(zoomScale) {
        if (zoomScale <= ZOOM_SCALE[0]) {
            this.setState({
                isZoomedMax: false,
                isZoomedMin: true
            })
        } else if (zoomScale >= ZOOM_SCALE[1]) {
            this.setState({
                isZoomedMax: true,
                isZoomedMin: false
            })
        } else {
            this.setState({
                isZoomedMax: false,
                isZoomedMin: false
            })
        }
    },
    
    render: function() {

        var loadText = (this.state.progress.loadProgress === 100 && this.state.progress.initProgress === 100) ? 'drawing...' : 'loading...'
        if (!this.state.progress.done || !this.props.data) {
            // console.log('network progress render')
            //<Logo ref='progresslogo' w={55} h={100} progress={[this.state.progress.loadProgress, this.state.progress.initProgress, this.state.progress.layoutProgress]} />
            return (
                    <div id='network' className='flex10 gn-network' style={{position: 'relative', backgroundColor: color.colors.gnwhite}}>
                    <span>{loadText}</span>
                    <div id='networksvgcontainer' />
                    </div>
            )
        } else {
            return (
                    <div id='network' className='flex10 gn-network' style={{position: 'relative', backgroundColor: color.colors.gnwhite}}>

                    <NetworkControlPanel download={this.download} onSelectionModeChange={this.onSelectionModeChange} selectionMode={this.state.selectionMode}
                isZoomedMax={this.state.isZoomedMax} isZoomedMin={this.state.isZoomedMin} onZoom={this.onZoom} />
                                        
                    <LegendPanel data={this.props.data} coloring={this.state.coloring} termColoring={this.state.termColoring}
                coloringOptions={this.state.coloringOptions} onColoring={this.handleColoring} />

                    <div style={{maxHeight: this.state.height - 20}} className='gn-network-panelcontainer noselect'>
                    <GroupPanel data={this.props.data}
                activeGroup={this.state.activeGroup}
                coloring={this.state.coloring}
                isGeneListShown={this.state.isGeneListShown}
                onGroupClick={this.updateGroup}
                onGroupListClick={this.onGroupListClick}
                onAnalyse={this.onAnalyse}
                style={(this.state.isGeneListShown || this.state.activeGroup.nodes.length === 1) ? {marginBottom: '10px'} : null} />
                
                {this.state.isGeneListShown ?
                 (<div className='bordered smallpadding' style={{overflow: 'hidden', backgroundColor: '#ffffff', paddingRight: '0px'}}>
                  <ListPanel geneIds={this.state.activeGroup.nodes} hashNodes={this.state.hashNodes} />
                  </div>) :
                 null
                }
                {!this.state.isGeneListShown && this.state.activeGroup.nodes.length === 1 ?
                 (<GenePanel gene={this.props.data.elements.nodes[this.state.njetwork.getNodeById(this.state.activeGroup.nodes[0])].data}
                  coloring={this.state.coloring} />) :
                 null
                }
                {this.state.analysisGroup ?
                 <AnalysisPanel
                 style={{padding: '10px 0 10px 10px', maxHeight: this.state.height - 20}}
                 onClose={this.handleAnalysisPanelClose}
                 analysisGroup={this.state.analysisGroup}
                 selectedTerm={this.state.selectedTerm}
                 termColoring={this.state.termColoring}
                 coloring={this.state.coloring}
                 onTermSelect={this.selectTerm}
                 onColoring={this.handleTermColoring}
                 onGeneAdd={this.addGeneRequest}
                 onGeneRemove={this.removeGene}
                 addedGenes={this.state.addedGenes}
                 /> : null}
                
                </div>

                    <form id='gn-network-svgform' method='post' encType='multipart/form-data' action='http://molgenis27.target.rug.nl/api/v1/svg2pdf'>
                    <input type='hidden' id='data' name='data' value='' />
                    <input type='hidden' id='format' name='format' value='' />
                    </form>
                    
                    <form id='gn-network-pwaform' method='post' encType='multipart/form-data' action='http://molgenis27.target.rug.nl/api/v1/tabdelim'>
                    <input type='hidden' id='data' name='data' value='' />
                    <input type='hidden' id='name' name='name' value='' />
                    <input type='hidden' id='db' name='db' value='' />
                    <input type='hidden' id='genes' name='genes' value='' />
                    <input type='hidden' id='testType' name='testType' value='' />
                    </form>
                    
                    <form id='gn-network-gpform' method='post' encType='multipart/form-data' action='http://molgenis27.target.rug.nl/api/v1/tabdelim'>
                    <input type='hidden' id='data' name='data' value='' />
                    <input type='hidden' id='name' name='name' value='' />
                    <input type='hidden' id='genes' name='genes' value='' />
                    </form>

                    <div id='networksvgcontainer' />

                </div>
            )
        }
        // // TODO add this
        // <div id='networkdesc'>
        // {this.props.data.elements.nodes.length > 4 ?
        //  (<span>Link to this network: {this.props.data.href}</span>) :
        //  (<span>This network contains {that.int2str(this.props.data.elements.nodes.length)} genes. Pathway analysis and prediction of similar genes require five or more genes.</span>)}
        // </div>
        
        //     <NetworkPanel data={this.props.data}
        // hasNegatives={this.state.hasNegatives}
        // threshold={this.state.threshold}
        // onThresholdChange={this.props.onThresholdChange}
            // coloring={this.state.coloring}
        // coloringOptions={this.state.coloringOptions}
        // onColoring={this.handleColoring}
        //     />

        // console.log(React.findDOMNode(this).offsetHeight + 'PX')
        
    }
})

module.exports = Network
