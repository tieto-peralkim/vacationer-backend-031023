"use strict";

const vacationersRouter = require("express").Router();
const Vacationer = require("../models/vacationer");
const { isAdmin } = require("../utils/middleware");
const maxNameLength = 12;
const minNameLength = 3;

// TODO: For the swagger, add vacation body structure. Add it for body of POST /vacationers
// -  in: path
// name: name
// description: Username in the application
// schema:
//     type: string
// required: true
// -  in: path
// name: nameId
// description: Github user name
// schema:
//     type: string
// required: true
//TODO: Is the endpoint needed?
/**
 * @openapi
 * /vacationers:
 *  get:
 *      tags: ["vacationer"]
 *      summary: Get all the vacationers (NOT deleted vacationers) and their vacations
 *      description: Get all the vacationers (NOT deleted vacationers) and their vacations
 *      responses:
 *          200:
 *              description: Returns all vacationers
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 *
 */
vacationersRouter.get("/", (req, res, next) => {
    Vacationer.find({ deletedAt: { $exists: false } })
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

//TODO: Is the endpoint needed?
/**
 * @openapi
 * /vacationers/allUsers:
 *  get:
 *      tags: ["vacationer"]
 *      summary: Get all the vacationers (also deleted) and their vacations
 *      description: Get all the vacationers (also deleted) and their vacations
 *      responses:
 *          200:
 *              description: Returns all vacationers (also deleted)
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
vacationersRouter.get("/allUsers", (req, res, next) => {
    Vacationer.find()
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /vacationers/deleted:
 *  get:
 *      tags: ["vacationer"]
 *      summary: Get only the deleted vacationers and their vacations
 *      description: Get only the deleted vacationers and their vacations
 *      responses:
 *          200:
 *              description: Returns deleted vacationers
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
vacationersRouter.get("/deleted", (req, res, next) => {
    Vacationer.find({ deletedAt: { $ne: null } })
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /vacationers/total:
 *  get:
 *      tags: ["vacationer"]
 *      summary: Get all the vacationers in short form (NOT deleted vacationers)
 *      description: Get all the vacationers in short form (NOT deleted vacationers)
 *      responses:
 *          200:
 *              description: Returns name and id of vacationers
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              type: object
 *                              properties:
 *                                  name:
 *                                      type: string
 *                                      description: User name of vacationer
 *                                  id:
 *                                      type: string
 *                                      description: Id of vacationer
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
vacationersRouter.get("/total", (req, res, next) => {
    Vacationer.find({ deletedAt: { $exists: false } }, { name: 1 })
        .then((vacationer) => {
            res.status(200).json(vacationer);
        })
        .catch((error) => next(error));
});
/**
 * @openapi
 * /vacationers/getById/{nameId}:
 *  get:
 *      tags: ["vacationer"]
 *      summary: Get single vacationer by name id. If not found, create a new user
 *      description: Get single vacationer by name id. If not found, create a new user
 *      parameters:
 *      -   in: path
 *          name: nameId
 *          description: NameId of the user
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns single vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          201:
 *              description: User not found, created a new user successfully
 *          400:
 *              description: Username too short
 *          401:
 *              description: Unauthenticated user
 *          409:
 *              description: User not found, when trying to create a new user, user name already taken
 *          500:
 *              description: Internal server error
 */
vacationersRouter.get("/getById/:nameId", (req, res, next) => {
    let newNameId = req.params.nameId;

    Vacationer.find({ nameId: newNameId })
        .then((foundVacationer) => {
            if (!foundVacationer.length) {
                console.log("User does not exist, creating a user:", newNameId);

                let newName = newNameId;
                if (newNameId.length < minNameLength) {
                    return res
                        .status(400)
                        .json(`Username under ${minNameLength} characters`);
                }

                if (newNameId.length > maxNameLength) {
                    newName = newName.slice(0, maxNameLength);
                }

                let userInfo = { name: newName, nameId: newNameId };

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
                        next(error);
                    });
            } else {
                return res.status(200).json(foundVacationer);
            }
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /vacationers/{vacationerId}:
 *  get:
 *      tags: ["vacationer"]
 *      summary: Get single vacationer by MongoDB ID (also deleted)
 *      description: Get single vacationer by MongoDB ID (also deleted)
 *      parameters:
 *      -   in: path
 *          name: vacationerId
 *          description: MongoDB ID of the vacationer
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns single vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
vacationersRouter.get("/:vacationerId", (req, res, next) => {
    Vacationer.findById(req.params.vacationerId)
        .then((foundVacationer) => {
            res.status(200).json(foundVacationer);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /vacationers:
 *  post:
 *      tags: ["vacationer"]
 *      summary: Add a vacationer (TODO id, deletedAt fields and fields inside vacations are extra)
 *      description: Add a vacationer
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  description: New vacationer to be added
 *                  schema:
 *                      $ref: "#/components/schemas/vacationer"
 *      responses:
 *          201:
 *              description: Returns added vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          400:
 *              description: Username wrong length
 *          401:
 *              description: Unauthenticated user
 *          403:
 *              description: Access denied. The user does not have admin rights
 *          409:
 *              description: When trying to create a new user, user name already taken
 *          422:
 *              description: Validation error (middleware)
 *          500:
 *              description: Internal server error
 */
vacationersRouter.post("/", [isAdmin()], (req, res, next) => {
    const body = req.body;

    if (
        body.name.length <= maxNameLength &&
        body.name.length >= minNameLength
    ) {
        const VacationerObject = new Vacationer(body);
        VacationerObject.save()
            .then((savedVacationer) => {
                res.status(201).json(savedVacationer);
            })
            .catch((error) => {
                if (error.code === 11000) {
                    res.status(409).send("This username is already taken!");
                } else {
                    next(error);
                }
            });
    } else {
        res.status(400).json(
            `Username not between ${minNameLength}-${maxNameLength} characters`
        );
    }
});

/**
 * @openapi
 * /vacationers/{vacationerId}:
 *  patch:
 *      tags: ["vacationer"]
 *      summary: Change name of a single vacationer
 *      description: Change name of a single vacationer
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          newName:
 *                              description: New name for vacationer
 *                              type: string
 *      parameters:
 *      -   in: path
 *          name: vacationerId
 *          description: MongoDB ID of the vacationer
 *          type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns updated vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          400:
 *              description: Username wrong length
 *          401:
 *              description: Unauthenticated user
 *          409:
 *              description: User with the same name already exists
 *          500:
 *              description: Internal server error
 */
vacationersRouter.patch("/:vacationerId", (req, res, next) => {
    const userId = req.params.vacationerId;
    const newName = req.body.newName;

    console.log("Changing user:", userId, " ", "name to", newName);

    if (newName.length <= maxNameLength && newName.length >= minNameLength) {
        Vacationer.findByIdAndUpdate(
            userId,
            { $set: { name: newName } },
            { new: true, runValidators: true }
        )
            .then((updatedUser) => {
                res.status(200).json(updatedUser);
            })
            .catch((error) => {
                if (error.code === 11000) {
                    res.status(409).send("This username is already taken!");
                } else {
                    next(error);
                }
            });
    } else {
        res.status(400).json(
            `Username not between ${minNameLength}-${maxNameLength} characters`
        );
    }
});

/**
 * @openapi
 * /vacationers/{vacationerId}/calendarSettings:
 *  patch:
 *      tags: ["vacationer"]
 *      summary: Change calendar settings of single vacationer
 *      description: Change calendar settings of single vacationer
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          newCalendarSettings:
 *                              description: Updated calendar settings for vacationer
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      holidayColor:
 *                                          type: string
 *                                          default: "#73D8FF"
 *                                          description: Holiday color
 *                                      unConfirmedHolidayColor:
 *                                          type: string
 *                                          default: "#68CCCA"
 *                                          description: Unconfirmed holiday color
 *                                      weekendColor:
 *                                          type: string
 *                                          default: "#808080"
 *                                          description: Weekend color
 *                                      weekendHolidayColor:
 *                                          type: string
 *                                          default: "#CCCCCC"
 *                                          description: Weekend holiday color
 *                                      holidaySymbol:
 *                                          type: string
 *                                          default: "X"
 *                                          description: Holiday symbol
 *                                      unConfirmedHolidaySymbol:
 *                                          type: string
 *                                          default: "Y"
 *                                          description: Unconfirmed holiday symbol
 *      parameters:
 *      -   in: path
 *          name: vacationerId
 *          description: MongoDB ID of the vacationer
 *          type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns updated vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
vacationersRouter.patch("/:vacationerId/calendarSettings", (req, res, next) => {
    const userId = req.params.vacationerId;
    const newCalendarSettings = req.body.newCalendarSettings;

    Vacationer.findByIdAndUpdate(
        userId,
        { $set: { calendarSettings: newCalendarSettings } },
        { new: true, runValidators: true }
    )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /vacationers/{vacationerId}/admin:
 *  patch:
 *      tags: ["vacationer"]
 *      summary: Add or remove admin role of single vacationer
 *      description: Add or remove admin role of single vacationer
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          adminRole:
 *                              description: Admin role status
 *                              type: boolean
 *      parameters:
 *      -   in: path
 *          name: vacationerId
 *          description: MongoDB ID of the vacationer
 *          type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns updated vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          403:
 *              description: Access denied. The user does not have admin rights
 *          500:
 *              description: Internal server error
 */
vacationersRouter.patch(
    "/:vacationerId/admin",
    [isAdmin()],
    (req, res, next) => {
        const userId = req.params.vacationerId;
        const adminRole = req.body.adminRole;

        Vacationer.findByIdAndUpdate(
            userId,
            { $set: { admin: adminRole } },
            { new: true, runValidators: true }
        )
            .then((updatedUser) => {
                res.status(200).json(updatedUser);
            })
            .catch((error) => next(error));
    }
);

/**
 * @openapi
 * /vacationers/{vacationerId}/calendarSettings:
 *  post:
 *      tags: ["vacationer"]
 *      summary: Add new set of calendar settings of single vacationer (not implemented yet)
 *      description: Add new set of calendar settings of single vacationer (not implemented yet)
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      description: New calendar settings for vacationer
 *                      type: object
 *                      properties:
 *                          holidayColor:
 *                              type: string
 *                              default: "#73D8FF"
 *                              description: Holiday color
 *                          unConfirmedHolidayColor:
 *                              type: string
 *                              default: "#68CCCA"
 *                              description: Unconfirmed holiday color
 *                          weekendColor:
 *                               type: string
 *                               default: "#808080"
 *                               description: Weekend color
 *                          weekendHolidayColor:
 *                               type: string
 *                               default: "#CCCCCC"
 *                               description: Weekend holiday color
 *                          holidaySymbol:
 *                               type: string
 *                               default: "X"
 *                               description: Holiday symbol
 *                          unConfirmedHolidaySymbol:
 *                               type: string
 *                               default: "Y"
 *                               description: Unconfirmed holiday symbol
 *      parameters:
 *      -   in: path
 *          name: vacationerId
 *          description: MongoDB ID of the vacationer
 *          type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns updated vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 *      deprecated: true
 */
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
        { new: true, runValidators: true }
    )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /vacationers/{vacationerId}/delete:
 *  put:
 *      tags: ["vacationer"]
 *      summary: Safe delete vacationer (can be returned with /undelete)
 *      description: Safe delete vacationer (can be returned with /undelete)
 *      parameters:
 *      -   in: path
 *          name: vacationerId
 *          description: MongoDB ID of the vacationer
 *          type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns safe deleted vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          403:
 *              description: Access denied. The user does not have admin rights
 *          500:
 *              description: Internal server error
 */
vacationersRouter.put(
    "/:vacationerId/delete",
    [isAdmin()],
    (req, res, next) => {
        Vacationer.findByIdAndUpdate(
            req.params.vacationerId,
            { $set: { deletedAt: new Date() } },
            { new: true, runValidators: true }
        )
            .then((deletedVacationer) => {
                res.status(200).json(deletedVacationer);
            })
            .catch((error) => next(error));
    }
);

/**
 * @openapi
 * /vacationers/{vacationerId}/undelete:
 *  put:
 *      tags: ["vacationer"]
 *      summary: Return deleted vacationer (safe delete)
 *      description: Return deleted vacationer (safe delete)
 *      parameters:
 *      -   in: path
 *          name: vacationerId
 *          description: MongoDB ID of the vacationer
 *          type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns undeleted vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          403:
 *              description: Access denied. The user does not have admin rights
 *          500:
 *              description: Internal server error
 */
vacationersRouter.put(
    "/:vacationerId/undelete",
    [isAdmin()],
    (req, res, next) => {
        Vacationer.findByIdAndUpdate(
            req.params.vacationerId,
            { $unset: { deletedAt: 1 } },
            { new: true, runValidators: true }
        )
            .then((returnedVacationer) => {
                res.status(200).json(returnedVacationer);
            })
            .catch((error) => next(error));
    }
);

/**
 * @openapi
 * /vacationers/{vacationerId}:
 *  delete:
 *      tags: ["vacationer"]
 *      summary: Delete vacationer permanently
 *      description: Delete vacationer permanently
 *      parameters:
 *      -   in: path
 *          name: vacationerId
 *          description: MongoDB ID of the deletable vacationer
 *          type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns deleted vacationer
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          403:
 *              description: Access denied. The user does not have admin rights
 *          500:
 *              description: Internal server error
 */
vacationersRouter.delete("/:vacationerId", [isAdmin()], (req, res, next) => {
    Vacationer.findByIdAndRemove(req.params.vacationerId)
        .then((deletedVacationer) => {
            console.log("Deleted user", req.params.vacationerId);
            res.status(200).json(deletedVacationer);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /vacationers/{vacationerId}:
 *  post:
 *      tags: ["vacationer"]
 *      summary: Add a vacation for vacationer TODO use to-be-added Vacation model
 *      description: Add a vacation for vacationer
 *      requestBody:
 *          description: New vacation to be added
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/vacationer"
 *      parameters:
 *       -  in: path
 *          name: vacationerId
 *          description: MongoDB ID of vacationer of the new vacation
 *          type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns vacationer whose vacation was added
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
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
        { new: true, runValidators: true }
    )
        .then((updatedVacationer) => {
            res.status(200).json(updatedVacationer);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /vacationers/{vacationerId}/{holidayId}:
 *  put:
 *      tags: ["vacationer"]
 *      summary: Modify vacation (creates also a new vacation id) TODO use to-be-added Vacation model
 *      description: Modify vacation (creates also a new vacation id)
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  description: Modified holiday
 *      parameters:
 *       -  in: path
 *          name: vacationerId
 *          description: MongoDB ID of vacationer of the modified vacation
 *          schema:
 *              type: string
 *          required: true
 *       -  in: path
 *          name: holidayId
 *          description: MongoDB ID of Vacation of the modified vacation
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns vacationer whose vacation was modified
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
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

/**
 * @openapi
 * /vacationers/{vacationerId}/{holidayId}:
 *  delete:
 *      tags: ["vacationer"]
 *      summary: Delete vacation permanently
 *      description: Delete vacation permanently
 *      parameters:
 *      -  in: path
 *         name: vacationerId
 *         description: MongoDB ID of vacationer of the modified vacation
 *         schema:
 *             type: string
 *         required: true
 *      -  in: path
 *         name: holidayId
 *         description: MongoDB ID of the modified vacation
 *         schema:
 *             type: string
 *         required: true
 *      responses:
 *          200:
 *              description: Returns permanently deleted vacation
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/vacationer"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
vacationersRouter.delete("/:vacationerId/:holidayId", (req, res, next) => {
    console.log(
        "Deleting vacationerId",
        req.params.vacationerId,
        "holidayId",
        req.params.holidayId
    );
    // TODO: MongoDB pull will not raise an Error. Create logic for error?
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
