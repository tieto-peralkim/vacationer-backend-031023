const Vacationer = require("../models/vacationer");
const Team = require("../models/team");

// Deleting data set to be removed
async function removeDeletableData() {
    let monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setUTCHours(0, 0, 0, 0);

    // let minutesAgo = new Date();
    // let amountOfMins = 2;
    // minutesAgo.setMinutes(minutesAgo.getMinutes() - amountOfMins);

    let selectedLimit = monthAgo;

    console.log("Vacationers deleted before", selectedLimit);
    let deletableVacationers = await Vacationer.find(
        { deletedVacationer: true, deletedAt: { $lt: selectedLimit } },
        { id: 1 }
    );
    console.log("Teams deleted before", selectedLimit);
    let deletableTeams = await Team.find(
        { deletedTeam: true, deletedAt: { $lt: selectedLimit } },
        { id: 1 }
    );

    deletableVacationers.forEach((vacationer) => {
        console.log("Deleting", vacationer._id);
        Vacationer.findByIdAndRemove(vacationer._id)
            .then((deletedVacationer) => {
                console.log("Deleted user from database", deletedVacationer);
            })
            .catch((error) => {
                console.error("Remove deleted Vacationers error: ", error);
            });
    });

    deletableTeams.forEach((team) => {
        console.log("Deleting", team._id);
        Team.findByIdAndRemove(team._id)
            .then((deletedTeam) => {
                console.log("Deleted team from database", deletedTeam);
            })
            .catch((error) => {
                console.error("Remove deleted Teams error: ", error);
            });
    });
}

module.exports = { removeDeletableData };
