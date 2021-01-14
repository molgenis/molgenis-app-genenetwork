var React = require('react');
var DocumentTitle = require('react-document-title');
var color = require('../js/color.js');

var How = React.createClass({
    render: function() {
        return (
            <DocumentTitle title={'FAQ' + GN.pageTitleSuffix}>
                <div style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '20px'}}>
                    <h2 style={{marginBottom: '10px'}}>FAQ</h2>

                    <ul>
                        <li><a href={"#what-is-genenetwork"}>What is GeneNetwork?</a></li>
                        <li><a href={"#gene-not-found"}>My favorite candidate gene for patient is not found back in the top of the results?</a></li>
                        <li><a href={"#how-to-cite"}>How to cite?</a></li>
                    </ul>

                    <h3 id="what-is-genenetwork">What is GeneNetwork?</h3>
                    <p>
                        GeneNetwork uses gene co-regulation to predict pathway membership and HPO term associations.
                        This is done by integrating 31,499 public RNA-seq sample.
                    </p>
                    <img title='GeneNetwork' style={{width: '1000px'}} src={GN.urls.main + '/images/genenetwork.png'} />

                    <h3 id="gene-not-found">My favorite candidate gene for patient is not found back in the top of the results?</h3>
                    <p>
                        Gene expression patterns are not informative for all genes. If an expected gene is not found
                        back this is the most likely explanation.
                    </p>

                    <h3 id="how-to-cite">How to cite?</h3>
                    <p>
                        <a href="https://www.nature.com/articles/s41467-019-10649-4" target="_blank">Improving the diagnostic yield of exome-sequencing, by predicting gene-phenotype
                            associations using large-scale gene expression analysis</a>
                    </p>


                </div>
            </DocumentTitle>
        );
    }
});

module.exports = How;