"use strict";

const Vacationer = require("../models/vacationer");

// Returns vacationers and their holidays between start and end dates
async function fetchVacationsBetween(start, end) {
    const all = await Vacationer.aggregate([
        {
            $unwind: {
                path: "$vacations",
            },
        },
        {
            $match: {
                $and: [
                    {
                        deletedAt: {
                            $exists: false,
                        },
                    },
                    {
                        "vacations.end": {
                            $gte: new Date(start),
                        },
                    },
                    {
                        "vacations.start": {
                            $lte: new Date(end),
                        },
                    },
                ],
            },
        },
    ]);
    return all;
}

// Returns vacationers and their holiday amount between start and end dates (basically used for calculating the amount of vacationers on given timespan)
async function fetchVacationerAmount(start, end) {
    const all = await Vacationer.aggregate([
        {
            $unwind: {
                path: "$vacations",
            },
        },
        {
            $match: {
                $and: [
                    {
                        deletedAt: {
                            $exists: false,
                        },
                    },
                    {
                        "vacations.end": {
                            $gte: new Date(start),
                        },
                    },
                    {
                        "vacations.start": {
                            $lte: new Date(end),
                        },
                    },
                ],
            },
        },
        {
            $group: {
                _id: "$_id",
                count: { $sum: 1 },
            },
        },
    ]);
    return all;
}

module.exports = { fetchVacationsBetween, fetchVacationerAmount };
