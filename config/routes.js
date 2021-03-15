/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    //// API routes
    
    '/api': {
        view: 'homepage'
    },

    '/api/doc': '/api',
    
    '/api/v1/doc': '/api',
    
    '/api/v1/:action': {
        policy: 'apirouter'
    },
    '/api/v1/:action/:id': {
        policy: 'apirouter'
    },

    '/api/*': {
        response: 'notFound'
    },
    
    '/': {
        view: 'homepage'
    },
    
    '/gene*': {
        view: 'homepage'
    },
    
    '/transcript*': {
        view: 'homepage'
    },
    
    '/term*': {
        view: 'homepage'
    },
    
    '/network*': {
        view: 'homepage'
    },

    '/ontology*': {
        view: 'homepage'
    },

    '/diagnosis': '/gado',

    '/gado*': {
        view: 'homepage'
    },

    '/faq*': {
        view: 'homepage'
    },

    '/about*': {
        view: 'homepage'
    },

    '/disclosure*': {
        view: 'homepage'
    },

};
