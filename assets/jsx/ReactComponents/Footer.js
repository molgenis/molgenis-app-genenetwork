var React = require('react')

var Footer = React.createClass({

    // TODO images proper size, optimization, transparency
    render: function() {
        return (
            <div className='gn-footer hflex flexcenter flexwrap flexspacebetween'>

                <div>&copy; 2019 <a title='Department of Genetics' href='http://www.rug.nl/research/genetics/?lang=en' target='_blank'>
                    Department of Genetics</a>, <a title='University Medical Center Groningen' href='https://www.umcg.nl/EN' target='_blank'>
                    University Medical Center Groningen</a>
                </div>

                <div>Contact:  <a href='mailto: ellen.tsai@biogen.com'> Ellen Tsai</a> or <a href='mailto: niekdeklein@gmail.com'>Niek de Klein</a>
                </div>

                <div className='flex01 hflex flexcenter flexwrap'>
                    <div style={{padding: '0 5px 0 5px'}}>
                        <a href='http://www.cleverfranke.com/cf/en/index.php' target='_blank'>
                            <img className='cleverfranke' title='CLEVER&deg;FRANKE' src={GN.urls.main + '/images/cleverfranke_small.png'} style={{height: '25px'}}/>
                        </a>
                    </div>
                    <div style={{padding: '0 5px 0 5px'}}>
                        <a href='https://www.rug.nl' target='_blank'>
                            <img className='rug' title='Rijksuniversiteit Groningen' src={GN.urls.main + '/images/rug_black.png'} />
                        </a>
                    </div>
                    <div style={{padding: '0 5px 0 5px'}}>
                        <a href='https://www.umcg.nl/EN' target='_blank'>
                            <img className='umcg' title='University Medical Center Groningen' src={GN.urls.main + '/images/umcg_black.png'} />
                        </a>
                    </div>
                    <div style={{padding: '0 5px 0 5px'}}>
                        <a href='https://www.biogen.com' target='_blank'>
                            <img className='biogen' title='Biogen' src={'https://upload.wikimedia.org/wikipedia/en/thumb/b/bc/Biogen.svg/1200px-Biogen.svg.png'} />
                        </a>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = Footer
