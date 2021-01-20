var React = require('react')

var Footer = React.createClass({

    // TODO images proper size, optimization, transparency
    render: function() {
        return (
            <div className='gn-footer hflex flexcenter flexwrap flexspacebetween'>

                <div>&copy; 2021 <a title='Department of Genetics' href='http://www.rug.nl/research/genetics/?lang=en' target='_blank'>
                    Department of Genetics</a>, <a title='University Medical Center Groningen' href='https://www.umcg.nl/EN' target='_blank'>
                    University Medical Center Groningen</a>
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
                        <a href='http://www.bbmri.nl' target='_blank'>
                            <img className='bbmri' title='BBMRI' src={GN.urls.main + '/images/bbmri_nl.png'} />
                        </a>
                    </div>
                    <div style={{padding: '0 5px 0 5px'}}>
                        <a href='https://www.umcutrecht.nl/' target='_blank'>
                            <img className='umcu' title='University Medical Center Utrecht' src={GN.urls.main + '/images/umcu_black.jpg'} />
                        </a>
                    </div>
                    <div style={{padding: '0 5px 0 5px'}}>
                        <a href='https://www.umcutrecht.nl/nl/ziekenhuis/wetenschappelijk-onderzoek/genepher-data-en-biobank/' target='_blank'>
                            <img className='genepher' title='GeNepher' src={GN.urls.main + '/images/genepher_logo.png'} />
                        </a>
                    </div>
                    <div style={{padding: '0 5px 0 5px'}}>
                        <a href='https://www.nierstichting.nl/' target='_blank'>
                            <img className='nierstichting' title='Nierstichting' src={GN.urls.main + '/images/nierstichting_logo.png'} />
                        </a>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = Footer
