"use strict";

const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const vacationerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: 3,
            required: true,
            description: "Name of the user",
        },
        nameId: {
            type: String,
            required: true,
            unique: true,
            description: "Github user name",
        },
        admin: {
            type: Boolean,
            default: false,
            required: true,
            description: "Admin flag",
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
            description: "Calendar colors and symbols",
        },
        vacations: [
            {
                comment: {
                    type: String,
                    description: "Optional description of vacation",
                },
                confirmed: {
                    type: Boolean,
                    description: "Confirmed flag of vacation",
                },
                start: {
                    type: Date,
                    description: "Starting date of vacation",
                },
                end: {
                    type: Date,
                    description: "Ending date of vacation",
                },
            },
        ],
        deletedAt: {
            type: Date,
            description: "Date of deletion of vacation",
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
