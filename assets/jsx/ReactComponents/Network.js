'use strict'

var _ = require('lodash')
var async = require('async')
var React = require('react')
var ReactDOM = require('react-dom')
var DocumentTitle = require('react-document-title')

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

var Cookies = require('cookies-js')
var D3Network = require('../../js/D3Network.js')
var AffinityPropagation = require('../../js/affinity-propagation/src/affinityPropagation.js')
var color = require('../../js/color')
var quicksort = require('../../js/sort/quicksort')

var ZOOM_SCALE = [0.05, 10]

var keyListener = function(e) {

    if (e.altKey && e.keyCode === 78) { // alt+n secret key combo easter egg idbeholdi
        this.state.network && this.state.network.toggleNegative()
        this.setState({
            hasNegatives: !this.state.hasNegatives
        })
    }
}

var network2js = function(network) {

    var time = Date.now()
    
    var js = {
        elements: {
            nodes: _.map(network.genes, function(gene) {
                return {
                    data: gene
                }
            }),
            edges: []
        }
    }

    js.elements.hashNodes = _.indexBy(js.elements.nodes, function(node) {
        return node.data.id
    })

    var numNodes = js.elements.nodes.length

    // convert buffer to an array of Z-scores
    var dataView = new DataView(network.buffer) // DataView is big-endian by default
    var data = new Array(numNodes * (numNodes - 1) / 2) // buffer contains a symmetric matrix
    for (var i = 0; i < data.length; i++) {
        data[i] = (dataView.getUint16(i * 2) - 32768) / 1000
    }

    // get a suitable threshold for showing edges
    var dataCopy = data.slice(0)
    quicksort(dataCopy)
    js.threshold = dataCopy[Math.max(0, dataCopy.length - numNodes * 10)]

    // keep track of lone genes (not connected to another gene based on threshold)
    var isConnected = new Array(numNodes)
    for (var i = 0; i < isConnected.length; i++) {
        isConnected[i] = false
    }

    // add edges based on threshold
    var i = 0
    for (var i1 = 0; i1 < numNodes - 1; i1++) {
        for (var i2 = i1 + 1; i2 < numNodes; i2++) {
            if (Math.abs(data[i]) >= js.threshold) {
                js.elements.edges.push({
                    data: {
                        source: js.elements.nodes[i1].data.id,
                        target: js.elements.nodes[i2].data.id,
                        weight: data[i]
                    }
                })
                isConnected[i1] = true
                isConnected[i2] = true
            }
            i++
        }
    }
    
    // add default groups
    js.elements.groups = [
        {
            name: 'All genes',
            nodes: _.map(js.elements.nodes, function(node) {
                return node.data.id
            }),
            type: 'auto'
        },
        // {
        //     name: 'Lone genes',
        //     nodes: _.compact(_.map(isConnected, function(bool, i) {
        //         return bool ? null : js.elements.nodes[i].data.id
        //     })),
        //     type: 'auto'
        // }
    ]

    // add custom groups
    _.forEach(network.groups, function(group) {
        js.elements.groups.push({
            name: group.name,
            index_: group.id,
            nodes: group.genes,
            type: 'custom'
        })
        // add custom group information per gene to allow partial coloring in the ui
        _.forEach(group.genes, function (id) {
            if (js.elements.hashNodes[id].customGroups == undefined) {
                js.elements.hashNodes[id].customGroups = []
            }
            js.elements.hashNodes[id].customGroups.push(group.id)
        })
    })

    // scales for coloring the edges
    js.edgeValueScales = [[0, 12, 15], [0, -12, -15]]
    js.edgeColorScales = [['#ffffff', '#000000', '#ff3c00'], ['#ffffff', '#00a0d2', '#7a18ec']]

    console.debug('Network.network2js: %d ms', (Date.now() - time))
    time = Date.now()
    
    // affinity propagation clustering
    var preference = -32.768 // minimum possible Z-score
    var clusters = AffinityPropagation.getClusters(data, {symmetric: true, preference: preference, damping: 0.8})
    if (clusters.exemplars.length === 1) { // only one cluster found, cluster again with a higher preference
        preference = 'min' // minimum Z-score in data
        clusters = AffinityPropagation.getClusters(data, {symmetric: true, preference: preference, damping: 0.8})        
    }

    // create cluster groups
    var clusterGroups = []
    var clusterHash = {}
    _.forEach(clusters.exemplars, function(exemplar, i) {
        var group = {
            nodes: [],
            type: 'cluster',
            exemplar: js.elements.nodes[exemplar].data.id
        }
        clusterGroups.push(group)
        clusterHash[exemplar] = group
    })
    
    // add genes to clusters
    _.forEach(clusters.clusters, function(exemplar, i) {
        clusterHash[exemplar].nodes.push(js.elements.nodes[i].data.id)
    })

    // add cluster groups to network
    clusterGroups = _.sortBy(clusterGroups, function(group) { return -group.nodes.length })
    _.forEach(clusterGroups, function(group, i) {
        group.name = 'Cluster ' + (i + 1)
        group.index_ = i
    })
    Array.prototype.push.apply(js.elements.groups, clusterGroups)
    
    console.debug('AffinityPropagation: %d ms', (Date.now() - time))

    // 'My selection' group has to be last for D3Network to handle it correctly // TODO fix this
    js.elements.groups.push({
        name: 'My selection',
        nodes: [],
        type: 'auto'
    })

    return js
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

        return {
            network: null,
            hasNegatives: false,
            selectionMode: 'move',
            coloring: coloring,
            coloringOptions: [
                {key: 'biotype', label: 'Biotype'},
                {key: 'chr', label: 'Chromosome'},
                {key: 'cluster', label: 'Cluster'}
            ],
            progressText: 'loading',
            progressDone: false,
            addedGenes: []
        }
    },
    
    loadData: function(callback) {
        
        var ids = this.props.params.ids.replace(/(\r\n|\n|\r)/g, ',')
        console.debug('loading', ids)
        var data = {
            format: 'network',
            genes: ids,
        }

        io.socket.on('network', function(network) {

            this.setState({
                error: null,
                progressText: 'creating visualization'
            })

            // allow state change
            setTimeout(function() {
                var view = new DataView(network.buffer)
                var js = network2js(network)
                this.setState({
                    data: js
                })
                callback(null, js)
            }.bind(this), 10)
            
        }.bind(this))
        
        io.socket.get(GN.urls.network, {genes: ids}, function(res, jwres) {
            if (jwres.statusCode !== 200) {
                this.setState({
                    error: 'Please try again later.',
                    errorTitle: jwres.statusCode
                })
                callback({name: 'Error', message: 'Couldn\'t load data'})
            }
        }.bind(this))
    },

    createNetwork: function(data, callback) {

        var width = ReactDOM.findDOMNode(this).offsetWidth
        var height = ReactDOM.findDOMNode(this).offsetHeight
        var ts = new Date()

        var network = new D3Network(document.getElementById('network'), {
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
            network: network
        })

        callback(null, data)
    },

    drawNetwork: function(data, callback) {
        
        var coloring = this.state.coloring
        if (_.compact(_.filter(data.elements.groups, function(group) {
            return group.type == 'custom'
        })).length > 0 && !_.includes(this.state.coloringOptions, 'custom')) {
            this.state.coloringOptions.push({key: 'custom', label: 'My coloring'})
            coloring = 'custom'
            this.handleColoring('custom')
        } else if (coloring == 'custom') {
            coloring = 'biotype'
        }

        this.setState({
            activeGroup: data.elements.groups[0],
            threshold: data.threshold,
            progressText: 'creating visualization'
        })

        // allow state change
        setTimeout(function() {
            this.state.network.draw(data)
            this.state.network.colorBy(coloring)
        }.bind(this), 10)
        
        callback(null)
    },
    
    componentDidMount: function() {

        async.waterfall([

            this.loadData,
            this.createNetwork,
            this.drawNetwork
            
        ], function(err) {
            if (err) {
                console.log(err)
            }
            else {
                this.setGeneAddSocketListeners()
                window.addEventListener('resize', this.handleResize)
                //window.addEventListener('keydown', this.keyListener)
                $(document).keydown(keyListener.bind(this))
            }
        }.bind(this))
    },

    componentWillUnmount: function() {
        console.log('Network will unmount')
        var el = this.getDOMNode()
        // this.state.network.destroy(el)
        window.removeEventListener('resize', this.handleResize)
        $(document).unbind('keydown')
    },

    componentWillReceiveProps: function(nextProps) {

        if (nextProps.data && nextProps.data != this.state.data) {
            this.drawNetwork(nextProps.data)
        }
    },

    handleResize: function(e) {
        var el = document.getElementById('network')
        this.state.network.resize(el.offsetWidth, el.offsetHeight)
    },
    
    setGeneAddSocketListeners: function() {
        io.socket.on('genevsnetwork.result', function(msg) {
            this.addGene(msg.gene, msg.zScores)
        }.bind(this))
        console.debug('geneAdd socket listener set')
    },
        
    updateProgress: function(progressText) {

        if (progressText === 'done') {
            this.setState({
                progressDone: true
            })
        } else {
            this.setState({
                progressText: progressText
            })
        }
    },

    // TODO remove / fix
    removeGroup: function(groupIndex) {
        // return this.state.network.removeGroup(groupIndex)
    },

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
            this.state.network.colorBy(type2)
            this.setState({
                coloring: type,
                termColoring: type2
            })
        } else {
            // console.log('coloring by ' + type)
            this.state.network.colorBy(type)
            this.setState({
                coloring: type
            })
        }
        Cookies.set('networkcoloring', type, { expires: 365 * 24 * 60 * 60 })
    },

    onLegendSelect: function(filter) {
        
    },
    
    updateGroup: function(group, updateD3) {
        if (!_.isPlainObject(group)) {
            console.warn('Network.updateGroup: argument must be an object, got ' + typeof group)
        }
        updateD3 && this.state.network.highlightGroup(this.state.data.elements.groups.indexOf(group))
        this.setState({
            activeGroup: group
        })
    },

    onGroupListClick: function(group) {
        return this.setState({
            isGeneListShown: !this.state.isGeneListShown
        })
    },

    onAnalyse: function(group) {
        this.setState({
            analysisGroup: group
        })
    },
    
    selectTerm: function(term, callback) {
        if (!term) return
        var geneIndices = _.map(this.state.data.elements.nodes, function(node) { return node.data.index_ })
        var ts = new Date()
        io.socket.get(GN.urls.genescores, {term: term, geneIndices: geneIndices}, function(res, jwres) {
            if (!res || !res.zScores) {
                console.log('could not get z-scores for ' + term)
            } else {
                console.log((new Date() - ts) + 'ms: scoreRequest')
                for (var i = 0; i < res.zScores.length; i++) {
                    this.state.data.elements.nodes[i].data.zScore = res.zScores[i]
                    this.state.data.elements.nodes[i].data.annotated = res.annotations[i]
                }
                this.handleColoring('term')
                if (!_.includes(_.pluck(this.state.coloringOptions, 'key'), 'term')) {
                    this.state.coloringOptions.push({key: 'term', label: term.database === 'HPO' ? 'Phenotype' : 'Pathway'})
                }
                this.setState({
                    selectedTerm: term,
                    coloringOptions: this.state.coloringOptions,
                    // additionalColoringOptions: [
                    //     {key: 'term', label: term.database === 'HPO' ? 'Phenotype' : 'Pathway'} // TODO proper pathway/phenotype distinction
                    // ]
                })
                if (callback) callback()
            }
        }.bind(this))
    },

    addGeneRequest: function(gene) {
        io.socket.get(GN.urls.genevsnetwork,
                      {geneIndex: gene.index_,
                       geneIndices: _.map(this.state.data.elements.nodes, function(d) { return d.data.index_ })},
                      function(res, jwres) {
                          if (jwres.statusCode !== 200) {
                              this.setState({
                                  error: 'Please try again later.'
                              })
                          }
                      }.bind(this))
    },

    addGene: function(gene, zScores) {
        this.state.network.addNodeToDataAndNetwork(gene, zScores)
        this.state.network.colorBy(this.state.coloring)
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
        this.state.network.removeGeneFromNetwork(gene.id)
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
        this.state.network.setSelectionMode(type)
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
        var newScale = this.state.network.tweenZoom(factor, 200)
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

        var pageTitle = this.state.error ? this.state.errorTitle : 'Loading' + GN.pageTitleSuffix
        
        if (!this.state.progressDone || !this.state.data) {
            return (
                    <DocumentTitle title={pageTitle}>
                    <div id='network' className='flex10 hflex gn-network' style={{position: 'relative', backgroundColor: color.colors.gnwhite}}>
                    <div id='loadcontainer' className='vflex flexcenter flexjustifycenter fullwidth'>
                    <span>{this.state.error || this.state.progressText}</span>
                    </div>
                    </div>
                    </DocumentTitle>
            )
        } else {
            pageTitle = this.state.data.elements.nodes.length + ' genes' + GN.pageTitleSuffix
            return (
                    <DocumentTitle title={pageTitle}>
                    <div id='network' className='flex10 gn-network' style={{position: 'relative', backgroundColor: color.colors.gnwhite}}>

                    <NetworkControlPanel download={this.download} onSelectionModeChange={this.onSelectionModeChange} selectionMode={this.state.selectionMode}
                isZoomedMax={this.state.isZoomedMax} isZoomedMin={this.state.isZoomedMin} onZoom={this.onZoom} />
                                        
                    <LegendPanel data={this.state.data} coloring={this.state.coloring} termColoring={this.state.termColoring}
                coloringOptions={this.state.coloringOptions} onColoring={this.handleColoring} />

                    <div className='gn-network-panelcontainer noselect smallscreensmallfont'>
                    <GroupPanel data={this.state.data}
                activeGroup={this.state.activeGroup}
                coloring={this.state.coloring}
                isGeneListShown={this.state.isGeneListShown}
                onGroupClick={this.updateGroup}
                onGroupListClick={this.onGroupListClick}
                onAnalyse={this.onAnalyse}
                style={(this.state.isGeneListShown || this.state.activeGroup.nodes.length === 1) ?
                       {maxHeight: 1 / 3 * this.state.height - 30, marginBottom: '10px'} :
                       {maxHeight: 1 / 3 * this.state.height - 30}} />
                
                {this.state.isGeneListShown ?
                 (<div className='bordered smallpadding' style={{overflow: 'hidden', backgroundColor: '#ffffff', paddingRight: '0px'}}>
                  <ListPanel geneIds={this.state.activeGroup.nodes} hashNodes={this.state.data.hashNodes} />
                  </div>) :
                 null
                }
                {!this.state.isGeneListShown && this.state.activeGroup.nodes.length === 1 ?
                 (<GenePanel gene={this.state.data.elements.nodes[this.state.network.getNodeById(this.state.activeGroup.nodes[0])].data}
                  coloring={this.state.coloring} />) :
                 null
                }
                {this.state.analysisGroup ?
                 <AnalysisPanel
                 style={{padding: '10px 0 10px 10px', maxHeight: 2 / 3 * this.state.height - 70}}
                 onClose={this.handleAnalysisPanelClose}
                 analysisGroup={this.state.analysisGroup}
                 selectedTerm={this.state.selectedTerm}
                 termColoring={this.state.termColoring}
                 coloring={this.state.coloring}
                 onTermSelect={this.selectTerm}
                 onGeneAdd={this.addGeneRequest}
                 onGeneRemove={this.removeGene}
                 addedGenes={this.state.addedGenes}
                 /> : null}
                
                </div>

                    <form id='gn-network-svgform' method='post' encType='multipart/form-data' action={GN.urls.svg2pdf}>
                    <input type='hidden' id='data' name='data' value='' />
                    <input type='hidden' id='format' name='format' value='' />
                    </form>
                    
                    <form id='gn-network-pwaform' method='post' encType='multipart/form-data' action={GN.urls.tabdelim}>
                    <input type='hidden' id='data' name='data' value='' />
                    <input type='hidden' id='name' name='name' value='' />
                    <input type='hidden' id='db' name='db' value='' />
                    <input type='hidden' id='genes' name='genes' value='' />
                    <input type='hidden' id='testType' name='testType' value='' />
                    </form>
                    
                    <form id='gn-network-gpform' method='post' encType='multipart/form-data' action={GN.urls.tabdelim}>
                    <input type='hidden' id='data' name='data' value='' />
                    <input type='hidden' id='name' name='name' value='' />
                    <input type='hidden' id='genes' name='genes' value='' />
                    </form>

                </div>
                    </DocumentTitle>
            )
        }
        // // TODO add this
        // <div id='networkdesc'>
        // {this.state.data.elements.nodes.length > 4 ?
        //  (<span>Link to this network: {this.state.data.href}</span>) :
        //  (<span>This network contains {that.int2str(this.state.data.elements.nodes.length)} genes. Pathway analysis and prediction of similar genes require five or more genes.</span>)}
        // </div>
        
        //     <NetworkPanel data={this.state.data}
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
