let domain = require('./domain').domain;

module.exports.domain = domain;

module.exports.menuItems = [{
    name: 'HOME',
    route: '/'
}, {
    name: 'HOW IT WORKS',
    route: '/how'
}, {
    name: 'ABOUT',
    route: '/about'
}, {
    name: 'API',
    route: '/api'
}];

module.exports.urls = {
    main: module.exports.domain,
    gene: domain + '/api/v1/gene',
    genes: domain + '/api/v1/genes',
    transcript: domain + '/api/v1/transcript',
    transcriptBars: domain + '/api/v1/transcriptBars',
    pathway: domain + '/api/v1/pathway',
    coregulation: domain + '/api/v1/coregulation',
    tissues: domain + '/api/v1/tissues',
    cofunction: domain + '/api/v1/cofunction',
    pc: domain + '/api/v1/pc',

    suggest: domain + '/socketapi/suggest',
    diagnosisSuggest: domain + '/socketapi/diagnosisSuggest',
    pathwayanalysis: domain + '/socketapi/pathwayanalysis',
    geneprediction: domain + '/socketapi/geneprediction',
    network: domain + '/socketapi/network',
    genescores: domain + '/socketapi/genescores',
    genevsnetwork: domain + '/socketapi/genevsnetwork',

    prioritization: domain + '/api/v1/prioritization',

    genePage: domain + '/gene/',
    termPage: domain + '/term/',
    networkPage: domain + '/network/',
    diagnosisPage: domain + '/diagnosis',

    svg2pdf: domain + '/api/v1/svg2pdf',
    // diagnosisResults: domain + '/api/v1/diagnosisResults',
    tabdelim: domain + '/api/v1/tabdelim',

    diagnosisVCF: domain + '/api/v1/vcf',
};

module.exports.pageTitleSuffix = ' - Gene Network';
