'use strict';

var _ = require('lodash');
var React = require('react');
var DocumentTitle = require('react-document-title');
var color = require('../../js/color.js');
var Select = require('react-select');
var Async = Select.Async;
var reactable = require('reactable');
var Tr = reactable.Tr;
var Td = reactable.Td;
var Th = reactable.Th;
var Thead = reactable.Thead;
var Table = reactable.Table;

var SVGCollection = require('./SVGCollection');
var UploadPanel = require('./UploadPanel');
var Back = require('./Back');

var TermTable = React.createClass({

    componentDidUpdate: function() {
        // var terms = this.props.terms
        // if (!terms.length < 1){
        //     var lastTerm = terms.slice(-1)[0]
        //     var row = document.getElementById(lastTerm.value)
        //     row.scrollIntoView()
        // }
    },

    render: function() {

        var terms = this.props.terms;
        var rows = [];

        if (terms.length < 1){
            rows.push(
                <Tr id='no-term-selected' key='no-term-selected'>
                    <Td column="TERM" className='text'>
                        <span style={{color: color.colors.gngray, fontStyle: 'italic'}}>No terms selected</span>
                    </Td>
                    <Td column="ID" style={{whiteSpace: 'nowrap', textAlign: 'center'}} data=''></Td>
                    <Td column="REMOVE" data=''></Td>
                </Tr>
            )
        } else {
            _.map(terms, function(term){
                rows.push(
                    <Tr id={term.value} key={term.value}>
                        <Td column="TERM" style={{width: '100%'}} className='text' data={term.name}></Td>
                        <Td column="ID" style={{whiteSpace: 'nowrap', minWidth: '110px', textAlign: 'center'}} data={term.value}></Td>
                        <Td column="REMOVE" style={{minWidth: '80px', textAlign: 'center'}}><span className='clickable' style={{color: "red", fontWeight: "bold"}} onClick={this.props.removeTerm.bind(null, term.value)}>X</span></Td>
                    </Tr>
                )
            }.bind(this))
        }

        return (
            <div>
                <Table id='hpo-table' className='table rowcolors' style={{margin: '0px 0 30px 0'}}>
                    <Thead>
                    <Th column="TERM" style={{width: '100%'}}>TERM</Th>
                    <Th column="ID" style={{minWidth: '110px', textAlign: 'center'}}>ID</Th>
                    <Th column="REMOVE" style={{minWidth: '80px', textAlign: 'center'}}></Th>
                    </Thead>
                    {rows}
                </Table>

            </div>
        )
    }
});

var DiagnosisMain = React.createClass({

    getInitialState: function() {
        return {
            isOpen: false,
            selectedTerms: Array(),
            termsNotFound: Array(),
            checkbox: false,
            genefilename: 'CHOOSE A FILE...',
            termfilename: 'CHOOSE A FILE...'
        }
    },

    getSuggestions: function(input, callback) {

        if (!input || input.length < 2) {
            return callback(null, {})
        }

        io.socket.get(GN.urls.diagnosisSuggest,
            {
                q: input
            },
            function(res, jwres) {
                if (jwres.statusCode === 200) {
                    var options = _.compact(_.map(res, function(result) {
                        return {
                            value: result._source.id,
                            label: result._source.name + ' - ' + result._source.id,
                            name: result._source.name,
                            isSignificantTerm: result._source.isSignificantTerm
                        }
                    }));
                    //var sorted = _.chain(options)
                    //    .sortBy(function(item){return item.label}) //sorts on name of gene/term/network
                    //    .value();
                    return callback(null, {options: options, complete: false})
                } else {
                    return callback(null, {})
                }
            })
    },

    onSelectChange: function(selectedOption, callback) {
        if (!selectedOption.isSignificantTerm) {
            io.socket.get(GN.urls.diagnosisParentTerms, { id: selectedOption.value },
                function(res, jwres) {

                    res.forEach(function(obj) { obj.selected = true; });

                    this.setState({
                        isOpen: true,
                        parentTerms: res,
                        modalTerm: selectedOption
                    })
                }.bind(this));
        } else {
            var terms = this.state.selectedTerms;
            terms.push({value: selectedOption.value, name: selectedOption.name});
            terms = _.uniqBy(terms, 'value');
            this.setState({
                selectedTerms: terms
            })
        }
    },

    removeTerm: function(value) {
        var terms = _.filter(this.state.selectedTerms, function(term){
            return term.value != value
        });
        this.setState({
            selectedTerms: terms
        })
    },

    onCheckboxClick: function(){
        var checkbox = this.state.checkbox ? false : true;
        this.setState({
            checkbox: checkbox
        })
    },

    onTextAreaChange: function(){
        var textlen = document.getElementById('textarea-genelist').value.length;
        var checkbox = textlen > 0 ? true : false;
        this.setState({
            checkbox: checkbox
        })
    },

    onGeneFileUploadClick: function() {
        document.getElementById('file-genelist').onchange = function(){
            var genefilename = document.getElementById('file-genelist').files[0].name;
            genefilename = genefilename.length > 30 ? (genefilename.slice(0, 15) + '...') : genefilename;
            this.setState({
                genefilename: genefilename,
                checkbox: true
            })
        }.bind(this)
    },

    digestHpoTermsFromUpload: function (terms, i = 0) {
        if (terms.length > i) {
            var term = terms[i];
            console.log(term);
            i++;
            this.digestHpoTermsFromUpload(terms, i);
        }

        // for (var i = 0; i < terms.length; i++){
        //     var term = terms[i];
        //     console.log(term);
        //
        //     io.socket.get(GN.urls.diagnosisSuggest,
        //         {
        //             q: term
        //         },
        //         function(res, jwres) {
        //             if (jwres.statusCode === 200) {
        //                 var options = _.compact(_.map(res, function(result) {
        //                     return {
        //                         value: result._source.id,
        //                         label: result._source.name + ' - ' + result._source.id,
        //                         name: result._source.name,
        //                         isSignificantTerm: result._source.isSignificantTerm
        //                     }
        //                 }));
        //
        //                 if (options.length === 1) {
        //                     this.onSelectChange(options[0])
        //                 } else {
        //                 }
        //             } else {
        //             }
        //         }.bind(this)
        //     )}
    },

    onTermFileUploadClick: function(){
        document.getElementById('file-termlist').onchange = function(){
            var termfile = document.getElementById('file-termlist').files[0];
            var fd = new FormData();
            fd.append('genelist', termfile);
            $.ajax({
                url: GN.urls.fileupload,
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data) {
                    var terms = data.split(',');
                    this.digestHpoTermsFromUpload(terms);
                }.bind(this)
            })
        }.bind(this)
    },

    onSubmit: function(){
        var genes = document.getElementById('textarea-genelist').value;
        var terms = _.map(this.state.selectedTerms, function(term){ return term.value }).join(',');
        var useCustomGeneSet = this.state.checkbox ? true : false;
        var genefile = document.getElementById('file-genelist').files[0];

        if (!genefile){
            this.props.history.pushState({
                genes: genes,
                useCustomGeneSet: useCustomGeneSet
            }, GN.urls.diagnosisPage + '/' + terms)
        } else {
            var fd = new FormData();
            fd.append('genelist', genefile);

            $.ajax({
                url: GN.urls.fileupload,
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data){
                    this.props.history.pushState({
                        genes: data,
                        useCustomGeneSet: useCustomGeneSet
                    }, GN.urls.diagnosisPage + '/' + terms)
                }.bind(this)
            })
        }
    },

    onSubmitModal: function() {
        var selectedParentTerms = this.state.parentTerms
            .filter(o =>  {return o.selected;})
            .map(o => ({ value: o.id, name: o.name }));

        var terms = this.state.selectedTerms;

        terms = terms.concat(selectedParentTerms);
        terms = _.uniqBy(terms, 'value');

        this.setState({
            isOpen: !this.state.isOpen,
            selectedTerms: terms
        })
    },

    handleTermClick: function(event) {
        var parentTerms = this.state.parentTerms;
        var term = parentTerms.filter(function( obj ) {
            return obj.id === event.target.value;
        })[0];
        term.selected = !term.selected;

        this.setState({ parentTerms: parentTerms });
    },

    onCancelModal: function() {
        this.setState({
            isOpen: false,
            parentTerms: null
        })
    },

    renderModal: function () {
        if (this.state.isOpen) {
            const backdropStyle = {
                position: 'absolute',
                zIndex: '1',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: 50
            };

            const modalStyle = {
                backgroundColor: '#fff',
                maxWidth: 500,
                minHeight: 200,
                margin: '0 auto',
                padding: 30
            };

            const terms = this.state.parentTerms.map(term => {
                return (
                    <tr>
                        <td>
                            <input onClick={this.handleTermClick} type='checkbox' name={term.name} key={term.id}
                                   value={term.id} ref={term.id} checked={ term.selected }  />
                        </td>
                        <td className='text'>{term.id}</td>
                        <td className='text'>{term.name}</td>
                        {/*<td className='text'>{term.depth}</td>*/}
                    </tr>
                );
            });

            return <div style={backdropStyle}>
                <div  style={modalStyle}>
                    <h2 style={{display: 'inline'}}>Unable to use this phenotype</h2>
                    <h3 style={{color: '#999999'}}>{this.state.modalTerm.name}</h3>

                    <div style={{margin: '15px 10px 10px 10px', padding: '8px', backgroundColor: color.colors.gnyellow, fontSize: '11pt',  fontWeight: 'bold' }}>
                        This term ({this.state.modalTerm.value}, {this.state.modalTerm.name}) cannot be used for gene prioritization.
                        {
                            terms.length > 1 ?
                            <span> We suggest using the combination of the more generic HPO terms listed below.</span>
                            : <span> We suggest using the more generic HPO term listed below.</span>
                        }
                    </div>

                    <form>
                        <table className='rowcolors table'>
                            <thead>
                            <tr>
                                <th style={{width: '5%'}} />
                                <th className='tabletextheader' style={{width: '10%'}}>TERM</th>
                                <th className='tabletextheader' style={{width: '60%'}}>NAME</th>
                                {/*<th className='tabletextheader' style={{width: '10%'}}>DEPTH</th>*/}
                            </tr>
                            </thead>
                            <tbody>
                                {terms}
                            </tbody>
                        </table>

                    </form>

                    {
                        terms.length > 1 ?
                            <span onClick={this.onSubmitModal} className='button noselect clickable' style={{marginTop: '20px'}}>ADD TERMS</span>
                            : <span onClick={this.onSubmitModal} className='button noselect clickable' style={{marginTop: '20px'}}>ADD TERM</span>
                    }
                    <span onClick={this.onCancelModal} className='button noselect clickable' style={{marginTop: '20px', marginLeft: '5px'}}>CANCEL</span>

                </div>
            </div>
        }
    },

    render: function() {
        var textcolor = this.state.checkbox ? '#000' : color.colors.gngray;
        var style = this.state.checkbox ? {transition: 'all .5s ease-in-out', height: '100px', overflow: 'hidden'} : {transition: 'all .5s ease-in-out', overflow: 'hidden', height: '0px'};
        var textsize = {fontSize: '10pt'};


        // <div id='step1' className='hflex'>

        //                     <div style={{width: '40px'}}><h2>1.</h2></div>

        //                     <div id='step1content' style={{width: '100%',  paddingTop: '4px'}}>


        return (
            <DocumentTitle title={'Diagnosis' + GN.pageTitleSuffix}>

                <div>
                    {this.renderModal()}
                    <div className='flex10' style={{ backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '40px'}}>

                        <div style={{width: '100%'}}>
                            <h2 style={{display: 'inline'}}>GADO: GeneNetwork Assisted Diagnostic Optimization</h2> <Back url={GN.urls.main} />
                            <h4>Using the HPO gene prioritization it is possible to rank genes based on a patient’s phenotypes.</h4>
                        </div>

                        <div className='hflex' style={{marginTop: '40px'}}>
                            <div className='' style={{width: '55%', minWidth: '600px', paddingRight: '60px'}}>
                                <ol className='simple-list'>
                                    <li><h3>Select HPO terms</h3>

                                        <div className='hflex' style={{paddingTop: '20px'}}>
                                            <div className='flex10' style={{float: 'left', paddingBottom: '20px', width: 'calc(100% - 200px)'}}>

                                                <Async
                                                    name='diagnosis-search'
                                                    autoload={false}
                                                    cacheAsyncResults={false}
                                                    loadOptions={this.getSuggestions}
                                                    onChange={this.onSelectChange}
                                                />

                                            </div>
                                            {/*<div className='flex10'>*/}
                                                {/*<label htmlFor='file-termlist' onClick={this.onTermFileUploadClick} style={{float: 'right'}}>*/}
                                                    {/*<UploadPanel text={this.state.termfilename} />*/}
                                                {/*</label>*/}
                                            {/*</div>*/}
                                        </div>

                                        <TermTable terms={this.state.selectedTerms} removeTerm={this.removeTerm}/>

                                    </li>

                                    <li>
                                        <label htmlFor="checkbox" onClick={this.onCheckboxClick} style={{position: 'absolute'}}>
                                            <SVGCollection.CheckBox selected={this.state.checkbox}/>
                                        </label>


                                        <div><h3 style={{paddingLeft: '30px', color: textcolor, cursor: 'pointer'}} onClick={this.onCheckboxClick}>OPTIONAL: filter output on candidate genes</h3></div>

                                        <input type="checkbox" id="checkbox" style={{display: 'none'}}/>

                                        <div style={style} className='hflex'>
                                            <div className='flex10' style={{paddingTop: '20px', width: 'calc(100% - 200px)'}}>
                                                <textarea id="textarea-genelist" placeholder='Paste a list of genes here...' onChange={this.onTextAreaChange} cols="40" rows="5" className='textarea-genes' style={{width: '100%', height: '65px', border: '1px solid ' + color.colors.gngray, color: textcolor, outline: 'none'}}></textarea>
                                            </div>
                                            {/*<div className='flex10' style={{paddingTop: '20px'}}>*/}
                                                {/*<label htmlFor='file-genelist' onClick={this.onGeneFileUploadClick} style={{float: 'right'}}>*/}
                                                    {/*<UploadPanel text={this.state.genefilename} />*/}
                                                {/*</label>*/}
                                            {/*</div>*/}
                                        </div>
                                    </li>

                                    <form encType='multipart/form-data'>
                                        <input id="file-genelist" type="file" style={{display: 'none'}}/>
                                    </form>

                                    <form encType='multipart/form-data'>
                                        <input id="file-termlist" type="file" style={{display: 'none'}}/>
                                    </form>



                                    <span onClick={this.onSubmit} className='button noselect clickable' style={{marginTop: '20px'}}>Prioritize genes for given HPO terms</span>

                                </ol>
                            </div>

                            <div id='text-right' style={{width: '45%', padding: '20px', backgroundColor: color.colors.gnyellow, lineHeight: '1'}}>

                                <ol className='simple-list'>
                                    <li>
                                        <span style={textsize}>
                                            Fill in the phenotypes of a patient as HPO terms
                                            (<a href='http://compbio.charite.de/hpoweb/showterm?id=HP:0000118' className='externallink' target='_blank'>compbio.charite.de/hpoweb/showterm?id=HP:0000118</a>).
                                            Try to be as specific as possible, if a term cannot be used then a more generic can be selected.
                                            If the exact phenotype of a patient is unclear it is better to use a more general term, as a wrongly assigned
                                            specific term might hinder accurate ranking. For example, there are many subclasses of seizures
                                            (<a href='http://compbio.charite.de/hpoweb/showterm?id=HP:0001250' className='externallink' target='_blank'>compbio.charite.de/hpoweb/showterm?id=HP:0001250</a>),
                                            if it clear that a patient shows a specific subclass then the HPO term for this subclass should be used, if
                                            this is not clear then it is best to use the general seizures term. It is also best to only use distinct HPO
                                            terms to describe a patient’s phenotypes. If two close related terms are used to describe the same phenotype,
                                            then these will result in some bias towards this phenotype in the prioritization. Please use the HPO number
                                            or the primary name, synonyms are not supported at the moment.
                                        </span>
                                    </li>
                                    <li>
                                        <span style={textsize}>
                                            Optional list of genes to be ranked using the HPO terms. This could for instance be the genes in which a patient
                                            has candidate disease causing mutations that require classification or follow-up analysis. The genes that prioritize
                                            on top are the most likely candidates based on our HPO term predictions. If no gene list is provided we will simply
                                            rank all genes based on the provided HPO terms.
                                        </span>
                                    </li>
                                </ol>

                                See the <a href="/faq" target="blank">FAQ page</a> for additional support
                            </div>

                        </div>
                    </div>
                </div>

            </DocumentTitle>
        )
    }
});

module.exports = DiagnosisMain;
