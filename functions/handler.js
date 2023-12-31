"use strict";

const fetcher = require("./fetcher.js");

// Creates the array of dates with vacationer numbers
//https://dev.to/ashikpaul42/how-to-count-occurrences-of-dates-in-an-array-of-date-ranges-javascript-kjo
async function handleVacationData(start, end) {
    const holidaysBetweenDates = await fetcher.fetchVacationsBetween(
        start,
        end
    );
    let holidayTimes = [];

    for (let i = 0; i < holidaysBetweenDates.length; i++) {
        let vacationObject = {};

        let startDate = new Date(holidaysBetweenDates[i].vacations.start);
        let endDate = new Date(holidaysBetweenDates[i].vacations.end);

        vacationObject["start"] = startDate;
        vacationObject["end"] = endDate;
        vacationObject["vacationers"] = holidaysBetweenDates[i].name;
        holidayTimes.push(vacationObject);
    }

    let earlyDate = new Date(start);
    let lateDate = new Date(end);

    let arrayOfDates = [];
    while (earlyDate <= lateDate) {
        let count = 0;
        let vacationersOfDay = [];
        holidayTimes.forEach(function (range) {
            if (earlyDate >= range.start && earlyDate <= range.end) {
                count++;
                vacationersOfDay.push(range.vacationers);
            }
        });
        let dateObject = [];
        dateObject[0] = new Date(JSON.parse(JSON.stringify(earlyDate)));
        dateObject[1] = count;
        dateObject[2] = vacationersOfDay.join(", ");
        arrayOfDates.push(dateObject);
        earlyDate.setDate(earlyDate.getDate() + 1);
    }
    return arrayOfDates;
}

module.exports = handleVacationData;
