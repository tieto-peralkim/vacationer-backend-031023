"use strict";

const slackRouter = require("express").Router();
const sendSlackMessage = require("../functions/slack");
/**
 * @openapi
 * /slackMessageSender:
 *  get:
 *      tags: ["slack"]
 *      summary: Sends the message to Slack channel
 *      description: Sends the message to Slack channel
 *      responses:
 *          200:
 *              description: Slack query sent
 *              content:
 *                  application/json:
 *                      schema:
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
slackRouter.get("/slackMessageSender", (req, res, next) => {
    sendSlackMessage();
    res.status(200).send("Slack query sent");
});

module.exports = slackRouter;
