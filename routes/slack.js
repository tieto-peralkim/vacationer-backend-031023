"use strict";

const slackRouter = require("express").Router();
const sendSlackMessage = require("../functions/slack");
const { isAdmin } = require("../utils/middleware");
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
 *          403:
 *              description: Access denied. The user does not have admin rights
 *          500:
 *              description: Internal server error
 */
slackRouter.get("/slackMessageSender", [isAdmin()], (req, res, next) => {
    sendSlackMessage();
    res.status(200).send("Slack query sent");
});

module.exports = slackRouter;
