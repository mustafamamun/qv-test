/*jslint node:true*/
'use strict';
import config from 'config';
import query from '../services/db/query';
import _ from 'lodash';
import { logger } from '../services/util/logger';
import { ObjectId } from 'mongodb';
const collectionName = config.get('mongoConfig.catalogCollection');
const IdRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
module.exports = {
  addItem,
  removeItem
};

function addItem(req, res, next){
  let _id = req.swagger.params.productId.value;
  if(!IdRegExp.test(_id)){
    return res.status(400).json({message : 'Product id is not correct'});
  }
  let qs = { _id : new ObjectId(_id)};
  let us = {$inc : _.assign({},{quantity : req.body.quantity})};
  query.updateDB(collectionName, qs, us)
  .then((result)=>{
    if((result.result || {}).n > 0 && (result.result || {}).nModified > 0){
      return res.status(200).json({message : 'Item added to product catalog'});
    }else if((result.result || {}).n ===0){
      return res.status(204).json({messge : 'Contend to be modified not found'});
    }else if((result.result || {}).nModified === 0){
      return res.status(500).json({message : 'Could not modify the product'});
    }else{
      return res.status(500).json({message : 'Something wrong happend'});
    }
  })
  .catch((err)=>{
    logger.error(err);
    res.status(500).json({message : 'Internal server error'});
  });
}

function removeItem(req, res, next){
  let _id = req.swagger.params.productId.value;
  if(!IdRegExp.test(_id)){
    return res.status(400).json({message : 'Product id is not correct'});
  }
  let qs = { _id : new ObjectId(_id)};
  let us = {$inc : _.assign({},{quantity : -req.body.quantity})};
  query.updateDB(collectionName, qs, us)
  .then((result)=>{
    if((result.result || {}).n > 0 && (result.result || {}).nModified > 0){
      return res.status(200).json({message : 'Item removed product catalog'});
    }else if((result.result || {}).n ===0){
      return res.status(204).json({messge : 'Contend to be modified not found'});
    }else if((result.result || {}).nModified === 0){
      return res.status(500).json({message : 'Could not modify the product'});
    }else{
      return res.status(500).json({message : 'Something wrong happend'});
    }
  })
  .catch((err)=>{
    logger.error(err);
    return res.status(500).json({message : 'Internal server error'});
  });
}
