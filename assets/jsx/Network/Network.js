'use strict';

var _ = require('lodash');
var async = require('async');
var AffinityPropagation = require('affinity-propagation');
var React = require('react');
var ReactDOM = require('react-dom');
var DocumentTitle = require('react-document-title');

var GroupPanel = require('./GroupPanel');
var GenePanel = require('./GenePanel');
var EdgePanel = require('./EdgePanel');
var AnalysisPanel = require('./AnalysisPanel');
var NetworkControlPanel = require('./NetworkControlPanel');
var EdgeLegend = require('./EdgeLegend');
var LegendPanel = require('./LegendPanel');
var Footer = require('../ReactComponents/Footer');
var GeneTable = require('../ReactComponents/GeneTable');

var Cookies = require('cookies-js');
var D3Network = require('../../js/D3Network.js');
var color = require('../../js/color');
var htmlutil = require('../../js/htmlutil');
var quicksort = require('../../js/sort/quicksort');

var ZOOM_SCALE = [0.05, 10];

var keyListener = function(e) {

    if (e.altKey && e.keyCode === 78) { // alt+n secret key combo easter egg idbeholdi
        this.state.network && this.state.network.toggleNegative();
        this.setState({
            hasNegatives: !this.state.hasNegatives
        })
    }
};

var network2js = function(network) {

    var time = Date.now();
    
    var js = {
        elements: {
            nodes: _.map(network.genes, function(gene) {
                return {
                    data: gene
                }
            }),
            edges: [],
            allEdges: [],
        },
        edgeValueScales: [[0, 12, 15], [0, -12, -15]],
        edgeColorScales: [['#ffffff', '#000000', '#ff3c00'], ['#ffffff', '#00a0d2', '#7a18ec']],
        buffer: network.buffer,
        pathway: network.pathway
    };

    js.elements.hashNodes = _.keyBy(js.elements.nodes, function(node) {
        return node.data.id
    });

    var numNodes = js.elements.nodes.length;

    // convert buffer to an array of Z-scores
    var dataView = new DataView(network.buffer); // DataView is big-endian by default
    var data = new Array(numNodes * (numNodes - 1) / 2); // buffer contains a symmetric matrix
    for (var i = 0; i < data.length; i++) {
        data[i] = (dataView.getUint16(i * 2) - 32768) / 1000
    }

    // get a suitable threshold for showing edges
    var dataCopy = data.slice(0);
    quicksort(dataCopy);
    js.threshold = Math.min(_.last(js.edgeValueScales[0]) - 1, dataCopy[Math.max(0, dataCopy.length - numNodes * 2)]);
    // js.threshold = Math.min(_.last(js.edgeValueScales[0]) - 1, dataCopy[Math.max(0, dataCopy.length - numNodes * 10)])

    // keep track of lone genes (not connected to another gene based on threshold)
    var isConnected = new Array(numNodes);
    for (var i = 0; i < isConnected.length; i++) {
        isConnected[i] = false
    }

    // add edges based on threshold
    var i = 0;
    for (var i1 = 0; i1 < numNodes - 1; i1++) {
        for (var i2 = i1 + 1; i2 < numNodes; i2++) {
            js.elements.allEdges.push({
                data: {
                    source: js.elements.nodes[i1].data.id,
                    target: js.elements.nodes[i2].data.id,
                    weight: data[i]
                }
            });

            if (data[i] >= js.threshold) {
                js.elements.edges.push({
                    data: {
                        source: js.elements.nodes[i1].data.id,
                        target: js.elements.nodes[i2].data.id,
                        weight: data[i]
                    }
                });
                isConnected[i1] = true;
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
    ];

    // add custom groups
    _.forEach(network.groups, function(group) {
        js.elements.groups.push({
            name: group.name,
            index_: group.id,
            nodes: group.genes,
            type: 'custom'
        });
        // add custom group information per gene to allow partial coloring in the ui
        _.forEach(group.genes, function (id) {
            if (js.elements.hashNodes[id].customGroups == undefined) {
                js.elements.hashNodes[id].customGroups = []
            }
            js.elements.hashNodes[id].customGroups.push(group.id)
        })
    });

    console.debug('Network.network2js: %d ms', (Date.now() - time));
    time = Date.now();
    
    // affinity propagation clustering
    if (numNodes > 4) {
        var preference = -32.768; // minimum possible Z-score
        var clusters = AffinityPropagation.getClusters(data, {symmetric: true, preference: preference, damping: 0.8});
        if (clusters.exemplars.length === 1) { // only one cluster found, cluster again with a higher preference
            preference = 'min'; // minimum Z-score in data
            clusters = AffinityPropagation.getClusters(data, {symmetric: true, preference: preference, damping: 0.8})        
        }

        // create cluster groups
        var clusterGroups = [];
        var clusterHash = {};
        _.forEach(clusters.exemplars, function(exemplar, i) {
            var group = {
                nodes: [],
                type: 'cluster',
                exemplar: js.elements.nodes[exemplar].data.id
            };
            clusterGroups.push(group);
            clusterHash[exemplar] = group
        });
        
        // add genes to clusters
        _.forEach(clusters.clusters, function(exemplar, i) {
            clusterHash[exemplar].nodes.push(js.elements.nodes[i].data.id)
        });

        // add cluster groups to network
        clusterGroups = _.sortBy(clusterGroups, function(group) { return -group.nodes.length });
        _.forEach(clusterGroups, function(group, i) {
            group.name = 'Cluster ' + (i + 1);
            group.index_ = i
        });
        Array.prototype.push.apply(js.elements.groups, clusterGroups);
        
        console.debug('AffinityPropagation: %d ms', (Date.now() - time))
    }
    
    // 'My selection' group has to be last for D3Network to handle it correctly // TODO fix this  
    js.elements.groups.push({
        name: 'My selection',
        nodes: [],
        type: 'auto'
    });

    // console.log('EDGES: ' + JSON.stringify(js.elements.edges))

    return js
};

var Network = React.createClass({

    propTypes: {
        data: React.PropTypes.object,
        forceToArea: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        onNodeClick: React.PropTypes.func,
    },

    getInitialState: function() {

        var coloring = 'cluster';

        var genes = {
                genes: {annotated: null, predicted: null },
                pathway: {database: null, name: null}
            };

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
            addedGenes: [],
            selectedTissue: 'data',
            selectedTerm: 'Pathway',
            showGenes: true, //set to false to see old network page
            tab: 'network',
            genes: genes,
            gpMessage: null
        }
    },
    
    loadNetworkData: function(callback) {
        
        var ids = this.props.params.ids.replace(/(\r\n|\n|\r)/g, ',');
        console.debug('Network: loading', ids);
        var data = {
            format: 'network',
            genes: ids,
        };

        io.socket.on('network', function(network) {
            this.setState({
                error: null,
                progressText: 'creating visualization'
            });
            // allow state change
            setTimeout(function() {
                // var view = new DataView(network.buffer)
                var js = network2js(network);
                this.setState({
                    data: js,
                    url: GN.urls.networkPage + network.shortURL
                });
                callback(null, js)
            }.bind(this), 10) 
        }.bind(this));
        
        io.socket.get(GN.urls.network, {genes: ids, tissue: undefined}, function(res, jwres) {
            if (jwres.statusCode !== 200) {
                this.setState({
                    error: 'Please try again later.',
                    errorTitle: jwres.statusCode
                });
                callback({name: 'Error', message: 'Couldn\'t load data'})
             } //else {
            //     console.log(res)
            // }
        }.bind(this))
    },

    createNetwork: function(data, callback) {

        var width = ReactDOM.findDOMNode(this).offsetWidth;
        var height = document.getElementById('network').offsetHeight;//ReactDOM.findDOMNode(this).offsetHeight

        var ts = new Date();
        var network = new D3Network(document.getElementById('network'), {
            width: width + 300,
            height: height,
            minZoomScale: ZOOM_SCALE[0],
            maxZoomScale: ZOOM_SCALE[1],
            labelSizeEm: 1,
            labelColor: color.colors.gnwhite,
            nodeHeight: 30,
            gravity: 0.8,
            friction: 0.1, //0.65
            charge: -80000, //10000
            distance: 10,
            onSelect: this.updateGroup,
            onEdgeSelect: this.selectEdge,
            onSelectionModeChange: this.onSelectionModeChange,
            onZoomEnd: this.checkZoomBounds,
            onProgress: this.updateProgress
        });

        this.setState({
            width: width,
            height: height,
            network: network
        });

        callback(null, data)
    },

    drawNetwork: function(data, callback) {

        var coloring = this.state.coloring;
        if (_.compact(_.filter(data.elements.groups, function(group) {
            return group.type == 'custom'
        })).length > 0 && !_.includes(this.state.coloringOptions, 'custom')) {
            this.state.coloringOptions.push({key: 'custom', label: 'My coloring'});
            coloring = 'custom';
            this.handleColoring('custom')
        } else if (coloring == 'custom') {
            coloring = 'biotype'
        }

        this.setState({
            coloring: coloring,
            activeGroup: data.elements.groups[0],
            threshold: data.threshold,
            progressText: 'creating visualization',
        });

        // allow state change
        setTimeout(function() {
            // console.log('SHOWGENES')
            // console.log(this.state.showgenes)
            // this.state.showGenes ? this.state.network.transparant() : null
            // this.state.tab !== 'network' ? this.state.network.transparant() : null
            this.state.network.draw(data);
            this.state.network.colorBy(coloring)
        }.bind(this), 10);
        callback(null)
    },

    setTissueSocketListener: function() {
        io.socket.on('network', function(network) {
            this.setState({
                error: null,
                progressText: 'creating visualization'
            });
            // allow state change
            setTimeout(function() {
                // var view = new DataView(network.buffer)
                var js = network2js(network);
                this.setState({
                    [network.tissue]: js,
                    url: GN.urls.networkPage + network.shortURL
                })
            }.bind(this), 10) 
        }.bind(this))
    },

    loadTissueData: function(tissue) {
        var ids = this.props.params.ids.replace(/(\r\n|\n|\r)/g, ',');
        io.socket.get(GN.urls.network, {genes: ids, tissue: tissue}, function(res, jwres) {
            if (jwres.statusCode !== 200) {
                this.setState({
                    error: 'Please try again later.',
                    errorTitle: jwres.statusCode
                })
            }
        }.bind(this))
    },

    loadGenes: function(callback) {
        if (this.state.data.pathway != null) {
        // if (ids.split(',').length == 1 && (ids.startsWith('REACTOME:') || ids.startsWith('HP:'))){
            console.log('Get genes from pathway database');
            $.ajax({
                url: GN.urls.pathway + '/' + this.state.data.pathway.id + '?verbose',
                dataType: 'json',
                success: function(data){
                    this.setState({
                        genes: data,
                        error: null
                    })
                }.bind(this),
                error: function(xhr, status, err){
                    if (err == 'Not Found'){
                        this.setState({
                            predictedGenes: null,
                            error: 'Term ' + termId + ' not found',
                            errorTitle: 'Error ' + xhr.status
                        })
                    } else {
                        this.setState({
                            predictedGenes: null,
                            error: 'Please try again later (' + xhr.status + ')',
                            errorTitle: 'Error ' + xhr.status
                        }) 
                    }
                }.bind(this)
            });
            callback(null)

        } else if (this.state.activeGroup.nodes.length >= 5) {
            console.log('Get genes from prediction server');

            io.socket.on('geneprediction.queueEvent', this._onIOQueueEvent);
            io.socket.on('geneprediction.result', this._onIOResult);
	        var genes = this.state.activeGroup.nodes;
            io.socket.get(GN.urls.geneprediction, {genes: genes, geneOfInterest: undefined}, function(res, jwres) {
                if (jwres.statusCode !== 200) {
                    window.alert('Please try again later.')
                }
            });
            callback(null)
        } 
    },

    _onIOQueueEvent: function(msg) {
    	console.log('onIOQueueEvent');
        if (msg.queueLength || msg.queueLength === 0) {
            var str = htmlutil.intToStr(msg.queueLength) + ' analyses';
            if (msg.queueLength === 0) str = 'Starting analysis...';
            else if (msg.queueLength < 2) str = 'Your analysis will start in a few seconds...';
            else if (msg.queueLength < 10) str = 'Your analysis will start in less than a minute, please be patient. '
                + 'You\'re ' + htmlutil.intToOrdinalStr(msg.queueLength) + ' in the queue.';
            else str = 'This will take some time as our servers are busy right now, please be patient. '
                + 'You\'re ' + htmlutil.intToOrdinalStr(msg.queueLength) + ' in the queue.';
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

			var genes = {
                genes: {annotated: null, predicted: msg.gpResults.results },
                pathway: {database: null, name: null}
            };

            this.setState({
                gpMessage: null,
                genes: genes,
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

        this.props.onPredFinish();

        this.setState({
            gpMessage: msg.gpMessage,
            gpRunning: false
        })
    },

    componentDidMount: function() {
        async.waterfall([
            this.loadNetworkData,
            this.createNetwork,
            this.drawNetwork,
            this.loadGenes
            
        ], function(err) {
            if (err) {
                console.log(err)
            }
            else {
                this.setGeneAddSocketListeners();
                window.addEventListener('resize', this.handleResize);
                //window.addEventListener('keydown', this.keyListener)
                $(document).keydown(keyListener.bind(this))

                // io.socket.off('network')
                //load tissue data
                // setTimeout(function(){
                //     this.setTissueSocketListener()
                //     this.loadTissueData('brain')
                //     this.loadTissueData('blood')
                //     // this.state.showGenes ? this.state.network.hide() : null
                // }.bind(this), 1500)
            }
        }.bind(this));
    },

    componentWillUnmount: function() {
        console.log('Network will unmount');
        var el = this.getDOMNode();
        // this.state.network.destroy(el)
        window.removeEventListener('resize', this.handleResize);
        $(document).unbind('keydown')
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.data && nextProps.data != this.state.data) {
            this.drawNetwork(nextProps.data)
        }
    },

    handleResize: function(e) {
        var el = document.getElementById('network');
        this.state.network.resize(el.offsetWidth, el.offsetHeight)
    },
    
    setGeneAddSocketListeners: function() {
        io.socket.on('genevsnetwork.result', function(msg) {
            this.addGene(msg.gene, msg.zScores)
        }.bind(this));
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
    
    updateThreshold: function(n) {
        if (n != 0){ // if n is 0, the end of the threshold legend is reached
            var previousThreshold = this.state.threshold;
            var currentThreshold = this.state.threshold + n;
            this.state.network.updateThreshold(currentThreshold);
            this.setState({
                threshold: currentThreshold,
            });
            if (n < 0){
                // add edges
                // TODO: change data into [state.selectedtissue] to enable threshold changing for tissue-specific networks
                var edgesToBeAdded = _.filter(this.state.data.elements.allEdges, function(edge){return _.inRange(edge.data.weight, currentThreshold, previousThreshold)});
                this.state.network.addEdges(edgesToBeAdded)
            } else {
                // remove edges
                var edgesToBeRemoved = _.filter(this.state.data.elements.edges, function(edge){return _.inRange(edge.data.weight, currentThreshold, previousThreshold)});
                this.state.network.removeEdges(edgesToBeRemoved)
            }
        }
    },
    
    handleColoring: function(type) {
        var type2 = null;
        if (type == 'term') {
            type2 = 'prediction';
            // console.log('coloring by ' + type2)
            this.state.network.colorBy(type2);
            if (this.state.coloring === type) {
                this.setState({
                    termColoring: type2
                })
            } else {
                this.setState({
                    previousColoring: this.state.coloring,
                    coloring: type,
                    termColoring: type2
                })
            }
        } else {
            // console.log('coloring by ' + type)
            this.state.network.colorBy(type);
            this.setState({
                previousColoring: this.state.coloring,
                coloring: type
            })
        }
        // Cookies.set('networkcoloring', type, { expires: 365 * 24 * 60 * 60 })
    },
    
    onLegendSelect: function(filter) {
        
    },
    
    updateGroup: function(group, updateD3) {

        if (!_.isPlainObject(group)) {
            console.warn('Network.updateGroup: argument must be an object, got ' + typeof group)
        }
        updateD3 && this.state.network.highlightGroup(this.state.data.elements.groups.indexOf(group));
        this.setState({
            activeGroup: group,
            selectedEdge: null
        })
    },

    selectEdge: function(edge) {
        this.setState({
            selectedEdge: edge
        })
    },

    onAnalyse: function(group) {
        this.setState({
            analysisGroup: group
        })
    },
    
    selectTerm: function(term) {

        if (term === null) {
            _.remove(this.state.coloringOptions, function(option) {
                return option.key === 'term'
            });
            this.setState({
                selectedTerm: null
            });
            return this.handleColoring(this.state.previousColoring)
        }
        
        var geneIndices = _.map(this.state.data.elements.nodes, function(node) { return node.data.index_ });
        var ts = new Date();
        io.socket.get(GN.urls.genescores, {term: term, geneIndices: geneIndices}, function(res, jwres) {
            if (!res || !res.zScores) {
                console.error('could not get z-scores for ' + term)
            } else {
                console.debug((new Date() - ts) + 'ms: scoreRequest');
                for (var i = 0; i < res.zScores.length; i++) {
                    this.state.data.elements.nodes[i].data.zScore = res.zScores[i];
                    this.state.data.elements.nodes[i].data.annotated = res.annotations[i]
                }
                this.handleColoring('term');
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
        this.state.network.addNodeToDataAndNetwork(gene, zScores);
        this.state.network.colorBy(this.state.coloring);
        var addedGenes = this.state.addedGenes.slice(0);
        addedGenes.push(gene.id);
        if (this.state.coloring == 'zscore' && this.state.selectedTerm) {
            console.log('reselecting ' + this.state.selectedTerm.name);
            this.selectTerm(this.state.selectedTerm)
        }
        this.setState({
            addedGenes: addedGenes
        })
    },
    
    removeGene: function(gene) {
        this.state.network.removeGeneFromNetwork(gene.id);
        var addedGenes = this.state.addedGenes.slice(0);
        var index = addedGenes.indexOf(gene.id);
        if (index > -1) {
            addedGenes.splice(index, 1);
            this.setState({
                addedGenes: addedGenes
            })
        }
    },
    
    download: function(format) {
        var elem = document.getElementById('networksvg');
        var xml = (new XMLSerializer()).serializeToString(elem);
        var form = document.getElementById('gn-network-svgform');
        form['format'].value = format;
        form['data'].value = xml;
        form.submit()
    },
    
    onSelectionModeChange: function(type) {
        this.state.network.setSelectionMode(type);
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
        var newScale = this.state.network.tweenZoom(factor, 200);
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
    
    handleTissueHover: function(hoverTissue) {
        this.setState({
            hoverTissue: hoverTissue
        })
    },

    handleTissueClick: function(selectedTissue) {
        var tissue = selectedTissue === this.state.selectedTissue ? 'data' : selectedTissue;
        var threshold = this.state[tissue].threshold;
        this.state.network.toggleNetwork(this.state[tissue]);
        this.setState({
            selectedTissue: tissue,
            threshold: threshold
        }) 
        // this.state.network.colorBy(this.state.coloring)
    },

    handleEdgeHover: function(hoverEdge){
        this.setState({
            hoverEdge: hoverEdge
        })
    },

    onTabClick: function(type) {
        // Cookies.set('tab', type);
        this.setState({
            tab: type
        });
        type == 'network' ? this.state.network.show() : this.state.network.hide()
    },

    render: function() {
        var pageTitle = this.state.error ? this.state.errorTitle : 'Loading' + GN.pageTitleSuffix;
        if (!this.state.progressDone || !this.state.data) {
            return (
                    <DocumentTitle title={pageTitle}>
                    <div className='flex10 vflex'>
                    <div>
                        <div id='networkdesc'>
                            <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px'}}>
                                <div className='gn-term-description-inner hflex flexcenter maxwidth'>
                                    <div className='gn-term-description-name'>
                                        <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.5em'}}>Loading</span>
                                    </div>
                                    <div className='flex11' />
                                    <div className='gn-term-description-stats' style={{textAlign: 'right'}}>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {this.state.showGenes ? 

                            <div id='networkdesc' style={{paddingTop: '10px'}}>
                            <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px 20px 10px 20px', height: '40px'}}>
                            </div>
                        </div>

                         : null}
                    </div>


                    <div id='network' className='flex10 hflex gn-network' style={{position: 'relative', backgroundColor: color.colors.gnwhite, minHeight: '400px'}}>
                    <div id='loadcontainer' className='vflex flexcenter flexjustifycenter fullwidth'>
                    <span>{this.state.error || this.state.progressText}</span>
                    </div>
                    </div>
                    </div>
                    </DocumentTitle>
            )

        } else {

            pageTitle = this.state.data.elements.nodes.length + ' genes' + GN.pageTitleSuffix;
            var title = this.state.data.pathway != null ? (this.state.data.pathway.database + ': ' + this.state.data.pathway.name) : null;
            var predictedgenes = (
                    <div>
                        <div className='gn-term-container-outer' style={{backgroundColor: color.colors.gnwhite}}>
                        <div className='gn-term-container-inner maxwidth' style={{padding: '20px'}}>                        
                            <GeneTable genes={this.state.genes.genes.predicted ? this.state.genes.genes.predicted : null} type='prediction' gpMessage={this.state.gpMessage}/>
                        </div>
                        </div>
                        <Footer />
                    </div>
                );
            var annotatedgenes = (
                <div>
                    <div className='gn-term-container-outer' style={{backgroundColor: color.colors.gnwhite}}>
                        <div className='gn-term-container-inner maxwidth' style={{padding: '20px'}}>                        
                            <GeneTable genes={this.state.genes.genes.annotated ? this.state.genes.genes.annotated : null} type='annotation' />
                        </div>
                        </div>
                        <Footer />
                </div>
                );

            var network = (
                <div id='network' className='flex10 hflex gn-network' style={{position: 'relative', backgroundColor: color.colors.gnwhite, minHeight: '400px'}}>
                                    
                      <NetworkControlPanel download={this.download} onSelectionModeChange={this.onSelectionModeChange} selectionMode={this.state.selectionMode} isZoomedMax={this.state.isZoomedMax} isZoomedMin={this.state.isZoomedMin} onZoom={this.onZoom} />  
                        <EdgeLegend threshold={this.state.threshold} edgeValueScales={this.state.data.edgeValueScales} edgeColorScales={this.state.data.edgeColorScales} onMouseOver={this.handleEdgeHover} hoverEdge={this.state.hoverEdge} onClick={this.updateThreshold} />
                        
                    {this.state.selectedEdge ?
                     (<EdgePanel edge={this.state.selectedEdge} />)
                     :
                     this.state.activeGroup.nodes.length === 1 ?
                     (<GenePanel gene={this.state.data.elements.nodes[this.state.network.getNodeById(this.state.activeGroup.nodes[0])].data}
                      coloring={this.state.coloring} />) : null}
                    
                        <LegendPanel data={this.state.data} coloring={this.state.coloring} termColoring={this.state.termColoring}
                    coloringOptions={this.state.coloringOptions} onColoring={this.handleColoring} />

                        <div className='gn-network-panelcontainer noselect smallscreensmallfont'>
                        
                                <GroupPanel data={this.state.data}
                            activeGroup={this.state.activeGroup}
                            coloring={this.state.coloring}
                            onGroupClick={this.updateGroup}
                            onAnalyse={this.onAnalyse}
                            style={{maxHeight: 1 / 3 * this.state.height - 30, paddingRight: '0px'}}
                                />
                                
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
                    
                    <form id='gn-network-groupform' method='post' encType='multipart/form-data' action={GN.urls.tabdelim}>
                    <input type='hidden' id='genes' name='genes' value='' />
                    <input type='hidden' id='groups' name='groups' value='' />
                    <input type='hidden' id='edges' name='edges' value='e' />
                    <input type='hidden' id='what' name='what' value='groups' />
                    </form>
                    
                    <form id='gn-network-pwaform' method='post' encType='multipart/form-data' action={GN.urls.tabdelim}>
                    <input type='hidden' id='data' name='data' value='' />
                    <input type='hidden' id='name' name='name' value='' />
                    <input type='hidden' id='db' name='db' value='' />
                    <input type='hidden' id='genes' name='genes' value='' />
                    <input type='hidden' id='testType' name='testType' value='' />
                    <input type='hidden' id='what' name='what' value='pwa' />
                    </form>
                    
                    <form id='gn-network-gpform' method='post' encType='multipart/form-data' action={GN.urls.tabdelim}>
                    <input type='hidden' id='data' name='data' value='' />
                    <input type='hidden' id='name' name='name' value='' />
                    <input type='hidden' id='genes' name='genes' value='' />
                    <input type='hidden' id='what' name='what' value='prediction' />
                    </form> 

                    </div>
                );

                var menu = (
                    <div id='networkdesc' style={{paddingTop: '10px'}}>
                            <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px 20px 10px 20px', height: '40px'}}>
                                <div className='gn-term-description-inner hflex flexcenter maxwidth' style={{display: 'inline'}}>
                                    <div className='gn-term-menu noselect' style={{height: '45px', display: 'inline'}}>
                                        <span style={{cursor: 'default', paddingRight: '10px'}}>SHOW</span>
                                        <div className={(this.state.tab == 'predictedgenes') ? 'clickable button selectedbutton' : 'clickable button'} onClick={this.onTabClick.bind(null, 'predictedgenes')}>
                                        PREDICTED GENES</div>
                                        <div className={(this.state.tab == 'annotatedgenes') ? 'clickable button selectedbutton' : 'clickable button'} onClick={this.onTabClick.bind(null, 'annotatedgenes')}>
                                        ANNOTATED GENES</div>
                                        <div className={(this.state.tab == 'network') ? 'clickable button selectedbutton' : 'clickable button'} onClick={this.onTabClick.bind(null, 'network')}>
                                        NETWORK</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );

                var networkdesc = (
                    <div id='networkdesc'>
                        <div className='gn-term-description-outer' style={{backgroundColor: color.colors.gnwhite, padding: '20px'}}>
                            <div className='gn-term-description-inner hflex flexcenter maxwidth'>
                                <div className='gn-term-description-name'>
                                    <span style={{fontWeight: 'bold', fontFamily: 'GG', fontSize: '1.5em'}}>{title}</span>
                                </div>

                                <div className='flex11' />
                                <div className='gn-term-description-stats' style={{textAlign: 'right'}}>
                                    {this.state.data.pathway ? "Prediction accuracy " + Math.round(this.state.data.pathway.auc * 100)/100 : null}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            return (
                    <DocumentTitle title={pageTitle}>
                    <div className='flex10 vflex'>
                    <div>
                        {this.state.showGenes ? networkdesc : 
                            <div className='gn-term-description-stats' style={{textAlign: 'left', padding: '5px'}}>
                                {this.state.data.elements.nodes.length > 4 ?
                                (<span>Link to this network: <br />{this.state.url}</span>) :
                                (<span>This network contains {htmlutil.intToStr(this.state.data.elements.nodes.length)} genes. Pathway analysis and prediction of similar genes require five or more genes.</span>)}    
                            </div>
                        }
                        {this.state.showGenes ? menu : null}
                    </div>

                    {!this.state.showGenes ? network : this.state.tab == 'predictedgenes' ? predictedgenes : this.state.tab == 'annotatedgenes' ? annotatedgenes : network}
                    
                    </div>
                </DocumentTitle>
            )
        }
    }
});

module.exports = Network;