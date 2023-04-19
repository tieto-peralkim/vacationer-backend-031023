"use strict";

const timeframesRouter = require("express").Router();
const handleVacationData = require("../functions/handler");
const fetcher = require("../functions/fetcher.js");

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

module.exports = timeframesRouter;
