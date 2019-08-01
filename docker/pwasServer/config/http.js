module.exports.http = {

  middleware: {

    order: [
      //    'startRequestTimer',
      'responseTime',
      'allower',
      'power',
      'cookieParser',
      'session',
      'bodyParser',
      'handleBodyParserError',
      //   'compress',
      //   'methodOverride',
      //   'poweredBy',
      //   '$custom',
      'router', // mandatory
      'www',
      'favicon',
      //          '404',
      '500'
    ],

    power: function(req, res, next) {
      res.header('X-Powered-By', 'Dopamine, norepinephrine, serotonin and GABA')
      next()
    },

    allower: function(req, res, next) {
      if (req.url.match(/\/[coregulation|svg2pdf]/)) {
        if (req.method != 'GET' && req.method != 'POST') {
          res.header('Allow', 'GET,POST')
          res.send(405, 'Method Not Allowed')
        } else {
          next()
        }
      } else if (req.method != 'GET') {
        res.header('Allow', 'GET')
        res.send(405, 'Method Not Allowed')
      } else {
        next()
      }
    },

    responseTime: function(req, res, next) {
      if (req.url.match(/\/styles|js|images|fonts\/*/)) { // don't log static files
        next()
      } else {
        sails.log.verbose('request ', req.method, req.url)
        req.on('end', function() {
          sails.log.verbose('response ', req.method, req.url, res.getHeader('X-Response-Time'));
        })
        require('response-time')()(req, res, next);
      }
    }
  },

  // cache: 31557600000
};
