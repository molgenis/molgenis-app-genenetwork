var requireID = function(req, res) {
    if (!req.params.id) {
        res.send(400, {
            status: 400,
            message: 'Resource id required'
        })
    }
}

var requireQueryParam = function(params, req, res) {

    for (var i = 0; i < params.length; i++) {
        if (req.query[params[param]] !== undefined) {
            return res.send(400, {
                status: 400,
                message: 'Query parameter \'' + param + '\' required'
            })
        }
    }
}

module.exports = function(req, res, next) {

    var action = req.param('action')
    switch (action) {
        case 'candidates':
            requireID(req, res)
            break
        case 'cofunction':
            requireID(req, res)
            requireQueryParams(['db'], req, res)
            break
        case 'prioritization':
            requireID(req, res)
        case 'coregulation':
            if (!req.body || !req.body.genes) {
                requireID(req, res)
            }
            break
    }
    if (!res.headersSent) {
        if (sails.controllers['api'][action]) {
            return sails.controllers['api'][action](req, res)
            // TODO remove socket api here! only development purposes
        } else if (sails.controllers['socketapi'][action]) {
            return sails.controllers['socketapi'][action](req, res)
        } else {
            return res.notFound()
        }
    }
}
