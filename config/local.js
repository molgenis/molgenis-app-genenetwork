/**
 * Local environment settings
 *    In a production environment, you probably want to leave this file out
 *    entirely and leave all your settings in env/production.js
 */

module.exports = {

    genesToTranscripts: '/data/genenetwork/files/genesToTranscripts.txt',
    transcriptMappingFile: 'xxx',
    mim2gene: '/data/genenetwork/files/new/mim2gene.txt',

    geneDescFile: '/data/genenetwork/files/new/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV83FilteredNonChromosomesRemovedDuplicateTranscriptsRemoved.txt',
    geneDBPath: '/data/genenetwork/level/new/dbgenes_uint16be',
    pathwayDBPath: '/data/genenetwork/level/new/dbexternal_uint16be',
    
    transcriptDBpath: '/data/genenetwork/level/new/transcriptdb',
    transcriptBarsDBpath: '/data/genenetwork/level/new/transcriptbars',
    tissuecorrelationDBPath: '/data/genenetwork/level/new/tissuedb',

    // geneDescFile: '/data/genenetwork/files/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV75.txt.filtered.txt',
    // geneDBPath: '/data/genenetwork/level/dbgenes_uint16be',
    // pathwayDBPath: '/data/genenetwork/level/dbexternal_uint16be',

    celltypeDBPath: '/data/genenetwork/level/new/celltypedb',
    correlationDBPath: '/data/genenetwork/level/new/dbpccorrelationzscores_uint16be_genescompsstdnorm',
    hpocorrelationDB: '/data/genenetwork/level/new/hpocorrelationdb',
    //correlationDBPath: '/srv/molgenis/dbpccorrelationzscores_uint16be',
    requestDBPath: '/data/genenetwork/level/new/dbreq',
    networkShortURLDBPath: '/data/genenetwork/level/new/dbnetworkurls',

    svgUploadDir: '/data/genenetwork/uploads/svg/',
    genelistUploadDir: '/data/genenetwork/uploads/genelist',

    networkFontFamily: 'Geogrotesque Lg',
    networkFontFile: 'assets/fonts/Geogtq-Lg.svg',

    useElastic: true,
    elasticHost: 'localhost:9200',
    elasticLogLevel: 'debug',
    
    pubmine: {
        journalFile: '/data/pubmine/GeneticsJournalsImpactFactorAboveThree.txt',
        startYear: 2000,
        stopYear: 2014,
        impactFactorBins: [3, 5, 10],
        numTopJournals: 5
    },

  /***************************************************************************
   * Your SSL certificate and key, if you want to be able to serve HTTP      *
   * responses over https:// and/or use websockets over the wss:// protocol  *
   * (recommended for HTTP, strongly encouraged for WebSockets)              *
   *                                                                         *
   * In this example, we'll assume you created a folder in your project,     *
   * `config/ssl` and dumped your certificate/key files there:               *
   ***************************************************************************/

  // ssl: {
  //   ca: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl_gd_bundle.crt'),
  //   key: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.key'),
  //   cert: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.crt')
  // },

  /***************************************************************************
   * The `port` setting determines which TCP port your app will be           *
   * deployed on.                                                            *
   *                                                                         *
   * Ports are a transport-layer concept designed to allow many different    *
   * networking applications run at the same time on a single computer.      *
   * More about ports:                                                       *
   * http://en.wikipedia.org/wiki/Port_(computer_networking)                 *
   *                                                                         *
   * By default, if it's set, Sails uses the `PORT` environment variable.    *
   * Otherwise it falls back to port 1337.                                   *
   *                                                                         *
   * In env/production.js, you'll probably want to change this setting       *
   * to 80 (http://) or 443 (https://) if you have an SSL certificate        *
   ***************************************************************************/

  port: process.env.PORT || 1337,

  /***************************************************************************
   * The runtime "environment" of your Sails app is either typically         *
   * 'development' or 'production'.                                          *
   *                                                                         *
   * In development, your Sails app will go out of its way to help you       *
   * (for instance you will receive more descriptive error and               *
   * debugging output)                                                       *
   *                                                                         *
   * In production, Sails configures itself (and its dependencies) to        *
   * optimize performance. You should always put your app in production mode *
   * before you deploy it to a server.  This helps ensure that your Sails    *
   * app remains stable, performant, and scalable.                           *
   *                                                                         *
   * By default, Sails sets its environment using the `NODE_ENV` environment *
   * variable.  If NODE_ENV is not set, Sails will run in the                *
   * 'development' environment.                                              *
   ***************************************************************************/

    environment: process.env.NODE_ENV || 'development',
    hookTimeout: 120000 // 2 minutes
};
