/*jslint node:true*/
'use strict';
const
      root = require('app-root-path'),
      logger = require(root + '/api/services/util/logger').logger;

module.exports = {
  hello: hello
};
//Controller function
function hello(req, res, next) {
  res.json({message : req.swagger.params.name.value});
}
