/*jslint node:true*/

'user strict';
const db = require(__dirname + '/connection').db,
 			promise = require('bluebird'),
			config = require('config');

function saveToDB(data){
	return new promise(function(resolve, reject){
		return db.collection(config.get('mongoConfig.collection')).insert(data, function(err, result){
			if(err) {
				reject(err);
			}else{
				resolve(result);
			}
		});
	});
}
function updateDB(qs, us){
	return new promise(function(resolve, reject){
		return db.collection('orders').update(qs, {$set:us}, {upsert : false}, function(err, result){
			if(err) {
				reject(err);
			}else{
				resolve(result);
			}
		});
	});
}
function getFromDB(qs, paging, sort){
	return db.collection(config.get('mongoConfig.collection')).find(qs, {_id:0}, paging).sort(sort).toArray();
}

function findCount(qs){
 	return db.collection(config.get('mongoConfig.collection')).find(qs).count();
}
module.exports = {
	saveToDB,
	getFromDB,
	updateDB,
	findCount
};
