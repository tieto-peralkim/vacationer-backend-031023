const m2s = require("mongoose-to-swagger");

const Vacationer = require("./models/vacationer");
const Team = require("./models/team");

module.exports = { vacationer: m2s(Vacationer), team: m2s(Team) };
