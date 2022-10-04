const slackRouter = require('express').Router()
const sendToSlack = require('../functions/slack')

// Sends the next week's vacationers to Slack channel
slackRouter.get('/slack', (req, res, next) => {
    sendToSlack()
    res.status(200).send("Slack query sent")
})

module.exports = slackRouter