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
                        <li><a href={"#what-is-genenetwork"}>What is KidneyNetwork?</a></li>
                        <li><a href={"#what-is-gado"}>What is GADO?</a></li>
                        <li><a href={"#can-i-run-gado-locally"}>Can I run GADO locally?</a></li>
                        <li><a href={"#why-cant-my-term-be-used"}>Why can’t my term be used?</a></li>
                        <li><a href={"#why-is-my-term-not-found"}>Why is my term not found?</a></li>
                        <li><a href={"#gene-not-found"}>My favorite candidate gene for patient is not found back in the top of the results?</a></li>
                        <li><a href={"#how-to-cite"}>How to cite?</a></li>
                    </ul>

                    <h3 id="what-is-genenetwork">What is KidneyNetwork?</h3>
                    <p>
                        KidneyNetwork uses gene co-regulation to predict pathway membership and HPO term associations.
                        This is done by combining and integrating 31,499 multi-tissue public RNA-seq samples with 898 kidney-specific public RNA-seq samples.
                    </p>


                    <h3 id="what-is-gado">What is GADO?</h3>
                    <p>
                        GADO (GeneNetwork Assisted Diagnostic Optimization) is a method that can predict phenotypic consequences of genes when mutated, using KidneyNetwork.
                        Using the phenotypes of a patient denoted as Human Phenotype Ontology (HPO) terms we can prioritize genes harbouring candidate mutations.
                        This saves time interpreting identified variants and aids in the discovery of new disease-causing genes.
                    </p>


                    <h3 id="can-i-run-gado-locally">Can I run GADO locally?</h3>
                    <p>
                        We have created a standalone version of GADO that can easily be integrated in an automated analysis pipeline.
                        For more information see: <a href="https://github.com/molgenis/systemsgenetics/wiki/GADO-Command-line">GADO Command Line</a>
                    </p>

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

                    <h3 id="how-to-cite">How to cite?</h3>
                    <p>
                        <a href="https://www.medrxiv.org/content/10.1101/2021.03.10.21253054v1" target="_blank">KidneyNetwork: Using kidney-derived gene expression data to predict and prioritize novel genes involved in kidney disease</a>
                    </p>


                </div>
            </DocumentTitle>
        );
    }
});

module.exports = How;