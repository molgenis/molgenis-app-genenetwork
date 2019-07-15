var _ = require('lodash');
var React = require('react');
var createReactClass = require('create-react-class');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var MenuBar = createReactClass({
    render: function() {
        var that = this;
        var items = _.map(that.props.items, function(item, i) {
            return (<Link key={item.name} className={'menuitem ' + (i === 0 ? 'first' : i === that.props.items.length - 1 ? 'last' : '')} to={item.route}>{item.name}</Link>)
        });
        return (<div className='gn-top-menubar noselect flex00 flexstart' style={this.props.style}>{items}</div>)
    }
});

module.exports = MenuBar;