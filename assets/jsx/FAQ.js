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
                        <li><a href={GN.urls.faqPage + "#what-is-genenetwork"}>What is GeneNetwork?</a></li>
                        <li><a href={GN.urls.faqPage + "#what-is-gado"}>What is GADO?</a></li>
                        <li><a href={GN.urls.faqPage + "#why-cant-my-term-be-used"}>Why can’t my term be used?</a></li>
                        <li><a href={GN.urls.faqPage + "#why-is-my-term-not-found"}>Why is my term not found?</a></li>
                        <li><a href={GN.urls.faqPage + "#gene-not-found"}>My favorite candidate gene for patient is not found back in the top of the results?</a></li>
                    </ul>

                    <h3 id="what-is-genenetwork">What is GeneNetwork?</h3>
                    <p>
                        GeneNetwork is ...
                    </p>
                    <img title='GeneNetwork' style={{width: '1000px'}} src={GN.urls.main + '/images/genenetwork.png'} />


                    <h3 id="what-is-gado">What is GADO?</h3>
                    <p>
                        GADO (GeneNetwork Assisted Diagnostic Optimization) is a method that can predict phenotypic
                        consequences of genes when mutated, using public RNA-seq data of 31,499 samples. Using the
                        phenotypes of a patient denoted as Human Phenotype Ontology (HPO) terms we can prioritize genes
                        harbouring candidate mutations. This saves time interpreting identified variants and aids in
                        the discovery of new disease-causing genes.
                    </p>
                    <img title='GeneNetwork' style={{width: '800px'}} src={GN.urls.main + '/images/gado.png'} />

                    <h3 id="why-cant-my-term-be-used">Why can’t my term be used?</h3>
                    <p>
                        We do not have significant predictions for all HPO terms. Either because very few genes are
                        known for a term, or because our current dataset is unable to reliable predict back the known
                        genes for a term. In these cases, we suggest using the more generic parent terms.
                    </p>

                    <h3 id="why-is-my-term-not-found">Why is my term not found?</h3>
                    <p>
                        At the moment we don’t support searching using the synonym names of HPO terms, this will be
                        resolved in a future version. Try searching by the HPO number
                    </p>

                    <h3 id="gene-not-found">My favorite candidate gene for patient is not found back in the top of the results?</h3>
                    <p>
                        Gene expression patterns are not informative for all genes. If an expected gene is not found
                        back this is the most likely explanation.
                    </p>
                </div>
            </DocumentTitle>
        );
    }
});

module.exports = How;