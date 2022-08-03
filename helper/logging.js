const winston = require('winston')

const transport1 = new winston.transports.Console({ level: 'info', colorize: true })

const logger = winston.createLogger({
  transports: [transport1],
})

module.exports = logger
