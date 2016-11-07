module.exports.version = {
    serviceName: 'Gene Network',
    version: '0.1',
    affiliation: 'Department of Genetics, University Medical Center Groningen',
    mainUrl: 'http://molgenis58.target.rug.nl',
    coregNetworkUrl: 'http://molgenis58.target.rug.nl/#/network/',
    apiUrl: 'http://molgenis58.target.rug.nl/api/v1',
    comment: function() {
        // return '//' + this.serviceName + ' ' + this.version + ' // ' + this.affiliation + ' // ' + this.mainUrl
        return this.serviceName + ' ' + this.version + ' / ' + this.affiliation + ' / ' + this.mainUrl
    },
    biomartRelease: "V71",
    assemblyRelease: "GRCh37"
}
