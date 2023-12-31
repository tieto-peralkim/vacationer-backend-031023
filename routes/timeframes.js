"use strict";

const timeframesRouter = require("express").Router();
const handleVacationData = require("../functions/handler");
const fetcher = require("../functions/fetcher.js");
const axios = require("axios");

let publicHolidaysByYear = new Map();

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

/**
 * @openapi
 * /public-holidays/{year}:
 *  get:
 *      tags: ["timeframes"]
 *      summary: Returns all Finnish public holidays on given year. Saves data to backend cache variable
 *      description: Returns all Finnish public holidays on given year. Saves data to backend cache variable
 *      parameters:
 *      -   in: path
 *          name: year
 *          description: year to be fetched
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns Finnish public holidays on given year
 *              content:
 *                  application/json:
 *                      schema:
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
timeframesRouter.get("/public-holidays/:year", (req, res, next) => {
    let year = req.params.year;
    let savedHolidays;

    if (publicHolidaysByYear.get(year)) {
        savedHolidays = publicHolidaysByYear.get(year);
        res.status(200).send(savedHolidays);
    } else {
        axios
            // Fetching Finnish public holidays from Public holiday API
            .get(`https://date.nager.at/api/v3/publicholidays/${year}/FI`)
            .then((response) => {
                let publicDays = [];

                for (let i = 0; i < response.data.length; i++) {
                    let publicDay = {};
                    publicDay["month"] =
                        new Date(response.data[i].date).getMonth() + 1;
                    publicDay["day"] = new Date(
                        response.data[i].date
                    ).getDate();
                    publicDay["nameFinnish"] = response.data[i].localName;
                    publicDays.push(publicDay);
                }

                publicHolidaysByYear.set(year, publicDays);
                res.status(200).send(publicDays);
            })
            .catch((error) => {
                console.error("There was a Public holiday API error!", error);
                next(error);
            });
    }
});

module.exports = timeframesRouter;
