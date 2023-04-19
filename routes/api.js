"use strict";

const express = require("express");
const vacationsRouter = require("./vacationers");
const teamsRouter = require("./teams");
const loginRouter = require("./login");
const timeframesRouter = require("./timeframes");
const slackRouter = require("./slack");
const middleWare = require("../utils/middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerSchemas = require("../swaggerSchemas");

const servers = [
    {
        url: "http://localhost:3001",
        description: "Local",
    },
    {
        url: "http://vacationer-sandbox.cem.ninja:3001",
        description: "QA",
    },
    {
        url: "https://vacationer.kube.cem.ninja/api",
        description: "PROD",
    },
];

let server = "";

switch (process.env.REACT_APP_ENVIRONMENT) {
    case "local":
        server = servers[0];
        break;
    case "qa":
        server = servers[1];
        break;
    case "production":
        server = servers[2];
        break;
    default:
        server = servers[0];
}

const options = {
    failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Vacationer API",
            version: "0.3.0",
            description:
                "API for vacationers and teams, Slack messages and login",
            contact: {
                name: "Kimmo Perälä",
                email: "kimmo.perala@tietoevry.com",
            },
        },
        servers: [server],
        components: {
            schemas: swaggerSchemas,
        },
        tags: [
            {
                name: "vacationer",
                description: "People on holiday",
            },
            {
                name: "team",
                description: "Teams of vacationers",
            },
            {
                name: "timeframes",
                description: "Time based searches for Vacations",
            },
            {
                name: "login",
                description: "Login",
            },
            {
                name: "slack",
                description: "Slack message sender",
            },
        ],
    },
    apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(options);

// TODO: Define higher routes for other routers too
module.exports = function (app) {
    app.use(express.json());

    // loginRouter should NOT use checkAuthentication
    app.use("/", loginRouter);

    app.use(middleWare.checkAuthentication);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use("/vacationers", vacationsRouter);
    app.use("/teams", teamsRouter);
    app.use("/", timeframesRouter);
    app.use("/", slackRouter);
};
