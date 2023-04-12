const Vacationer = require("../models/vacationer");

async function checkAdmin(username) {
    try {
        const result = await Vacationer.findOne({ nameId: username.username });
        return result.admin;
    } catch (error) {
        console.error(error);
    }

    //return undefined;
}

module.exports = { checkAdmin };
