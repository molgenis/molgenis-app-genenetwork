'use strict'

var _ = require('lodash')
var React = require('react')
var DocumentTitle = require('react-document-title')
var color = require('../../js/color.js')

var Description = React.createClass({

    render: function() {
        return (
                <p>The Gene Network API provides programmatic access for reading Gene Network data using http <code>GET</code> requests. Responses are available in JSON format.</p>
        )
    }
})

var Notes = React.createClass({

    render: function() {
        return (
            <div>
            <h2>General notes</h2>
                <p>One or more <strong>geneName</strong>s are required in some API calls. These can be either official gene
            names or Ensembl (ENSG) identifiers. Here TBA is list of all available gene names and identifiers.</p>
                <p>One or more <strong>termId</strong>s are required in some API calls. These are identifiers for pathways in Reactome and Gene Ontology or phenotypes in Human Phenotype Ontology. Here TBA is a list of all available pathway and phenotype identifiers.</p>
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
                <li><strong>verbose</strong> (optional): if given, additional information of annotated and predicted pathways/phenotypes is returned</li>
                </ul>
                <p>If <strong>db</strong> parameter is given, prediction scores for
                    all pathways/phenotypes in the given database are returned. If no <strong>db</strong> parameter is given,
            significantly predicted pathways for all databases are
            returned.</p>
                
                <h4>Examples</h4>
                <p><code>GET {GN.urls.gene}/rps27l</code></p>
                <p><code>GET {GN.urls.gene}/rps27l?db=GO-CC&verbose</code></p>
                </div>
        )
    }
})

var Term = React.createClass({

    render: function() {
        return (
                <div>
                <h3>Pathway / phenotype</h3>
                <p><code>GET {GN.urls.pathway}/<strong>termId</strong></code></p>
                <p>Get annotation and prediction information for a given pathway or phenotype.</p>

                <h4>Parameters</h4>
                <ul>
                <li><strong>verbose</strong> (optional): if given, additional information of annotated and predicted genes is returned</li>
                </ul>
            
                <h4>Returns</h4>
                <ul>
                <li>Database, name, url and number of annotated genes for the pathway/phenotype,
            and an AUC (Area Under the Curve) value describing the prediction accuracy for the pathway/phenotype</li>
                <li>List of annotated genes</li>
                <li>List of predicted genes</li>
                </ul>
                <h4>Examples</h4>
                <p><code>GET {GN.urls.pathway}/GO:0000302</code></p>
                <p><code>GET {GN.urls.pathway}/GO:0000302?verbose</code></p>
                </div>
        )
    }
})


var Prioritization = React.createClass({

    render: function() {
        return (
                <div>
                <h3>Prioritization</h3>
                <p><code>GET {GN.urls.prioritization}/<strong>termId1,termId2,...</strong></code></p>
                <p>Get prioritized genes for given pathways or phenotypes.</p>

                <h4>Parameters</h4>
                <ul>
                <li><strong>verbose</strong> (optional): if given, additional information of prioritized genes is returned</li>
                </ul>
            
                <h4>Returns</h4>
                <ul>
                <li>List of pathways/phenotypes found</li>
                <li>List of pathways/phenotypes not found</li>
                <li>List of prioritized genes, sorted by weighted Z-score</li>
                </ul>
                <p>In the returned gene list, the "predicted" array contains prediction Z-scores for each found pathway/phenotype. The order of the values in the array corresponds to the order of the "terms" array in the returned JSON. The "annotated" array contains the pathways/phenotypes to which the gene has been annotated, if any.</p>
                <h4>Examples</h4>
                <p><code>GET {GN.urls.prioritization}/HP:0001874,HP:0001419,HP:0002718,HP:0004313,HP:0000951</code></p>
                <p><code>GET {GN.urls.prioritization}/HP:0001874,HP:0001419,HP:0002718,HP:0004313,HP:0000951?verbose</code></p>
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
                <DocumentTitle title={'API' + GN.pageTitleSuffix}>
                <div style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '20px'}}>
                <h2>API</h2>
                <Description />
                <Notes />
                <h2>Resources</h2>
                <p></p>
                <Gene />
                <Term />
                <Prioritization />
                <Coregulation />
                <Cofunction />
                </div>
                </DocumentTitle>
        )
    }
})

module.exports = Api
