const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name == 'ValidationError') {
        console.error("Error validating!", error)
        return res.status(422).send({error: error.message})
    } else {
        console.error(error)
        res.status(500).json(error)
    }
    next(error)
}

module.exports = {
    unknownEndpoint,
    errorHandler
}