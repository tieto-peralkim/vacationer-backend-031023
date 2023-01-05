const timeframesRouter = require("express").Router();
const handleVacationData = require("../functions/handler");
const fetcher = require("../functions/fetcher.js");

// Returns all single holidays between start and end dates
timeframesRouter.get("/holidaysbetween", (req, res, next) => {
    let start = req.query.start;
    let end = req.query.end;
    console.log("holidaysbetween:", start, "-", end);
    fetcher
        .fetchVacationsBetween(start, end)
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

// Returns dates with daily vacationer amount between start and end dates
timeframesRouter.get("/timespan", (req, res, next) => {
    let start = req.query.start;
    let end = req.query.end;

    handleVacationData(start, end)
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

module.exports = timeframesRouter;
