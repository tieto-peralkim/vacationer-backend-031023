const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const vacationsRouter = require('./controllers/vacationers')
const teamsRouter = require('./controllers/teams')
const timeframesRouter = require('./controllers/timeframes')
const slackRouter = require('./controllers/slack')
const middleWare = require('./utils/middleware')
const mongoose = require('mongoose')
const cron = require('node-cron')
const sendSlackMessage = require('./functions/slack')
require('dotenv').config()

const mongoUri = process.env.REACT_APP_MONGODB_URI
// At 12 every Monday -> '0 12 * * 1'
const cronSchedule='0 23 * * 2'

cron.schedule(cronSchedule, () => {
    console.log("Sending weekly Slack message, schedule:", cronSchedule)
    sendSlackMessage()
    }, {
        timezone: "Europe/Helsinki"
})

const connectToMongoDB = (path) => {
    if(!path) {
        console.log("MongoDB path not found, no database connection")
        return
    }
    console.log("Connecting to mongodb" , path.split("@")[1])
    mongoose.connect(path, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => {
            let admin = new mongoose.mongo.Admin(mongoose.connection.db);
            admin.buildInfo(function (err, info) {
                console.log("Mongo version is", info.version);
                console.log('connected to MongoDB')
            });
        })
        .catch((error) => {
            console.log("error connecting to MongoDB:", error.message)
        })
}

connectToMongoDB(mongoUri);

app.use(cors())
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));

app.use(vacationsRouter)
app.use(teamsRouter)
app.use(timeframesRouter)
app.use(slackRouter)

app.use(middleWare.unknownEndpoint)
app.use(middleWare.errorHandler)

module.exports = app