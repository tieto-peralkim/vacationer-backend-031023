const axios = require("axios");

const today = new Date();
today.setUTCHours(0, 0, 0)

const nextMonday = new Date();
nextMonday.setUTCDate(
    today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
);
nextMonday.setUTCHours(0, 0, 0, 0);

const nextFriday = new Date();
nextFriday.setTime(nextMonday.getTime() + 4 * 24 * 60 * 60 * 1000);
nextFriday.setUTCHours(0, 0, 0, 0);

const slackMessage = (vacationerAmount, weekList) => {
    for (let i = 0; i < weekList.length; i++) {
        if (weekList[i][1] === 0) {
            weekList[i][1] = "";
        }
    }
    axios.post(process.env.REACT_APP_SLACK_URI, JSON.stringify({
        "text": `Ensi viikolla yhteensä ${vacationerAmount} lomalaista:
                ma ${new Date(weekList[0][0]).toLocaleDateString("fi-FI")}  ${weekList[0][1]} - ${weekList[0][2]}
                ti ${new Date(weekList[1][0]).toLocaleDateString("fi-FI")}  ${weekList[1][1]} - ${weekList[1][2]}
                ke ${new Date(weekList[2][0]).toLocaleDateString("fi-FI")}  ${weekList[2][1]} - ${weekList[2][2]}
                to ${new Date(weekList[3][0]).toLocaleDateString("fi-FI")}  ${weekList[3][1]} - ${weekList[3][2]}
                pe ${new Date(weekList[4][0]).toLocaleDateString("fi-FI")}  ${weekList[4][1]} - ${weekList[4][2]}`
    }))
        .then(response => {
                console.log("Slack uri response", response.data)
            }
        )
        .catch((error) => {
            console.error("There was a Slack post error!", error);
        })
}

const sendToSlack = () => {
    let numberOfVacationers = 0;
    let vacationersPerDay = []

    axios.get(`http://${process.env.REACT_APP_ADDRESS}:3001/vacationeramount?start=${nextMonday.toISOString()}&end=${nextFriday.toISOString()}`)
        .then((response) => {
            numberOfVacationers = response.data.length;
            axios.get(`http://${process.env.REACT_APP_ADDRESS}:3001/timespan?start=${nextMonday.toISOString()}&end=${nextFriday.toISOString()}`)
                .then((response) => {
                    console.log("Timespan response", response.data)
                    vacationersPerDay = response.data;
                    slackMessage(numberOfVacationers, vacationersPerDay)
                })
                .catch((error) => {
                    console.error("There was a timespan get error!", error);
                })
        })
        .catch((error) => {
            console.error("There was a vacationeramount get error!", error);
        })
}

module.exports = sendToSlack