"use strict;"

var _ = require('lodash')
var React = require('react')

var Description = React.createClass({

    render: function() {
        return (
                <p>Use Gene Network data in your own applications or research! The Gene Network
            API provides programmatic access for reading Gene Network data. For the time being, no
            authorization is needed. Responses are available in JSON format.</p>
        )
    }
})

var Notes = React.createClass({

    render: function() {
        return (
            <div>
            <h2>General notes</h2>
                <p>One or more <strong>geneName</strong>s are required in many API calls. These can be either official gene
            names or Ensembl (ENSG) identifiers. Here TBA is list of all available gene names and identifiers.</p>
                <p>A <strong>pathwayID</strong>, used in some API calls, identifies a pathway or phenotype. These are pathways in Reactome, Gene Ontology and KEGG or phenotypes in Human Phenotype Ontology. Here TBA is a list of all available pathway and phenotype identifiers.</p>
                </div>
        )
    }
})

var Gene = React.createClass({

    render: function() {
        return (
                <div>
                <h3>Gene</h3>
                <p><code>GET {GN.urls.gene}/<strong>geneName</strong></code></p>
                <p>Get annotation and prediction information for a given gene.</p>

                <h4>Returns</h4>
                <ul>
                <li>Ensembl BioMart annotations: Ensembl identifier, gene name, biotype, chromosome, start and stop positions, strand, gene description and the BioMart release used</li>
                <li>Annotated pathways/phenotypes</li>
                <li>Predicted pathways/phenotypes</li>
                </ul>

                <h4>Parameters</h4>
                <ul>
                <li><strong>db</strong> (optional): specifies the database for which
            annotations and predictions are returned</li>
                </ul>
                <p>If <strong>db</strong> parameter is given, prediction scores for
                    all pathways/phenotypes in the given database are returned. If no <strong>db</strong> parameter is given,
            significantly predicted pathways for all databases are
            returned.</p>
                
                <h4>Example</h4>
                <p><code>GET {GN.urls.gene}/rps27l?db=GO:CC</code></p>
                <p><pre><code>tba</code></pre></p>
                </div>
        )
    }
})

var Term = React.createClass({

    render: function() {
        return (
                <div>
                <h3>Pathway / phenotype</h3>
                <p><code>GET {GN.urls.pathway}/<strong>pathwayID</strong></code></p>
                <p>Get annotation and prediction information for a given pathway or phenotype.</p>
                <h4>Returns</h4>
                <ul>
                <li>Database, name and url of the pathway/phenotype</li>
                <li>Number of genes annotated to the pathway/phenotype in the pathway/phenotype database, not in Gene Network</li>
                <li>An AUC (Area Under the Curve) value describing the prediction accuracy for the pathway/phenotype</li>
                </ul>
                <h4>Example</h4>
                <p><code>GET {GN.urls.pathway}/GO:0000302</code></p>
                <p><pre><code>tba</code></pre></p>
                </div>
        )
    }
})

var Coregulation = React.createClass({

    render: function() {
        return (
                <div>
                <h3>Coregulation</h3>
                <div>tba</div>
                </div>
        )
    }
})

var Cofunction = React.createClass({

    render: function() {
        return (
                <div>
                <h3>Cofunction</h3>
                <div>tba</div>
                </div>
        )
    }
})

var Api = React.createClass({
    
    render: function() {
        return (
                <div>
                <h2>API</h2>
                <Description />
                <Notes />
                <h2>Resources</h2>
                <Gene />
                <Term />
                <Coregulation />
                <Cofunction />
                </div>
        )
    }
})

module.exports = Api

            //         "comment": "Gene Network | Department of Genetics, University Medical Center Groningen | genenetwork.nl",
            //         "version": "0.1",
            //         "pathway": {
            //             "database": "GO:BP",
            //             "id": "GO:0000302",
            //             "name": "response to reactive oxygen species",
            //             "numAnnotatedGenes": 153,
            //             "auc": 0.81,
            //             "url": "http://amigo.geneontology.org/cgi-bin/amigo/term_details?term=GO:0000302"
            //         },
            //         "genes": {
            //             "annotated": [
            //                 {
            //                     "id": "ENSG00000002330",
            //                     "name": "BAD"
            //                 },
            //                 {
            //                     "id": "ENSG00000005381",
            //                     "name": "MPO"
            //                 },

            //                     ...

            //             ],
            //             "predicted": [
            //                 {
            //                     "id": "ENSG00000207654",
            //                     "name": "MIR128-1",
            //                     "zScore": -5.397,
            //                     "pValue": 6.8e-8
            //                 },
            //                 {
            //                     "id": "ENSG00000201542",
            //                     "name": "SNORA62",
            //                     "zScore": -5.265,
            //                     "pValue": 1.4e-7
            //                 },

            //                     ...

            //             ]
            //         }
            //     }</code></pre></p>

            //     <h3>Coregulation</h3>

            //     <p><code>GET <%= sails.config.version.mainUrl %>/api/coregulation/<strong>geneName</strong></code><br/>
            //     <code>GET <%= sails.config.version.mainUrl %>/api/coregulation/<strong>geneName1</strong>,<strong>geneName2</strong>,<strong>geneName3</strong>,...</code></p>

            //     <p>Returns coregulation scores between genes. If one gene is given,
            // coregulation scores between it and all other genes are returned. If
            //     several genes are given, coregulation scores between each pair of them
            // are returned. <strong>geneName</strong>s can be either official gene
            // names or Ensembl identifiers.</p>

            //     <h4>Example</h4>

            //     <p><code>GET <%= sails.config.version.mainUrl %>/api/coregulation/rps27l,brca1,brca2</code></p>
            //     <p><pre><code>{
            //         "comment": "Gene Network | Department of Genetics, University Medical Center Groningen | genenetwork.nl",
            //         "version": "0.1",
            //         "data": [
            //             {
            //                 "genes": [
            //                     "ENSG00000012048",
            //                     "ENSG00000139618"
            //                 ],
            //                 "correlation": 0.9069,
            //                 "pValue": 3.5e-47,
            //                 "zScore": 14.38
            //             },
            //             {
            //                 "genes": [
            //                     "ENSG00000185088",
            //                     "ENSG00000139618"
            //                 ],
            //                 "correlation": 0.1282,
            //                 "pValue": 0.081,
            //                 "zScore": 1.402
            //             },
            //             {
            //                 "genes": [
            //                     "ENSG00000185088",
            //                     "ENSG00000012048"
            //                 ],
            //                 "correlation": 0.1057,
            //                 "pValue": 0.12,
            //                 "zScore": 1.154
            //             }
            //         ]
            //     }</code></pre></p>

            //     <h3>Cofunction</h3>

            //     <p><code>GET <%= sails.config.version.mainUrl %>/api/cofunction/<strong>geneName</strong></code><br/>
            //     <code>GET <%= sails.config.version.mainUrl %>/api/cofunction/<strong>geneName1</strong>,<strong>geneName2</strong>,<strong>geneName3</strong>,...</code></p>

            //     <p>Returns cofunctionality scores between genes. If one gene is given,
            // cofunctionality scores between it and all other genes are returned. If
            //     several genes are given, cofunctionality scores between each pair of them
            // are returned. <strong>geneName</strong>s can be either official gene
            // names or Ensembl identifiers.</p>

            //     <h4>Parameters</h4>

            //     <p><strong>db</strong> (required): specifies the database or databases
            // (comma-separated) for which cofunctionality scores are calculated.</p>

            //     <h4>Example</h4>

            //     <p><code>GET <%= sails.config.version.mainUrl %>/api/cofunction/rps27l,brca1,brca2?db=GO:BP,GO:MF</code></p>
            //     <p><pre><code>{
            //         "comment": "Gene Network | Department of Genetics, University Medical Center Groningen | http://genenetwork.nl",
            //         "version": "0.1",
            //         "data": [
            //             {
            //                 "genes": [
            //                     "ENSG00000012048",
            //                     "ENSG00000139618"
            //                 ],
            //                 "correlation": 0.962
            //             },
            //             {
            //                 "genes": [
            //                     "ENSG00000185088",
            //                     "ENSG00000012048"
            //                 ],
            //                 "correlation": 0.3874
            //             },
            //             {
            //                 "genes": [
            //                     "ENSG00000185088",
            //                     "ENSG00000139618"
            //                 ],
            //                 "correlation": 0.3388
            //             }
            //         ]
            //     }</code></pre></p>
                             
