"use strict";

const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const calendarSettingsSchema = new mongoose.Schema({
    _id: false,
    holidayColor: {
        type: String,
        default: "#73D8FF",
    },
    unConfirmedHolidayColor: {
        type: String,
        default: "#68CCCA",
    },
    weekendColor: {
        type: String,
        default: "#808080",
    },
    weekendHolidayColor: {
        type: String,
        default: "#CCCCCC",
    },
    holidaySymbol: {
        type: String,
        default: "X",
    },
    unConfirmedHolidaySymbol: {
        type: String,
        default: "Y",
    },
});

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
            type: [calendarSettingsSchema],
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
