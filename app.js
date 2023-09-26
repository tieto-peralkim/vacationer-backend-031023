"use strict";

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(cookieParser());

const allowedIP = process.env.REACT_APP_FRONT_ADDRESS;

const corsConfig = {
    origin: allowedIP,
    credentials: true,
};

app.use(cors(corsConfig));

require("./routes/api")(app);

const middleWare = require("./utils/middleware");
const sendSlackMessage = require("./functions/slack");
const remover = require("./functions/remover");

const mongoose = require("mongoose");
const cron = require("node-cron");
const mongoUri = process.env.REACT_APP_MONGODB_URI;

app.use(express.urlencoded({ extended: false }));

app.use(middleWare.unknownEndpoint);
app.use(middleWare.errorHandler);

const http = require("http");

const server = http.createServer(app);

server.listen(3001, () => {
    console.log(`Server running on port 3001`);
});

// Weekly on Monday at 6 UTC time
const cronSlackSchedule = "0 6 * * 1";
// Daily at 1 UTC time
const cronRemoveDataSchedule = "0 1 * * *";

if (process.env.REACT_APP_ENVIRONMENT === "production") {
    cron.schedule(cronSlackSchedule, () => {
        console.log(
            "Weekly cron: Sending  Slack message, schedule:",
            cronSlackSchedule
        );
        sendSlackMessage();
    });
}

if (
    process.env.REACT_APP_ENVIRONMENT === "production" ||
    process.env.REACT_APP_ENVIRONMENT === "qa"
) {
    cron.schedule(cronRemoveDataSchedule, () => {
        console.log(
            "Daily cron: Removing deleted vacationers and teams over 1 month old, schedule",
            cronRemoveDataSchedule
        );
        remover
            .removeDeletableData()
            .then(() => {
                console.log("Done removing data");
            })
            .catch((error) => {
                console.error("removeData error: ", error);
            });
    });
}

const connectToMongoDB = (path) => {
    if (!path) {
        console.log("MongoDB path not found, no database connection");
        return;
    }
    if (process.env.REACT_APP_ENVIRONMENT === "local") {
        console.log("Connecting to mongodb", path);
    } else {
        console.log("Connecting to mongodb", path.split("@")[1]);
    }
    mongoose
        .connect(path)
        .then(() => {
            let admin = new mongoose.mongo.Admin(mongoose.connection.db);
            admin.buildInfo(function (err, info) {
                console.log("Mongo version is", info.version);
                console.log("connected to MongoDB");
            });
        })
        .catch((error) => {
            console.log("error connecting to MongoDB:", error.message);
        });
};

connectToMongoDB(mongoUri);
