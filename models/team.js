const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const teamSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            minlength: 3,
            required: true,
            unique: true,
        },
        deletedTeam: {
            type: Boolean,
        },
        deletedAt: {
            type: Date,
        },
        members: [
            {
                name: { type: String },
                vacationerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Vacationer",
                    sparse: true,
                },
                _id: false,
            },
        ],
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

teamSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Team", teamSchema);
