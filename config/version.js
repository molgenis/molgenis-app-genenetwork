module.exports.version = {
    serviceName: 'Gene Network',
    version: '2.0',
    affiliation: 'Department of Genetics, University Medical Center Groningen',
    mainUrl: 'https://kidney-network.gcc.rug.nl/',
    coregNetworkUrl: 'https://kidney-network.gcc.rug.nl//#/network/',
    apiUrl: 'https://kidney-network.gcc.rug.nl/api/v1',
    comment: function() {
        // return '//' + this.serviceName + ' ' + this.version + ' // ' + this.affiliation + ' // ' + this.mainUrl
        return this.serviceName + ' ' + this.version + ' / ' + this.affiliation + ' / ' + this.mainUrl
    },
    biomartRelease: "V98",
    assemblyRelease: "GRCh38"
}
