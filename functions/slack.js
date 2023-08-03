"use strict";

const fetcher = require("./fetcher.js");
const handleVacationData = require("./handler");
const axios = require("axios");
let publicHolidays = [];

const getNextWeekDates = () => {
    let thisMonday = new Date(2023, 11, 30, 12);
    // thisMonday.setUTCDate(
    //     thisMonday.getUTCDate() - ((thisMonday.getUTCDay() + 6) % 7)
    // );
    // thisMonday.setUTCHours(12, 0, 0, 0);

    let nextWeekFriday = new Date();
    nextWeekFriday.setTime(thisMonday.getTime() + 11 * 24 * 60 * 60 * 1000);
    nextWeekFriday.setUTCHours(12, 0, 0, 0);

    return { thisMonday, nextWeekFriday };
};

const dayString = (day) => {
    let shortDateFormat = day[0].toISOString().substring(0, 10);
    console.log("day", day[0].toISOString().substring(0, 10));
    console.log("ph", typeof publicHolidays[0].date, typeof shortDateFormat);

    let foundPublicHoliday = publicHolidays.find(
        (o) => o.date === shortDateFormat
    );
    if (foundPublicHoliday) {
        return `${foundPublicHoliday.localName}`;
    }

    if (day[1] === 0) {
        return `${day[0].toLocaleDateString("fi-FI")}  ${day[1]}`;
    } else {
        // Normal holiday date structure: {date, amount of people on holiday, list of people on holiday}
        return `${day[0].toLocaleDateString("fi-FI")}  ${day[1]} - ${day[2]}`;
    }
};

async function getPublicHolidayData(year) {
    try {
        await axios
            // Fetching Finnish public holidays from Public holiday API
            .get(`https://date.nager.at/api/v3/publicholidays/${year}/FI`)
            .then((response) => {
                for (let i = 0; i < response.data.length; i++) {
                    let publicDay = {};
                    publicDay["date"] = response.data[i].date;
                    publicDay["localName"] = response.data[i].localName;
                    publicHolidays.push(publicDay);
                }
                console.log("publicHolidays", publicHolidays);
            })
            .catch((error) => {
                console.error("There was a Public holiday API error!", error);
            });
    } catch (err) {
        console.log(err);
    }
}

// Create daily message for two work weeks (Monday[ma] to Friday[pe])
function messageText(vacationers, days) {
    const firstYear = days[0][0].getFullYear();
    const nextYear = days[11][0].getFullYear();

    getPublicHolidayData(firstYear).then(() =>
        getPublicHolidayData(nextYear).then(() => {
            return `🌴 *Tulevina viikkoina ${vacationers} lomalaista.*\n\n*Tällä viikolla:*\n>ma ${dayString(
                days[0]
            )}\n>ti ${dayString(days[1])}\n>ke ${dayString(
                days[2]
            )}\n>to ${dayString(days[3])}\n>pe ${dayString(
                days[4]
            )} \n*Ensi viikolla:*\n>ma ${dayString(days[7])}\n>ti ${dayString(
                days[8]
            )} \n>ke ${dayString(days[9])}\n>to ${dayString(
                days[10]
            )}\n>pe ${dayString(days[11])}`;
        })
    );
}

const slackMessageRequest = (vacationerAmount, weekList) => {
    let finalMessage = "";
    if (!vacationerAmount && !weekList) {
        finalMessage = "🌴 *Ei lomalaisia seuraavana kahtena viikkona.*";
    } else {
        finalMessage = messageText(vacationerAmount, weekList);
    }

    console.log("fm", finalMessage);
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
