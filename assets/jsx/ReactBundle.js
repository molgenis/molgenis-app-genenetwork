var React = require('react')
var Router = require('react-router')
var Route = Router.Route
var RouteHandler = Router.RouteHandler
var Link = Router.Link

var CommentBox = React.createClass({displayName: "CommentBox",
  render: function() {
    return (
      React.createElement("div", {className: "commentBox"}, 
        "Hello, world! I am a CommentBox."
      )
    );
  }
});

React.render(
  React.createElement(CommentBox, null),
  document.getElementById('content')
);
