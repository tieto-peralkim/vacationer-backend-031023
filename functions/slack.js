"use strict";

const fetcher = require("./fetcher.js");
const handleVacationData = require("./handler");
const axios = require("axios");

const getNextWeekDates = () => {
    let thisMonday = new Date();
    thisMonday.setUTCDate(
        thisMonday.getUTCDate() - ((thisMonday.getUTCDay() + 6) % 7)
    );
    thisMonday.setUTCHours(12, 0, 0, 0);

    let nextWeekFriday = new Date();
    nextWeekFriday.setTime(thisMonday.getTime() + 11 * 24 * 60 * 60 * 1000);
    nextWeekFriday.setUTCHours(12, 0, 0, 0);

    return { thisMonday, nextWeekFriday };
};

const dayString = (day) => {
    let dayAsDate = new Date(day[0]);
    if (day[1] === 0) {
        return `${dayAsDate.toLocaleDateString("fi-FI")}  ${day[1]}`;
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
        finalMessage = "🌴 *Ei lomalaisia seuraavana kahtena viikkona.*";
    } else {
        finalMessage = messageText(vacationerAmount, weekList);
    }

    axios
        .post(
            process.env.REACT_APP_SLACK_URI,
            JSON.stringify({
                text: finalMessage,
            })
        )
        .then((response) => {
            console.log("Slack message sent:", response.data);
        })
        .catch((error) => {
            console.error("There was a Slack post error!", error);
        });
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
