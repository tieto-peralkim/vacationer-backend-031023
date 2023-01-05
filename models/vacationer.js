const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const vacationerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: 3,
            required: true,
            unique: true,
        },
        calendarSettings: [
            {
                _id: false,
                holidayColor: String,
                unConfirmedHolidayColor: String,
                weekendColor: String,
                weekendHolidayColor: String,
                holidaySymbol: String,
                unConfirmedHolidaySymbol: String,
            },
        ],
        deletedVacationer: {
            type: Boolean,
        },
        deletedAt: {
            type: Date,
        },
        vacations: [
            {
                comment: String,
                confirmed: Boolean,
                start: Date,
                end: Date,
            },
        ],
    },
    { timestamps: true }
); // Adds createdAt and updatedAt fields

vacationerSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Vacationer", vacationerSchema);
