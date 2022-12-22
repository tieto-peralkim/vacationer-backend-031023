const slackRouter = require("express").Router();
const sendSlackMessage = require("../functions/slack");

// Sends the next week's vacationers to Slack channel
slackRouter.get("/slackMessageSender", (req, res, next) => {
    sendSlackMessage();
    res.status(200).send("Slack query sent");
});

module.exports = slackRouter;
