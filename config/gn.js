var DOMAIN = require('./domain').domain;

module.exports.domain = DOMAIN;

module.exports.menuItems = [{
    name: 'HOME',
    route: '/'
},
    {
    name: 'FAQ',
    route: '/faq'
},
//     {
//     name: 'ABOUT',
//     route: '/about'
// },
    {
    name: 'API',
    route: '/api'
}];

module.exports.urls = {
    main: module.exports.domain,
    gene: DOMAIN + '/api/v1/gene',
    genes: DOMAIN + '/api/v1/genes',
    transcript: DOMAIN + '/api/v1/transcript',
    transcriptBars: DOMAIN + '/api/v1/transcriptBars',
    pathway: DOMAIN + '/api/v1/pathway',
    coregulation: DOMAIN + '/api/v1/coregulation',
    tissues: DOMAIN + '/api/v1/tissues',
    cofunction: DOMAIN + '/api/v1/cofunction',
    pc: DOMAIN + '/api/v1/pc',

    suggest: DOMAIN + '/socketapi/suggest',
    diagnosisSuggest: DOMAIN + '/socketapi/diagnosisSuggest',
    diagnosisParentTerms: DOMAIN + '/socketapi/diagnosisParentTerms',
    pathwayanalysis: DOMAIN + '/socketapi/pathwayanalysis',
    geneprediction: DOMAIN + '/socketapi/geneprediction',
    network: DOMAIN + '/socketapi/network',
    genescores: DOMAIN + '/socketapi/genescores',
    genevsnetwork: DOMAIN + '/socketapi/genevsnetwork',

    prioritization: DOMAIN + '/api/v1/prioritization',

    genePage: DOMAIN + '/gene/',
    termPage: DOMAIN + '/term/',
    networkPage: DOMAIN + '/network/',
    diagnosisPage: DOMAIN + '/gado',
    faqPage: DOMAIN + '/faq',

    svg2pdf: DOMAIN + '/api/v1/svg2pdf',
    // diagnosisResults: domain + '/api/v1/diagnosisResults',
    tabdelim: DOMAIN + '/api/v1/tabdelim',
    fileupload: DOMAIN + '/api/v1/fileupload',

    diagnosisVCF: DOMAIN + '/api/v1/vcf',

    // dirty workaround, should do this the other way around, where internal does not have to go over internet
    external: {
        gene: 'https://kidney-network.gcc.rug.nl' + '/api/v1/gene',
        pathway: 'https://kidney-network.gcc.rug.nl' + '/api/v1/pathway',
        prioritization: 'https://kidney-network.gcc.rug.nl' + '/api/v1/prioritization',
    },
};

module.exports.pageTitleSuffix = ' - Kidney Network';
