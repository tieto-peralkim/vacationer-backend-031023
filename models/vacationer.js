const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

// Tätä voisi vielä miettiä tarkemmin (pakolliset/vaihtoehtoiset kentät)
const vacationerSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
        unique: true
    },
    vacations: [
        {
            comment: String,
            start: Date,
            end: Date,
        }
    ]
})

vacationerSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model("Vacationer", vacationerSchema)