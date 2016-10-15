var React = require('react')

var Footer = React.createClass({

    // TODO images proper size, optimization, transparency
    render: function() {
        return (
                <div className='gn-footer hflex flexcenter flexwrap flexspacebetween'>
                <div>&copy; 2017 <a title='Department of Genetics' href='http://www.rug.nl/research/genetics/?lang=en' target='_blank'>
                Department of Genetics</a>, <a title='University Medical Center Groningen' href='https://www.umcg.nl/EN' target='_blank'>
                University Medical Center Groningen</a>
                </div>
                <div className='flex01 hflex flexcenter flexwrap'>
                <div>
                <a href='http://www.cleverfranke.com/cf/en/index.php' target='_blank'>
                <img className='cleverfranke' title='CLEVER&deg;FRANKE' src={GN.urls.main + '/images/cleverfranke.png'} />
                </a>
                </div>
                <div>
                <a href='https://www.rug.nl' target='_blank'>
                <img className='rug' title='Rijksuniversiteit Groningen' src={GN.urls.main + '/images/rug_black.png'} />
                </a>
                </div>
                <div>
                <a href='https://www.umcg.nl/EN' target='_blank'>
                <img className='umcg' title='University Medical Center Groningen' src={GN.urls.main + '/images/umcg_black.png'} />
                </a>
                </div>
                </div>
                </div>
        )
    }
})

module.exports = Footer
