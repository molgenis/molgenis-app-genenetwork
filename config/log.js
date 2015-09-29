/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#/documentation/concepts/Logging
 */

// var bunyan = require('bunyan') // bunyan is nice, hopefully it will support sails >0.10 sometime

module.exports.log = {
    
    /** Sails logging level, for backward comparability */
    level: 'verbose',
    logUncaughtException: false,
    filePath: 'genenetwork.log',
    /** If given, signal to listen on for file rotation */
    rotationSignal: null,
    /** Configuration to pass to the Bunyan logger */
    // bunyan: {
    //     /** Logger name */
    //     name: 'genenetwork',
    //     /** Bunyan logging level */
    //     level: 'debug',
    //     /** Bunyan serializers */
    //     serializers: bunyan.stdSerializers,
    //     /** Array of output streams */
    //     streams: null
    // }
}
