'use strict'

var _ = require('lodash')
var React = require('react')
var GeneOpenMenu = require('../ReactComponents/GeneOpenMenu')
var SVGCollection = require('../ReactComponents/SVGCollection')

var GeneMenu = React.createClass({

    propTypes: {
        data: React.PropTypes.object.isRequired,
        onTopMenuClick: React.PropTypes.func.isRequired,
        onDatabaseClick: React.PropTypes.func.isRequired,
        onShowTypeClick: React.PropTypes.func.isRequired,
        topMenuSelection: React.PropTypes.string.isRequired,
        databaseSelection: React.PropTypes.string.isRequired,
        showTypeSelection: React.PropTypes.string,
    },
    
    render: function() {

        function swap(list, i, j){var temp = list[i]; list[i] = list[j]; list[j] = temp}

        var that = this
        var numAnnotatedThisDatabase = null
        if ('prediction' == this.props.topMenuSelection) {
            numAnnotatedThisDatabase = _.filter(this.props.data.pathways.annotated, function(pathway) {
                return pathway.term.database.toUpperCase() == that.props.databaseSelection
            }).length
        }

        var topButtonStyles = ['button clickable selectedbutton mobilefullwidth', 'button clickable mobilefullwidth', 'button clickable mobilefullwidth']
        if ('similar' == this.props.topMenuSelection) swap(topButtonStyles, 0, 1)
        if ('tissues' == this.props.topMenuSelection) swap(topButtonStyles, 0, 2)
        var databaseButtonStyles = ['button clickable selectedbutton', 'button clickable']
        if ('annotation' == this.props.showTypeSelection) {
            databaseButtonStyles.reverse()
        }
        if (numAnnotatedThisDatabase === 0) {
            databaseButtonStyles[1] = 'button disabled noselect'
        }
        
        var databaseMenuItems = _.map(this.props.data.databases, function(db) {
            var cls = (db.id == that.props.databaseSelection) ? 'button selectedbutton mobilefullwidth' : 'button clickable mobilefullwidth'
            var label = (<span>{db.name.toUpperCase()}</span>)
            if (db.name.indexOf('GO') === 0) {
                return (
                        <span title={db.fullName} key={db.id} className={cls} onClick={that.props.onDatabaseClick.bind(null, db)}>
                        <span>GO </span><span style={{fontSize: '0.8em'}}>{db.name.toUpperCase().substring(3)}</span>
                        </span>
                )
            } else {
                return (
                        <span title={db.fullName} key={db.id} className={cls} onClick={that.props.onDatabaseClick.bind(null, db)}>
                        {db.name.toUpperCase()}</span>
                )
            }
        })

        return (
                <table className='gn-gene-menu noselect' style={{padding: '0 0 20px 0'}}>
                <tbody>
                <tr>
                <td style={{width: '8em'}}>SHOW</td>
                <td style={{padding: 0}}>
                <span className={topButtonStyles[0]} onClick={this.props.onTopMenuClick.bind(null, 'prediction')}>PATHWAYS & PHENOTYPES</span>
                <span className={topButtonStyles[1]} onClick={this.props.onTopMenuClick.bind(null, 'similar')}>CO-REGULATED GENES</span>

            </td>
                </tr>
                {this.props.topMenuSelection == 'prediction' ?
                 (
                         <tr>
                         <td>SELECT DATABASE</td>
                         <td style={{backgroundColor: '#ffffff', padding: 0}}>{databaseMenuItems}</td>
                         </tr>
                 ) : null }
            </tbody>
                </table>
        )
    }
})

module.exports = GeneMenu
