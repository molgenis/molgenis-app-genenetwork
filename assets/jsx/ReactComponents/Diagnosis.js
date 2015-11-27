'use strict'

var _ = require('lodash')
var color = require('../../js/color')
var htmlutil = require('../htmlutil')
var genstats = require('genstats')
var prob = genstats.probability

var React = require('react')
var Router = require('react-router')
var DocumentTitle = require('react-document-title')

var SVGCollection = require('./SVGCollection')
var htmlutil = require('../htmlutil')
var color = require('../../js/color')
{/*var sorttable = require('../../js/sorttable')*/}


{/* For the Z-scorecolours in the phenotype table: */}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}


{/* For the Z-scorecolours in the phenotype table: */}

function getRGB(avg){
    var v = 1-(parseFloat(avg)/20)
    var s = 0.6 + (parseFloat(Math.abs(avg))/7)
    if (parseFloat(avg) >= 0){
        var colors = HSVtoRGB(0.0389, s, v)
        return 'rgb(' + colors.r + ',' + colors.g + ', ' + colors.b + ')'
    } else {
        var colors = HSVtoRGB(0.58, s, v)
        return 'rgb(' + colors.r + ',' + colors.g + ', ' + colors.b + ')'
    }
}


{/*Shows a table of the phenotypes used as input, with colours depending on the Z-scores: */}

var ShowPhenotypes3 = React.createClass({


    render: function() {
        var hoverZScores = this.props.hoverItem
        var rows = []

    {/* Getting the colour: */}
        for (var i = 0; i < this.props.prio.terms.length; i++) {
            var zToCol = hoverZScores ? Math.ceil(hoverZScores[i] * 60) : rowtype
            var hoverColour =  hoverZScores ? 'rgb(' + zToCol + ',255,255)' : rowtype
            var rowtype = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'
            var backgroundColour = hoverZScores ? hoverColour : rowtype
            backgroundColour = hoverZScores ? getRGB(hoverZScores[i]) : 'rgb(255,255,0)'

    {/* Coloured squares: */}
            var square =
                <div style={this.props.style} title={this.props.prio.results[i].gene.biotype}>
                <svg viewBox='0 0 10 10' width={20} height={this.props.h}>
                <rect x1='0' y1='0' width='10' height='10' style={{fill: backgroundColour}} />
                </svg>
                </div>

    {/* The actual phenotype information: */}
            rows.push(
                <tr key={this.props.prio.terms[i].term.name} className = {rowtype} >
                <td>{square}</td>
                <td style={{textAlign: 'left'}}>{this.props.prio.terms[i].term.name}</td>
                <td style={{textAlign: 'center'}}>{this.props.prio.terms[i].term.numAnnotatedGenes}</td>
                <td style={{textAlign: 'center'}}><a style={{color: color.colors.gnblack}} href={this.props.prio.terms[i].term.url} target="_blank">{this.props.prio.terms[i].term.id}</a></td>
                <td style={{textAlign: 'center'}}>{hoverZScores ? hoverZScores[i] : ""}</td>
                </tr>
                )
        }

    {/* The table itself & headers: */}
        return (
            <table className='gn-gene-table datatable' style={{width: '70%'}}>
            <tbody>
            <tr>
            <th></th>
            <th style={{textAlign: 'left'}}>PHENOTYPE</th>
            <th style={{textAlign: 'center'}}>ANNOTATED GENES</th>
            <th style={{textAlign: 'center'}}>HPO-TERM</th>
            <th style={{textAlign: 'center'}}>Z-SCORE</th>
            </tr>
            {rows}
            </tbody>
            </table>
        )
    }
})


{/* Shows a table of all of the prioritized genes: */}

var Table = React.createClass({

    render: function() {

        var phens = ""
        for (var j = 0; j < this.props.prio.terms.length; j++) {
            phens = phens.concat(this.props.prio.terms[j].term.id + ',')
        }

        var rows = []
        for (var i = 0; i < this.props.prio.results.length; i++) {
            var rowtype = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'


    {/* network urls: */}
            var phens = ""
            for (var j = 0; j < this.props.prio.terms.length; j++) {
                phens = phens.concat(this.props.prio.terms[j].term.id + ',')
            }

        {/* create networklink: */}
            var gene = "0!" + this.props.prio.results[i].gene.name
            var networkLink = GN.urls.networkPage + phens + gene

    {/* biotype squares: */}
            var square =
                <div style={this.props.style} title={this.props.prio.results[i].gene.biotype}>
                <svg viewBox='0 0 10 10' width={20} height={this.props.h}>
                <rect x1='0' y1='0' width='10' height='10' style={{fill: color.biotype2color[this.props.prio.results[i].gene.biotype] || color.colors.default}} />
                </svg>
                </div>

    {/* rows with info on genes: */}
            rows.push(
                <tr key={i} className = {rowtype} onMouseOver={this.props.onMouseOver.bind(null, this.props.prio.results[i].predicted)}>

                <td>{square}</td>                
                
                <td>{i}</td>                
                
                <td>{this.props.prio.results[i].gene.name}</td>
                
                <td style={{textAlign: 'center'}}dangerouslySetInnerHTML={{__html: htmlutil.pValueToReadable(prob.zToP(this.props.prio.results[i].weightedZScore))}}></td>

                <td style={{textAlign: 'center'}}>
                    {this.props.prio.results[i].weightedZScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}
                </td>
                
                <td style={{textAlign: 'center'}} 
                title={this.props.prio.results[i].annotated.length == 0 ? "Not annotated to any of the phenotypes." : this.props.prio.results[i].annotated}>
                    {this.props.prio.results[i].annotated.length}
                    {/*this.props.prio.results[i].annotated.length == 0 ? <SVGCollection.NotAnnotated /> : <SVGCollection.Annotated />*/}
                </td>

                <td style={{textAlign: 'center'}}> <a href={networkLink} target="_blank"><SVGCollection.NetworkIcon /></a></td>
                </tr>
            )
        }

{/* The table itself & headers: */}
        return (
            <table className='gn-gene-table datatable sortable'  style={{width: '70%'}}>
            <tbody>
                <tr>
                <th></th>
                <th></th>
                <th style={{textAlign: 'left'}}>GENE</th>
                <th style={{textAlign: 'center'}}>P-VALUE</th>
                <th style={{textAlign: 'center'}}>DIRECTION</th>
                <th style={{textAlign: 'center'}}>ANNOTATION</th>
                <th style={{textAlign: 'center'}}>NETWORK</th>
                </tr>
                {rows}
            </tbody>
            </table>
        )
    
    }
})


{/* Box for pasting a list of genes to filter the genes table: */}

var PasteBox = React.createClass({

    getInitialState: function() {
        var pasteGenes = localStorage.getItem( 'value')

        return {pasteGenes: 'Blaaaaaah'}
    },

    handlePasteGenesChange: function(e) {
        this.setState({
            value: e.target.value
        })
        console.log('handlePGC: ' + this.state.value)
    },

    handleSubmit: function(e) {
        console.log('handleSub: ' + this.state.value)
    },

/*    handleSubmit: function(e) {
        console.log(e)
/*        e.preventDefault()
        var pastedGenes = this.state.
    },
*/

    render: function() {
        var value = this.state.value
        return (
            <form onSubmit={this.handlePasteGenesChange}>
            <textarea placeholder={"\nPaste list of genes here... \n \n(Well, you could... It's not working though :) )"} value={value} onChange={this.handlePasteGenesChange} cols="50" rows="5"></textarea>
            {/*<input type="text" placeholder="Paste your list of genes here..." value={value} onChange={this.handlePasteGenesChange} size="100" /> */}
            <br></br>
            <input type="submit" value="Filter" />
            </form>

/*
            <form action="" onSubmit={this.props.onSubmit.bind(null, this.state.pasteGenes)}>

        {/* Make text-input bit bigger with <textarea> in stead of <input>? * /}

                <input type="text" placeholder="Paste your list of genes here..." value={this.state.pasteGenes} onChange={this.handlePasteGenesChange} size="100" height="100"/>
                <br></br>
                <input type="submit" value="Filter" />
            </form>
*/
        )
    }
})


var SubmitText = React.createClass({
    render: function() {
        var subList = this.props.submitList
        return (
            <p>
            {subList ? 'Submit more genes:' : 'Filter geneslist:'}
            </p>
        )
    }
})


var Diagnosis = React.createClass({

    getInitialState: function() {
        return {
            message: ''
        }
    },

    handleMouseOver: function(hoverGene) {
        this.setState({
            hoverItem: hoverGene
        })
    },
    
    componentDidMount: function() {
        this.loadData()
    },

    componentWillReceiveProps: function(nextProps) {
    },

    handleSubmit: function(submitted) {
        this.setState({
            submitList: submitted
        })
    },

    loadData: function() {
        
        $.ajax({
            url: GN.urls.prioritization + '/' + this.props.params.id + '?verbose',
            dataType: 'json',
            success: function(data) {
                this.setState({
                    data: data
                })
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(xhr)
                if (err === 'Not Found') {
                    this.setState({
                        error: 'Pathways ' + this.props.params.id + ' not found',
                        errorTitle: 'Error ' + xhr.status
                    })
                } else {
                    this.setState({
                        error: 'Please try again later (' + xhr.status + ')',
                        errorTitle: 'Error ' + xhr.status
                    })
                }
            }.bind(this)
        })
    },
    
    render: function() {

        if (!this.state.data) {
            return null
        }

        return (
		<DocumentTitle title={'Diagnosis' + GN.pageTitleSuffix}>
                <div>

                <p> test 58</p>              

                <div>{this.state.data ? <ShowPhenotypes3 prio={this.state.data} hoverItem={this.state.hoverItem} /> : 'loading'}</div>

                <div>
                <p>{this.state.data ? this.state.data.results.length + ' results for the combination of these ' + this.state.data.terms.length + ' phenotypes:' : 'loading'}</p>
                </div>

{/*     Static headers (but not the right column widths & won't work when sorting the columns):

            <div>
            <table className='gn-gene-table datatable' style={{width: '70%'}}>
            <tbody>
            <tr>
            <th></th>
            <th></th>
            <th style={{textAlign: 'left'}}>GENE</th>
            <th style={{textAlign: 'center'}}>P-VALUE</th>
            <th style={{textAlign: 'center'}}>DIRECTION</th>
            <th style={{textAlign: 'center'}}>ANNOTATION</th>
            <th style={{textAlign: 'center'}}>NETWORK</th>
            </tr>
            </tbody>
            </table>
            </div>
*/}

            <div style={{height: "400px", overflow: "auto"}}><Table prio={this.state.data} onMouseOver={this.handleMouseOver} /></div>
            <div><SubmitText submitList={this.state.submitList} /></div>
            <div><PasteBox onSubmit={this.handleSubmit} /></div>

            {console.log(this.state.value)}


            </div>
            
		</DocumentTitle>
        )
    }
})

module.exports = Diagnosis
