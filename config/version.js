module.exports.version = {
    serviceName: 'MetabrainNetwork',
    version: '2.1',
    affiliation: 'Department of Genetics, University Medical Center Groningen',
    mainUrl: 'http://www.metabrain.nl',
    coregNetworkUrl: 'http://www.metabrain.nl/#/network/',
    apiUrl: 'https://localhost:1337/api/v1',
    comment: function() {
        // return '//' + this.serviceName + ' ' + this.version + ' // ' + this.affiliation + ' // ' + this.mainUrl
        return this.serviceName + ' ' + this.version + ' / ' + this.affiliation + ' / ' + this.mainUrl
    },
    biomartRelease: "V98",
    assemblyRelease: "GRCh38"
}
