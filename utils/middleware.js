const logger = require('./logger')

const requestLogger = (req, res, next) => {
    logger.info('Method:', req.method)
    logger.info('Path:', req.path)
    logger.info('Body:', req.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "Unknown endpoint"})
}

const errorHandler = (error, req, res, next) => {
    if(error.name === 'CastError') {
        return res.status(400).send({ error: "Mulformatted id"})
    } else if(error.name === "ValidationError") {
        return res.status(400).send({ error: error.message })
    } else if (error.name === "JsonWebTokenError") {
        return res.status(401).send({ error: 'Unauthorized' })
    }
    
    next(error)
}

const tokenExtractor = (req, res, next) => {
    const bearToken = req.headers['authorization']
    const extract = (bearToken) => {
        if (bearToken && bearToken.toLowerCase().startsWith('bearer')) {
            return bearToken.split(' ')[1]
          } else {
            return null
          }
    }

    req.token = extract(bearToken)
    next()
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor
}