const vacationersRouter = require("express").Router();
const Vacationer = require("../models/vacationer");

// Get all the vacationers (NOT deleted Vacationers) and their vacations
vacationersRouter.get("/", (req, res, next) => {
    Vacationer.find({ deletedAt: { $exists: false } })
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

// Get all the vacationers (also deleted Vacationers) and their vacations
vacationersRouter.get("/allUsers", (req, res, next) => {
    Vacationer.find()
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

// Get all the deleted Vacationers and their vacations
vacationersRouter.get("/deleted", (req, res, next) => {
    Vacationer.find({ deletedAt: { $ne: null } })
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

// Get name and id of all the vacationers (NOT deleted Vacationers)
vacationersRouter.get("/total", (req, res, next) => {
    Vacationer.find({ deletedAt: { $exists: false } }, { name: 1 })
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

// Get single vacationer with name id
vacationersRouter.get("/getById/:nameId", (req, res, next) => {
    let newName = req.params.nameId;
    console.log("newName", newName);

    Vacationer.find({ nameId: newName })
        .then((foundVacationer) => {
            if (!foundVacationer.length) {
                console.log("User does not exist, creating a user:", newName);

                let userInfo = { name: newName, nameId: newName };

                console.log("userInfo", userInfo);
                let newUser = new Vacationer(userInfo);
                console.log("newUser", newUser);
                newUser
                    .save()
                    .then((savedVacationer) => {
                        console.log("savedVacationer", savedVacationer);
                        return res.status(201).json(savedVacationer);
                    })
                    .catch((error) => {
                        console.error(error);
                        console.error("Error code:", error.code);
                        if (error.code === 11000) {
                            return res
                                .status(409)
                                .json("This username is already taken!");
                        } else {
                            next(error);
                        }
                    });
            } else {
                return res.status(200).json(foundVacationer);
            }
        })
        .catch((error) => next(error));
});

// Get single vacationer with vacations
vacationersRouter.get("/:vacationerId", (req, res, next) => {
    Vacationer.findById(req.params.vacationerId)
        .then((foundVacationer) => {
            res.status(200).json(foundVacationer);
        })
        .catch((error) => next(error));
});

// Add a vacationer
vacationersRouter.post("/", (req, res, next) => {
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
vacationersRouter.patch("/:vacationerId", (req, res, next) => {
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
vacationersRouter.patch("/:vacationerId/calendarSettings", (req, res, next) => {
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
});

// Add or remove admin role of vacationer
vacationersRouter.patch("/:vacationerId/admin", (req, res, next) => {
    const userId = req.params.vacationerId;
    const adminRole = req.body.adminRole;

    Vacationer.findByIdAndUpdate(
        userId,
        { $set: { admin: adminRole } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((error) => next(error));
});

// Add vacationer calendarSettings
vacationersRouter.post("/:vacationerId/calendarSettings", (req, res, next) => {
    const userId = req.params.vacationerId;
    const newCalendarSettings = req.body;
    console.log(
        "Adding newCalendarSettings:",
        newCalendarSettings,
        " ",
        " to vacationerId:",
        userId
    );

    Vacationer.findByIdAndUpdate(
        userId,
        { $push: { calendarSettings: newCalendarSettings } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((error) => next(error));
});

// Safe delete vacationer (can be returned with /undelete)
vacationersRouter.put("/:vacationerId/delete", (req, res, next) => {
    Vacationer.findByIdAndUpdate(
        req.params.vacationerId,
        { $set: { deletedAt: new Date() } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((deletedVacationer) => {
            res.status(200).json(deletedVacationer);
        })
        .catch((error) => next(error));
});

// Return deleted vacationer
vacationersRouter.put("/:vacationerId/undelete", (req, res, next) => {
    Vacationer.findByIdAndUpdate(
        req.params.vacationerId,
        { $unset: { deletedAt: 1 } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((returnedVacationer) => {
            res.status(200).json(returnedVacationer);
        })
        .catch((error) => next(error));
});

// Delete vacationer permanently (can not be returned)
vacationersRouter.delete("/:vacationerId", (req, res, next) => {
    Vacationer.findByIdAndRemove(req.params.vacationerId)
        .then((deletedVacationer) => {
            console.log("Deleted user", req.params.vacationerId);
            res.status(200).json(deletedVacationer);
        })
        .catch((error) => next(error));
});

// Add a vacation
vacationersRouter.post("/:vacationerId", (req, res, next) => {
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
vacationersRouter.put("/:vacationerId/:holidayId", (req, res, next) => {
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
});

// Delete a vacation
vacationersRouter.delete("/:vacationerId/:holidayId", (req, res, next) => {
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
});

module.exports = vacationersRouter;
