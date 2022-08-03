const vacationersRouter = require('express').Router()
const Vacationer = require('../models/vacationer');

vacationersRouter.get('/vacationers', (req, res, next) => {
    Vacationer.find({})
        .then(vacationer => {
            res.status(200).json(vacationer)
        })
        .catch(error => next(error))
})

vacationersRouter.get('/vacationers/total', (req, res, next) => {
    Vacationer.find({}, {name: 1})
        .then(vacationer => {
            res.status(200).json(vacationer)
        })
        .catch(error => next(error))
})
//
// vacationersRouter.get('/vacationers/total', (req, res, next) => {
//     Vacationer.countDocuments({})
//         .then(vacationer => {
//             res.status(200).json(vacationer)
//         })
//         .catch(error => next(error))
// })

vacationersRouter.post('/vacationers', (req, res, next) => {
    const body = req.body
    const VacationerObject = new Vacationer(body)
    VacationerObject.save()
        .then(savedVacationer => {
            res.status(201).json(savedVacationer)
        })
        .catch(error => next(error))
})

vacationersRouter.get('/vacationers/:id', (req, res, next) => {
    Vacationer.findById(req.params.id)
        .then(foundVacationer => {
            res.status(200).json(foundVacationer)
        })
        .catch(error => next(error))
})

vacationersRouter.put('/vacationers/:id', (req, res, next) => {
    const body = req.body;
    const id = req.params.id;
    Vacationer.findByIdAndUpdate(id, body, {new: true, runValidators: true, context: 'query'})
        .then(updatedVacationer => {
            res.status(200).json(updatedVacationer)
        })
        .catch(error => next(error))
})

vacationersRouter.patch('/vacationers/:id', (req, res, next) => {
    const userId = req.params.id;
    const newName = req.body.newName;

    console.log("Changing user:", userId, " ", "name to", newName);

    Vacationer.findByIdAndUpdate(
        userId, {$set: {name: newName}}, {new: true, runValidators: true, context: 'query'})
        .then(updatedUser => {
            res.status(200).json(updatedUser)
        })
        .catch(error => next(error))

})

vacationersRouter.delete('/vacationers/:id', (req, res, next) => {
    Vacationer.findByIdAndRemove(req.params.id)
        .then(deletedVacationer => {
            console.log("Deleted user", req.params.id);
            res.status(200).json(deletedVacationer)
        })
        .catch(error => next(error))

})


module.exports = vacationersRouter