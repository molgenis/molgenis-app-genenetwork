var React = require('react');
var Box = require('./Box');
var BoxFunctionEnrichment = require('./BoxFunctionEnrichment');
var GN = require("../../config/gn");
var color = require('../js/color');

var Tools = React.createClass({

    render: function() {
        return (
            <div style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '20px', flex: '1'}}>
                <h2 style={{display: 'inline'}}>TOOLS</h2>
                <BoxFunctionEnrichment
                    title="Function enrichment"
                    text="Predict which pathways are enriched for a set of genes."
                    onClick={this.props.onClick}
                />
            </div>
        )
    }
});

module.exports = Tools;