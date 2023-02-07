const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require('cookie-parser')
require("dotenv").config();

const app = express();
app.use(cookieParser())

const allowList = [process.env.REACT_APP_IP_LOCAL, process.env.REACT_APP_IP_QA, process.env.REACT_APP_IP_PROD]

app.use(cors({
    origin: allowList,
    credentials: true
}));

require("./routes/api")(app)

const middleWare = require("./utils/middleware");
const sendSlackMessage = require("./functions/slack");
const remover = require("./functions/remover");

const mongoose = require("mongoose");
const cron = require("node-cron");
const mongoUri = process.env.REACT_APP_MONGODB_URI;

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.use(middleWare.unknownEndpoint);
app.use(middleWare.errorHandler);

const http = require("http");

const server = http.createServer(app);

server.listen(3001, () => {
    console.log(`Server running on port 3001`);
});

// At 13 every Monday = "0 13 * * 1"
const cronSlackSchedule = "0 13 * * 1";
// Daily at 3 am = "0 3 * * *"
const cronRemoveDataSchedule = "0 3 * * *";

cron.schedule(
    cronSlackSchedule,
    () => {
        console.log(
            "Weekly cron: Sending  Slack message, schedule:",
            cronSlackSchedule
        );
        sendSlackMessage();
    },
    {
        timezone: "Europe/Helsinki",
    }
);

cron.schedule(
    cronRemoveDataSchedule,
    () => {
        console.log(
            "Daily cron: Removing vacationers and teams over 1 month old, schedule",
            cronRemoveDataSchedule
        );
        remover
            .removeDeletableData()
            .then((response) => {
                console.log("Done removing data");
            })
            .catch((error) => {
                console.error("removeData error: ", error);
            });
    },
    {
        timezone: "Europe/Helsinki",
    }
);

const connectToMongoDB = (path) => {
    if (!path) {
        console.log("MongoDB path not found, no database connection");
        return;
    }
    console.log("Connecting to mongodb", path.split("@")[1]);
    mongoose
        .connect(path, { useNewUrlParser: true, useUnifiedTopology: true })
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

