const express = require("express");
const vacationsRouter = require("./vacationers");
const teamsRouter = require("./teams");
const loginRouter = require("./login");
const timeframesRouter = require("./timeframes");
const slackRouter = require("./slack");
const middleWare = require("../utils/middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

// TODO: Define higher routes for other routers too
module.exports = function (app) {
    app.use(express.json());
    app.use("/api-docs", swaggerUi.serve);
    app.use("/api-docs", swaggerUi.setup(swaggerDocument));

    // loginRouter should NOT use checkAuthentication
    app.use("/", loginRouter);

    app.use(middleWare.checkAuthentication);
    app.use("/vacationers", vacationsRouter);
    app.use("/teams", teamsRouter);
    app.use("/", timeframesRouter);
    app.use("/", slackRouter);
};
