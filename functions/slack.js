const fetcher = require("./fetcher.js");
const handleVacationData = require("./handler");
const axios = require("axios");

const getNextWeekDates = () => {
    let nextMonday = new Date();
    nextMonday.setUTCDate(
        nextMonday.getUTCDate() + ((1 + 7 - nextMonday.getUTCDay()) % 7 || 7)
    );
    nextMonday.setUTCHours(0, 0, 0, 0);

    let nextFriday = new Date();
    nextFriday.setTime(nextMonday.getTime() + 4 * 24 * 60 * 60 * 1000);
    nextFriday.setUTCHours(0, 0, 0, 0);

    return { nextMonday, nextFriday };
};

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
                text: `Ensi viikolla yhteensä ${vacationerAmount} lomalaista:
                ma ${new Date(weekList[0][0]).toLocaleDateString("fi-FI")}  ${
                    weekList[0][1]
                } - ${weekList[0][2]}
                ti ${new Date(weekList[1][0]).toLocaleDateString("fi-FI")}  ${
                    weekList[1][1]
                } - ${weekList[1][2]}
                ke ${new Date(weekList[2][0]).toLocaleDateString("fi-FI")}  ${
                    weekList[2][1]
                } - ${weekList[2][2]}
                to ${new Date(weekList[3][0]).toLocaleDateString("fi-FI")}  ${
                    weekList[3][1]
                } - ${weekList[3][2]}
                pe ${new Date(weekList[4][0]).toLocaleDateString("fi-FI")}  ${
                    weekList[4][1]
                } - ${weekList[4][2]}`,
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
    let nextMonday = nextWeekDates.nextMonday;
    let nextFriday = nextWeekDates.nextFriday;

    console.log("nextMonday ", nextMonday);
    console.log("nextFriday ", nextFriday);

    fetcher
        .fetchVacationerAmount(nextMonday, nextFriday)
        .then((response) => {
            numberOfVacationers = response.length;
            handleVacationData(nextMonday, nextFriday)
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
