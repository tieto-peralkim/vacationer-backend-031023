const vacationersRouter = require("express").Router();
const Vacationer = require("../models/vacationer");

// Get all the vacationers with vacations (except deletedUsers)
vacationersRouter.get("/vacationers", (req, res, next) => {
    Vacationer.find({deletedUser: {$ne: true}})
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

// Get all the deletedUsers
vacationersRouter.get("/vacationers/deletedUsers", (req, res, next) => {
    Vacationer.find({deletedUser: {$in: [true]}})
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

// Get name and id of all the vacationers (except deletedUsers)
vacationersRouter.get("/vacationers/total", (req, res, next) => {
    Vacationer.find({deletedUser: {$ne: true}}, { name: 1 })
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

// Get single vacationer with vacations
vacationersRouter.get("/vacationers/:vacationerId", (req, res, next) => {
    Vacationer.findById(req.params.vacationerId)
        .then((foundVacationer) => {
            res.status(200).json(foundVacationer);
        })
        .catch((error) => next(error));
});

// Add a vacationer
vacationersRouter.post("/vacationers", (req, res, next) => {
    const body = req.body;
    const VacationerObject = new Vacationer(body);
    VacationerObject.save()
        .then((savedVacationer) => {
            res.status(201).json(savedVacationer);
        })
        .catch((error) => {
            console.error(error);
            console.error("Error code:", error.code);
            if (error.code === 11000) {
                res.status(409).json("This username is already taken!");
            } else {
                next(error);
            }
        });
});

// Change vacationer name
vacationersRouter.patch("/vacationers/:vacationerId", (req, res, next) => {
    const userId = req.params.vacationerId;
    const newName = req.body.newName;

    console.log("Changing user:", userId, " ", "name to", newName);

    Vacationer.findByIdAndUpdate(
        userId,
        { $set: { name: newName } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((error) => next(error));
});

// Change vacationer calendarSettings
vacationersRouter.patch("/vacationers/:vacationerId/calendarSettings", (req, res, next)=> {
    const userId = req.params.vacationerId;
    const newCalendarSettings = req.body.newCalendarSettings;

    Vacationer.findByIdAndUpdate(
        userId,
        { $set: { calendarSettings: newCalendarSettings } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((error) => next(error));
})

// Safe delete vacationer
vacationersRouter.put("/vacationers/:vacationerId/delete", (req, res, next) => {
    Vacationer.findByIdAndUpdate(
        req.params.vacationerId,
        {$set: {deletedUser: true }},
        { new: true, runValidators: true, context: "query" }
    )
        .then((deletedUser) => {
            res.status(200).json(deletedUser);
        })
        .catch((error) => next(error));
});

// Return deleted vacationer
vacationersRouter.put("/vacationers/:vacationerId/undelete", (req, res, next) => {
    Vacationer.findByIdAndUpdate(
        req.params.vacationerId,
        {$set: {deletedUser: false }},
        { new: true, runValidators: true, context: "query" }
    )
        .then((deletedUser) => {
            res.status(200).json(deletedUser);
        })
        .catch((error) => next(error));
});

// Delete vacationer permanently
vacationersRouter.delete("/vacationers/:vacationerId", (req, res, next) => {
    Vacationer.findByIdAndRemove(req.params.vacationerId)
        .then((deletedVacationer) => {
            console.log("Deleted user", req.params.vacationerId);
            res.status(200).json(deletedVacationer);
        })
        .catch((error) => next(error));
});

// Add a vacation
vacationersRouter.post("/vacationers/:vacationerId", (req, res, next) => {
    const vacationerId = req.params.vacationerId;
    const newHoliday = req.body;

    console.log(
        "Adding newHoliday:",
        newHoliday,
        " ",
        " to vacationerId:",
        vacationerId
    );

    Vacationer.findByIdAndUpdate(
        vacationerId,
        { $push: { vacations: newHoliday } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((updatedVacationer) => {
            res.status(200).json(updatedVacationer);
        })
        .catch((error) => next(error));
});

// Replace a vacation (also the _id value)
vacationersRouter.put(
    "/vacationers/:vacationerId/:holidayId",
    (req, res, next) => {
        console.log(
            "Modifying vacationerId",
            req.params.vacationerId,
            "holidayId",
            req.params.holidayId,
            "req.body",
            req.body
        );
        const vacationerId = req.params.vacationerId;
        const holidayId = req.params.holidayId;
        const modifiedHoliday = req.body;

        Vacationer.updateOne(
            { _id: vacationerId, "vacations._id": holidayId },
            { $set: { "vacations.$": modifiedHoliday } }
        )
            .then((changedHoliday) => {
                console.log("Modified holiday", req.params.id);
                res.status(200).json(changedHoliday);
            })
            .catch((error) => next(error));
    }
);

// Delete a vacation
vacationersRouter.delete(
    "/vacationers/:vacationerId/:holidayId",
    (req, res, next) => {
        console.log(
            "Deleting vacationerId",
            req.params.vacationerId,
            "holidayId",
            req.params.holidayId
        );
        const vacationerId = req.params.vacationerId;
        const holidayId = req.params.holidayId;
        Vacationer.updateOne(
            { _id: vacationerId },
            {
                $pull: {
                    vacations: { _id: holidayId },
                },
            }
        )
            .then((deletedHoliday) => {
                console.log("Deleted holiday", req.params.id);
                res.status(200).json(deletedHoliday);
            })
            .catch((error) => next(error));
    }
);

module.exports = vacationersRouter;
