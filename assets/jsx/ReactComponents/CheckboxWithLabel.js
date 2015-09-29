var React = require('react')
var Cookies = require('cookies-js')

var CheckBoxWithLabel = React.createClass({

  getInitialState: function() {
    var isChecked = Cookies.get(this.props.cookieKey) === 'true'
    return { isChecked: isChecked }
  },

  onChange: function() {
    this.props.onChange(!this.state.isChecked)
    this.setState({isChecked: !this.state.isChecked})
  },

  render: function() {

    return (
      <label>
        <input
          type="checkbox"
          checked={this.state.isChecked}
          onChange={this.onChange}
        />
        {this.state.isChecked ? this.props.labelOn : this.props.labelOff}
      </label>
    )
  }
})

module.exports = CheckBoxWithLabel
