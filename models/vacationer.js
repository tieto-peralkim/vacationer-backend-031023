const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const vacationerSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
        unique: true,
    },
    calendarSettings: [
        {
            holidayColor: String,
            unConfirmedHolidayColor: String,
            weekendColor: String,
            weekendHolidayColor: String,
            holidaySymbol: String,
            unConfirmedHolidaySymbol: String
        }
    ],
    deletedUser: {
        type: Boolean
    },
    vacations: [
        {
            comment: String,
            confirmed: Boolean,
            start: Date,
            end: Date
        },
    ],
});

vacationerSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Vacationer", vacationerSchema);
