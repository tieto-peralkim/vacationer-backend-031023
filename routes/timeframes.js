"use strict";

const timeframesRouter = require("express").Router();
const handleVacationData = require("../functions/handler");
const fetcher = require("../functions/fetcher.js");
const axios = require("axios")

const publicHolidays = []

/**
 * @openapi
 * /holidaysbetween:
 *  get:
 *      tags: ["timeframes"]
 *      summary: Returns all single holidays between start and end dates (FIX type dates)
 *      description: Returns all single holidays between start and end dates  (FIX type dates)
 *      parameters:
 *      -   in: query
 *          name: start
 *          description: Start date of the search
 *          type: string
 *          format: date-time
 *          required: true
 *          default: "2023-03-26T12:00:00.000Z"
 *      -   in: query
 *          name: end
 *          description: End date of the search
 *          type: string
 *          format: date-time
 *          required: true
 *          default: "2023-03-26T12:00:00.000Z"
 *      responses:
 *          200:
 *              description: Returns vacationer with single holidays from selected period
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
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

/**
 * @openapi
 * /timespan:
 *  get:
 *      tags: ["timeframes"]
 *      summary: Returns dates with daily vacationer amount between start and end dates
 *      description: Returns dates with daily vacationer amount between start and end dates
 *      parameters:
 *      -   in: query
 *          name: start
 *          description: Start date of the search
 *          type: string
 *          format: date
 *          required: true
 *          default: "2023-03-26T12:00:00.000Z"
 *      -   in: query
 *          name: end
 *          description: End date of the search
 *          type: string
 *          required: true
 *          default: "2023-04-26T12:00:00.000Z"
 *      responses:
 *          200:
 *              description: Return all the dates between start and end with amount of and list of people on holiday that day
 *              content:
 *                  application/json:
 *                      schema:
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
timeframesRouter.get("/timespan", (req, res, next) => {
    let start = req.query.start;
    let end = req.query.end;

    handleVacationData(start, end)
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

timeframesRouter.get("/public-holidays/:year", (req, res, next) => {
    let year = req.params.year;
    console.log(year);

    axios
        .get(
            `https://date.nager.at/api/v3/publicholidays/${year}/FI`
        )
        .then((response) => {
            let publicDays = [];
            for (let i = 0; i < response.data.length; i++) {
                let publicDay = {};
                publicDay["month"] = parseInt(
                    response.data[i].date.slice(5, 7)
                );
                publicDay["day"] = parseInt(
                    response.data[i].date.slice(8, 10)
                );
                publicDays.push(publicDay);
            }

            publicHolidays.push({year: year, holidays: publicDays})

            console.log("publicDays", publicHolidays);
            res.status(200).send(publicDays);

        })
        .catch((error) => {
            res.status(200).send("publicDays");

            console.error("There was a Public holiday API error!", error);
        });
});

module.exports = timeframesRouter;
