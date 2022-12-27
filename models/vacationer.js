const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const vacationerSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
        unique: true,
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
