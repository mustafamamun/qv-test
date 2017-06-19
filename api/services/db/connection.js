/*jslint node:true*/
'use strict';
import { MongoClient } from 'mongodb';
import  config from 'config';
var url = 'mongodb://' + config.get('mongoConfig.host') + ':' + config.get('mongoConfig.port') + '/'+ config.get('mongoConfig.db');
module.exports.init = function(options){
	return new Promise(function(resolve, reject){
		return MongoClient.connect(url, function(err, db){
			if(!err){
				console.log({message : 'Mongo connected'});
				module.exports.db = db;
				resolve();
			}
			reject(err);
		});
	});
};
