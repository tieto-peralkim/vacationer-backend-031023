const timeframesRouter = require("express").Router();
const Vacationer = require("../models/vacationer");
const handleVacationData = require("../functions/handler");

// Returns all single holidays between start and end dates
timeframesRouter.get("/holidaysbetween", (req, res, next) => {
    let start = new Date(req.query.start);
    let end = new Date(req.query.end);
    console.log("holidaysbetween:", start, "-", end);

    Vacationer.aggregate([
        {
            $unwind: {
                path: "$vacations",
            },
        },
        {
            $match: {
                $and: [
                    {
                        "vacations.end": {
                            $gte: start,
                        },
                    },
                    {
                        "vacations.start": {
                            $lte: end,
                        },
                    },
                ],
            },
        },
    ])
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
