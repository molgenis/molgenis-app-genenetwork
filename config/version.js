module.exports.version = {
    serviceName: 'Gene Network',
    version: '0.1',
    affiliation: 'Department of Genetics, University Medical Center Groningen',
    mainUrl: 'http://www.genenetwork.nl',
    coregNetworkUrl: 'http://www.genenetwork.nl/#/network/',
    apiUrl: 'http://www.genenetwork.nl/api/v1',
    comment: function() {
        // return '//' + this.serviceName + ' ' + this.version + ' // ' + this.affiliation + ' // ' + this.mainUrl
        return this.serviceName + ' ' + this.version + ' / ' + this.affiliation + ' / ' + this.mainUrl
    },
    biomartRelease: "V83",
    assemblyRelease: "GRCh38"
}
