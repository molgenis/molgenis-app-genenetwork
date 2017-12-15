var _ = require('lodash');
var React = require('react');

var reactable = require('reactable');
var Tr = reactable.Tr;
var Td = reactable.Td;
var Table = reactable.Table;
var color = require('../js/color');


var GeneList = React.createClass({

    getInitialState: function() {
        let genes = this.parseGeneList(this.props.location.state.geneList);
        return { genes: genes }
    },

    parseGeneList(geneList) {
        let genes = geneList.split(',');
        return(genes);
    },

    render: function() {
        return (
            <div>
                <GeneListTable genes={this.state.genes} />
            </div>
        )
    }

});

var GeneListTable = React.createClass({

    propTypes: {
        genes: React.PropTypes.array
    },

    render: function() {


        var rows = _.map(this.props.genes, function(gene, i) {
            return (
                <Tr key={gene}>
                    <Td column="GENE" className='text'>{gene}</Td>
                </Tr>
            )
        });

        return (
            <div className={'gn-gene-container-outer'} style={{backgroundColor: color.colors.gnwhite, marginTop: '10px'}}>
                <div className='gn-gene-container-inner maxwidth' style={{padding: '20px'}}>
                    <div>
                        <Table className='gn-gene-table datatable' itemsPerPage={20}>
                            {rows}
                        </Table>
                    </div>
                </div>
            </div>
        )

    }

});

module.exports = GeneList;