var React = require('react');
var DocumentTitle = require('react-document-title');
var color = require('../js/color.js');

var Disclosure = React.createClass({
    render: function() {
        return (
            <DocumentTitle title={'DISCLOSURE' + GN.pageTitleSuffix}>
                <div style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '20px'}}>
                    <h2 style={{marginBottom: '10px'}}>Disclosure / terms of use</h2>

                    <p>
                        The full results from MetaBrain are available for download. By using this website or downloading these data, you and your collaborators (“investigators”) signify your assent to all of the following conditions:
                    </p>
                    <ol>
                        <li>These data are provided on an “AS-IS” and “AS-AVAILABLE” basis for scientific research and educational use only; without warranty of any type, expressed or implied (including but not limited to any warranty as to their performance, merchantability, or fitness for any particular purpose); and without warranty as to the accuracy, completeness, currency or reliability of any content available through this website.</li>
                        <li>Use of this website and the content available on this website is at investigators’ sole risk. Investigators are responsible for taking all necessary precautions to ensure that any content you may obtain from the website is free of viruses.</li>
                        <li>MetaBrain results cannot be re-distributed for any purpose.</li>
                        <li>Investigators certify that they are in compliance with all applicable local, state, and federal laws and/or regulations and institutional policies regarding use of this data (e.g., including regarding human subjects and genetics research).</li>
                        <li>Investigators will cite the appropriate MetaBrain publication reference(s) when presenting or publishing on results based (directly or indirectly) on this data. (Please refer to references listed below.)</li>
                        <li>Investigators will never attempt to identify any participant.</li>
                    </ol>

                    <p>
                        Please complete the form with your Full Name, Email, Institution and a brief description of what the data will be used for. By submitting the request for download form and downloading the data, you are agreeing to the aforementioned terms.
                    </p>

                    <h3 id="how-to-cite">How to cite</h3>
                    <ol>
                            <li>MetaBrain: <a href="https://www.biorxiv.org/content/10.1101/2021.03.01.433439v2" target="_blank">Brain expression quantitative trait locus and network analysis reveals downstream effects and putative drivers for brain-related diseases.</a>, de Klein <i>et al.</i>, bioRxiv 2021, <a href="https://doi.org/10.1101/2021.03.01.433439" target="_blank">https://doi.org/10.1101/2021.03.01.433439</a></li>
                            <li>Gene Network methodology: <a href="https://www.nature.com/articles/s41467-019-10649-4" target="_blank">Improving the diagnostic yield of exome- sequencing by predicting gene–phenotype associations using large-scale gene expression analysis</a>, Deelen <i>et al.</i>, Nature Communications, 2019, <a href="https://doi.org/10.1038/s41467-019-10649-4" target="_blank">https://doi.org/10.1038/s41467-019-10649-4</a></li>
                    </ol>

                    
                </div>
            </DocumentTitle>
        );
    }
});

module.exports = Disclosure;