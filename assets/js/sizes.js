//set the sizes relevant for the webapp
module.exports.sizes = {
    //the size at which GET URLs become too large
    httpGetCharacterLimit : 4000,
    //the size at which the number of genes is too large (we don't want to overload the server)
    maxNumberOfGenesToRequest: 2000
}