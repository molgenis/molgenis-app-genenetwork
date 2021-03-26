var React = require('react');
var Box = require('./Box');
var GN = require("../../config/gn");
var color = require('../js/color');

var Networks = React.createClass({

    render: function() {
        return (
            <div style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '20px', flex: '1'}}>
                <h2 style={{display: 'inline'}}>OTHER NETWORKS</h2>
                <Box
                    title="GeneNetwork"
                    text="Gene Network created using 31,499 multi-tissue public RNA-seq samples."
                    url={GN.urls.geneNetwork} />
                <Box
                    title="KidneyNetwork"
                    text="Gene Network created using 31,499 multi-tissue public RNA-seq samples with 878 kidney-specific public RNA-seq samples."
                    url={GN.urls.kidneyNetwork} />
            </div>
        )
    }
});

module.exports = Networks;