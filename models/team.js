"use strict";

const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            minlength: 3,
            required: true,
            description: "Name of the team",
        },
        deletedAt: {
            type: Date,
            description: "Date of deletion of vacation",
        },
        members: [
            {
                name: {
                    type: String,
                    description: "Name of team member",
                },
                vacationerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Vacationer",
                    sparse: true,
                    description: "Vacationer id of team member",
                },
                _id: false,
            },
        ],
    },
    // Adds createdAt and updatedAt fields
    { timestamps: true }
);

teamSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Team", teamSchema);
