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
    console.log("thisMonday", thisMonday);

    let nextWeekFriday = new Date();
    nextWeekFriday.setTime(thisMonday.getTime() + 11 * 24 * 60 * 60 * 1000);
    nextWeekFriday.setUTCHours(12, 0, 0, 0);

    return { thisMonday, nextWeekFriday };
};

function messageText(vacationers, days) {
    return `🌴 *Tulevina viikkoina ${vacationers} lomalaista.*\n\n*Tällä viikolla:*
                \n>ma ${new Date(days[0][0]).toLocaleDateString("fi-FI")}  ${
        days[0][1]
    } - ${days[0][2]}\n>ti ${new Date(days[1][0]).toLocaleDateString(
        "fi-FI"
    )}  ${days[1][1]} - ${days[1][2]}\n>ke ${new Date(
        days[2][0]
    ).toLocaleDateString("fi-FI")}  ${days[2][1]} - ${
        days[2][2]
    }\n>to ${new Date(days[3][0]).toLocaleDateString("fi-FI")}  ${
        days[3][1]
    } - ${days[3][2]}\n>pe ${new Date(days[4][0]).toLocaleDateString(
        "fi-FI"
    )}  ${days[4][1]} - ${days[4][2]}
                \n*Ensi viikolla:*
                \n>ma ${new Date(days[7][0]).toLocaleDateString("fi-FI")}  ${
        days[7][1]
    } - ${days[7][2]}\n>ti ${new Date(days[8][0]).toLocaleDateString(
        "fi-FI"
    )}  ${days[8][1]} - ${days[8][2]}\n>ke ${new Date(
        days[9][0]
    ).toLocaleDateString("fi-FI")}  ${days[9][1]} - ${
        days[9][2]
    }\n>to ${new Date(days[10][0]).toLocaleDateString("fi-FI")}  ${
        days[10][1]
    } - ${days[10][2]}\n>pe ${new Date(days[11][0]).toLocaleDateString(
        "fi-FI"
    )}  ${days[11][1]} - ${days[11][2]}`;
}

const slackMessage = (vacationerAmount, weekList) => {
    for (let i = 0; i < weekList.length; i++) {
        if (weekList[i][1] === 0) {
            weekList[i][1] = "";
        }
    }
    axios
        .post(
            process.env.REACT_APP_SLACK_URI,
            JSON.stringify({
                text: messageText(vacationerAmount, weekList),
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
            handleVacationData(thisMonday, nextWeekFriday)
                .then((response) => {
                    vacationersPerDay = response;
                    slackMessage(numberOfVacationers, vacationersPerDay);
                })
                .catch((error) => {
                    console.error("handleVacationData error: ", error);
                });
        })
        .catch((error) => {
            console.error("fetchVacationerAmount error: ", error);
        });
};

module.exports = sendSlackMessage;
