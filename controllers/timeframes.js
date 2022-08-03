const timeframesRouter = require('express').Router()
const Vacationer = require("../models/vacationer");
const handleVacationData = require("../functions/handler");

// Returns vacationers and their holiday amount between start and end dates (basically used for calculating the amount of vacationers on given timespan)
timeframesRouter.get('/vacationeramount', (req, res, next) => {
    let start = req.query.start;
    let end = req.query.end;
    console.log("start ", start)
    console.log("end ", end)

    Vacationer.aggregate([
            {
                $unwind: {
                    path: "$vacations"
                }
            },
            {
                $match: {
                    $and: [
                        {
                            "vacations.end": {
                                $gte: (new Date(start))
                            }
                        },
                        {
                            "vacations.start": {
                                $lte: (new Date(end))
                            }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: "$_id",
                    count: {$sum: 1}
                }
            }
        ]
    )
        .then(vacationer => {
            res.status(200).json(vacationer)
        })
        .catch(error => next(error))
})

// Returns all single holidays between start and end dates
timeframesRouter.get('/holidaysbetween', (req, res, next) => {
    let start = req.query.start;
    let end = req.query.end;
    console.log("start ", start)
    console.log("end ", end)

    Vacationer.aggregate([
            {
                $unwind: {
                    path: "$vacations"
                }
            },
            {
                $match: {
                    $and: [
                        {
                            "vacations.end": {
                                $gte: (new Date(start))
                            }
                        },
                        {
                            "vacations.start": {
                                $lte: (new Date(end))
                            }
                        }
                    ]
                }
            },
        ]
    )
        .then(vacationer => {
            res.status(200).json(vacationer)
        })
        .catch(error => next(error))
})

// Returns dates with daily vacationer amount between start and end dates
timeframesRouter.get('/timespan', (req, res, next) => {
    let start = req.query.start;
    let end = req.query.end;

    handleVacationData(start, end)
        .then(vacationer => {
            res.status(200).json(vacationer)
        })
        .catch(error => next(error))
})

module.exports = timeframesRouter