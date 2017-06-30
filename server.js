/*jslint node: true */
/*jslint white: true */
'use strict';

import SwaggerExpress from 'swagger-express-mw';
import SwaggerUi from 'swagger-tools/middleware/swagger-ui';
import express from 'express';
import config from 'config';
import morgan from 'morgan';
import { logger } from './api/services/util/logger';
const app = express();
let server;
let swaggerConfig = {
  appRoot: __dirname // required config
};
app.use(morgan('combined', {stream : logger.stream}));
function start() {

    return new Promise(function (resolve, reject) {

        SwaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
          if (err) { reject(err); }

          // Add swagger-ui (This must be before swaggerExpress.register)
          app.use(SwaggerUi(swaggerExpress.runner.swagger));
          // install middleware
          swaggerExpress.register(app);
          app.use((err, req, res, next)=>{
            if(err) logger.error(err);
            res.status(err.status || 500).json({message : err.message || 'Internal server error'});
          });
          var port = config.get('port') || 10010;
          server = app.listen(port);
          resolve();
        });
    });
}

function stop(){
  server.close();
}
module.exports = {
	start,
  app,
  stop
};
