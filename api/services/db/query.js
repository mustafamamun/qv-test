/*jslint node:true*/

'user strict';
import { db }  from './connection';
import 	promise from 'bluebird';
import config from 'config';

function saveToDB(collection, data){
	return new promise(function(resolve, reject){
		return db.collection(collection).insert(data, function(err, result){
			if(err) {
				reject(err);
			}else{
				resolve(result);
			}
		});
	});
}
function updateDB(collection, qs, us){
	return new promise(function(resolve, reject){
		return db.collection(collection).update(qs, {$set:us}, {upsert : false}, function(err, result){
			if(err) {
				reject(err);
			}else{
				resolve(result);
			}
		});
	});
}
function getFromDB(collection, qs, paging, sort){
	return db.collection(collection).find(qs, paging).sort(sort).toArray();
}

function removeFromDB(collection, qs){
	return db.collection(collection).remove(qs);
}

function findCount(collection, qs){
 	return db.collection(collection).find(qs).count();
}


module.exports = {
	saveToDB,
	getFromDB,
	updateDB,
	findCount,
	removeFromDB
};
