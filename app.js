/*jslint node: true */
'use strict';
const mongodb = require(__dirname + '/api/services/db/connection.js'),
      server = require(__dirname + '/server'),
      logger = require(__dirname + '/api/services/util/logger').logger;

mongodb.init({})
.then(server.start)
.then(()=>{
	console.log('server started');
})
.catch(function(error){
	console.log(error);
	process.exit(1);
});

process.on('uncaughtException', err=>logger.error('uncaught exception', err));
process.on('unhandledRejection', err=>logger.error('unhandled rejection', err));
