const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const vacationerSchema = new mongoose.Schema(
    {
        // Name to show in UI
        name: {
            type: String,
            minlength: 3,
            required: true,
        },
        // Github user name
        nameId: {
            type: String,
            required: true,
            unique: true,
        },
        admin: {
            type: Boolean,
            default: false,
            required: true,
        },
        calendarSettings: {
            type: Array,
            default: [
                {
                    _id: false,
                    holidayColor: "#73D8FF",
                    unConfirmedHolidayColor: "#68CCCA",
                    weekendColor: "#808080",
                    weekendHolidayColor: "#CCCCCC",
                    holidaySymbol: "X",
                    unConfirmedHolidaySymbol: "Y",
                },
            ],
        },
        vacations: [
            {
                comment: String,
                confirmed: Boolean,
                start: Date,
                end: Date,
            },
        ],
        deletedAt: {
            type: Date,
        },
    },
    // Adds createdAt and updatedAt fields
    { timestamps: true }
);

vacationerSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Vacationer", vacationerSchema);
