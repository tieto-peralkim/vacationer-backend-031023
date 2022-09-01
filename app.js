const config = require('./utils/config')
const express = require('express');
const morgan = require('morgan')
const app = express();
const cors = require('cors')
const vacationsRouter = require('./controllers/vacationers')
const teamsRouter = require('./controllers/teams')
const timeframesRouter = require('./controllers/timeframes')

const middleWare = require('./utils/middleware')
const mongoose = require('mongoose')
const SecretsManager = require("./SecretsManager");

// const retrieveSecret = () => SecretsManager.getSecret("vacationer-secrets", "eu-west-1")
//     .then((secret) => {
//         console.log("salaisuus", secret)
//         MONGODB_URI = secret.MONGODB_URI;
//         connectToMongoDB(MONGODB_URI);
//     })
//     .catch((error) => {
//         console.log("error retrieving the secret:", error.message)
//     })

const connectToMongoDB = (path) => {
    console.log("connectToMongoDB path:", path)
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

connectToMongoDB(config.MONGODB_URI);

app.use(cors())
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));

app.use(vacationsRouter)
app.use(teamsRouter)
app.use(timeframesRouter)

app.use(middleWare.unknownEndpoint)
app.use(middleWare.errorHandler)

module.exports = app