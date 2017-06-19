import  winston from 'winston';
import config from 'config';

export const logger = new winston.Logger( {
    transports : [
      new winston.transports.Console({
        level : config.get('node_env') === 'production' ? 'info': 'debug',
        colorize: true,
        timestamp: true,
        prettyPrint : true,
        label : 'Skeleton backend'
      })
    ]
});

logger.stream = {
  write : message=>logger.info(message)
};
