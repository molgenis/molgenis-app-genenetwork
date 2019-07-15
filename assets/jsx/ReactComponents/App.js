var React = require('react')
var Router = require('react-router')

var App = createReactClass({

    mixins: [Router.Navigation],

    render: function() {
        return (<div className = "app">
                <MenuBar items = { GN.menuItems } />
                <MenuBar items = { [{name: 'ONE GENE', route: 'gene'}, {name: 'MANY GENES', route: 'network'}] } />
                <RouteHandler/>
                </div>)
    }
})

module.exports = App;
