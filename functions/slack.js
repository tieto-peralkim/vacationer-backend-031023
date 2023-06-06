"use strict";

const fetcher = require("./fetcher.js");
const handleVacationData = require("./handler");
const axios = require("axios");
let publicHolidaysByYear = require("../routes/timeframes").publicHolidaysByYear;

const getNextWeekDates = () => {
    let thisMonday = new Date();
    // thisMonday.setUTCDate(
    thisMonday.setTime(
        // thisMonday.getUTCDate() - ((thisMonday.getUTCDay() + 6) % 7)
        thisMonday.getTime() + 6 * 24 * 60 * 60 * 1000
    );
    thisMonday.setUTCHours(12, 0, 0, 0);

    let nextWeekFriday = new Date();
    nextWeekFriday.setTime(thisMonday.getTime() + 11 * 24 * 60 * 60 * 1000);
    nextWeekFriday.setUTCHours(12, 0, 0, 0);

    return { thisMonday, nextWeekFriday };
};

const dayString = (day) => {
    let dayAsDate = new Date(day[0]);
    console.log("joo", publicHolidaysByYear);
    // Get public holidays of the date
    let foundPublicHoliday = publicHolidaysByYear
        .get(dayAsDate.getFullYear().toString())
        .filter(
            (holiday) =>
                holiday.month === dayAsDate.getMonth() + 1 &&
                holiday.day === dayAsDate.getDate()
        );
    console.log("dayAsDate", dayAsDate.getDate(), foundPublicHoliday);

    if (foundPublicHoliday.length > 0) {
        return `*${foundPublicHoliday[0].nameFinnish}*`;
    } else {
        // Normal holiday date structure: {date, amount of people on holiday, list of people on holiday}
        return `${dayAsDate.toLocaleDateString("fi-FI")}  ${day[1]} - ${
            day[2]
        }`;
    }
};

// Create daily message for two work weeks (Monday[ma] to Friday[pe])
function messageText(vacationers, days) {
    console.log("days", days);
    return `🌴 *Tulevina viikkoina ${vacationers} lomalaista.*\n\n*Tällä viikolla:*\n>ma ${dayString(
        days[0]
    )}\n>ti ${dayString(days[1])}\n>ke ${dayString(days[2])}\n>to ${dayString(
        days[3]
    )}\n>pe ${dayString(days[4])} \n*Ensi viikolla:*
                \n>ma ${dayString(days[7])}\n>ti ${dayString(
        days[8]
    )} \n>ke ${dayString(days[9])}\n>to ${dayString(days[10])}\n>pe ${dayString(
        days[11]
    )}`;
}

const slackMessageRequest = (vacationerAmount, weekList) => {
    let finalMessage = "";

    if (!vacationerAmount && !weekList) {
        console.log("Ei lomalaisia seuraavaan kahteen viikkoon");
        finalMessage = "🌴 *Ei lomalaisia seuraavaan kahteen viikkoon.*";
    } else {
        console.log("messageText", messageText(vacationerAmount, weekList));
        finalMessage = messageText(vacationerAmount, weekList);
    }

    // axios
    //     .post(
    //         process.env.REACT_APP_SLACK_URI,
    //         JSON.stringify({
    //             text: finalMessage,
    //         })
    //     )
    //     .then((response) => {
    //         console.log("Slack message sent:", response.data);
    //     })
    //     .catch((error) => {
    //         console.error("There was a Slack post error!", error);
    //     });
};

const sendSlackMessage = () => {
    let numberOfVacationers = 0;
    let vacationersPerDay = [];

    let nextWeekDates = getNextWeekDates();
    let thisMonday = nextWeekDates.thisMonday;
    let nextWeekFriday = nextWeekDates.nextWeekFriday;

    console.log("thisMonday ", thisMonday);
    console.log("nextWeekFriday ", nextWeekFriday);

    fetcher
        .fetchVacationerAmount(thisMonday, nextWeekFriday)
        .then((response) => {
            numberOfVacationers = response.length;

            if (numberOfVacationers !== 0) {
                handleVacationData(thisMonday, nextWeekFriday)
                    .then((response) => {
                        vacationersPerDay = response;
                        slackMessageRequest(
                            numberOfVacationers,
                            vacationersPerDay
                        );
                    })
                    .catch((error) => {
                        console.error("handleVacationData error: ", error);
                    });
            } else {
                slackMessageRequest();
            }
        })
        .catch((error) => {
            console.error("fetchVacationerAmount error: ", error);
        });
};

module.exports = sendSlackMessage;
