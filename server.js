/*jslint node: true */
/*jslint white: true */
'use strict';

const SwaggerExpress = require('swagger-express-mw'),
      SwaggerUi = require('swagger-tools/middleware/swagger-ui'),
      app = require('express')(),
      config = require('config'),
      morgan = require('morgan'),
      logger = require(__dirname + '/api/services/util/logger');

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

          var port = config.get('port') || 10010;
          app.listen(port);
          resolve();
        });
    });
}
module.exports = {
	start,
  app
};
