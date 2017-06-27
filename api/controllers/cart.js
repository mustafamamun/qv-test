/*jslint node:true*/
'use strict';
import config from 'config';
import query from '../services/db/query';
import _ from 'lodash';
import { logger } from '../services/util/logger';
import { ObjectId } from 'mongodb';
const collectionName = config.get('mongoConfig.cartCollection');

module.exports = {
  getCartItems,
  addItemToCart
};

function getCartItems(req, res, next){
  let qs = {customerId : req.swagger.params.customerId.value};
  query.getFromDB(collectionName, qs)
  .then((result)=>{
    return res.status(200).json(result);
  })
  .catch((err)=>{
    logger.error(err);
    return res.status(500).json({message: 'Internal server error'});
  });
}


function addItemToCart(req, res, next){
  let responseObj;
  let customerId = req.body.customerId;
  query.getFromDB(collectionName, {customerId : customerId})
  .then((result)=>{
    console.log(result);
    if(result.length > 0){
      result[0].products.push(_.assign({}, {productId :  req.body.productId, quantity: req.body.quantity, unitPrice : req.body.unitPrice}));
      console.dir(result[0].products, {depth:null});
      result[0].products = _
       .chain(result[0].products)
       .groupBy('productId')
       .map((value, key)=>{
         return {productId : key, quantity : _.sumBy(value, (eachValue)=>{ return eachValue.quantity; }), unitPrice : value[0].unitPrice};
       })
       .value();
      console.dir(result[0].products, {depth:null});
      result[0].total = _.sumBy(result[0].products, (eacheProduct)=>{
        return eacheProduct.unitPrice*eacheProduct.quantity;
      });
      responseObj = result[0];
      return query.updateDB(collectionName, {customerId:customerId}, {$set : {products : result[0].products, total : result[0].total}});
    }else{
      let cartDetails = _.assign({}, {customerId : customerId, products : [{productId :  req.body.productId, qyantity: req.body.quantity, unitPrice : req.body.unitPrice}], total: req.body.unitPrice});
      responseObj = cartDetails;
      return query.saveToDB(collectionName, cartDetails);
    }
  })
  .then((result)=>{
    return res.status(200).json(_.omit(responseObj, '_id'));
  })
  .catch((err)=>{
    logger.error(err);
    return res.status(500).json({message : 'Internal server error'});
  });
}