var React = require('react');
var Box = require('./Box');
var GN = require("../../config/gn");
var color = require('../js/color');

var Tools = React.createClass({
    render: function(){
        return (
            <div style={{backgroundColor: color.colors.gnwhite, marginTop: '10px', padding: '20px'}}>
                <Box
                    title="DIAGNOSIS"
                    text="Prioritize genes for HPO phenotypes. Small description about diagnosis page, what it does, how it works, etc etc etc etc."
                    url={GN.urls.diagnosisPage} />
            </div>
        )
    }
});

module.exports = Tools;