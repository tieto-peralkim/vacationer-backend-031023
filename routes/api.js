const express = require("express")
const vacationsRouter = require("./vacationers");
const teamsRouter = require("./teams");
const loginRouter = require("./login");
const timeframesRouter = require("./timeframes");
const slackRouter = require("./slack");
const middleWare = require("../utils/middleware");

// TODO: Define higher routes for other routers too
module.exports = function(app){
    app.use(express.json())

    // loginRouter should NOT use checkAuthentication
    app.use("/",loginRouter)

    app.use(middleWare.checkAuthentication)
    app.use("/vacationers", vacationsRouter)
    app.use("/teams",teamsRouter)
    app.use("/",timeframesRouter)
    app.use("/",slackRouter)
}