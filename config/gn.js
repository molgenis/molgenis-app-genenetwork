var DOMAIN = 'http://localhost:1337';

module.exports.domain = DOMAIN;

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
    gene: DOMAIN + '/api/v1/gene',
    transcript: DOMAIN + '/api/v1/transcript',
    transcriptBars: DOMAIN + '/api/v1/transcriptBars',
    pathway: DOMAIN + '/api/v1/pathway',
    coregulation: DOMAIN + '/api/v1/coregulation',
    tissues: DOMAIN + '/api/v1/tissues',
    cofunction: DOMAIN + '/api/v1/cofunction',
    pc: DOMAIN + '/api/v1/pc',

    suggest: DOMAIN + '/socketapi/suggest',
    diagnosisSuggest: DOMAIN + '/socketapi/diagnosisSuggest',
    pathwayanalysis: DOMAIN + '/socketapi/pathwayanalysis',
    geneprediction: DOMAIN + '/socketapi/geneprediction',
    network: DOMAIN + '/socketapi/network',
    genescores: DOMAIN + '/socketapi/genescores',
    genevsnetwork: DOMAIN + '/socketapi/genevsnetwork',

    prioritization: DOMAIN + '/api/v1/prioritization',

    genePage: DOMAIN + '/gene/',
    termPage: DOMAIN + '/term/',
    networkPage: DOMAIN + '/network/',
    diagnosisPage: DOMAIN + '/diagnosis',

    svg2pdf: DOMAIN + '/api/v1/svg2pdf',
    // diagnosisResults: DOMAIN + '/api/v1/diagnosisResults',
    tabdelim: DOMAIN + '/api/v1/tabdelim',

    diagnosisVCF: DOMAIN + '/api/v1/vcf',
};

module.exports.pageTitleSuffix = ' - Gene Network';
