const teamsRouter = require("express").Router();
const Team = require("../models/team");

// TODO: add body variables
/**
 * @openapi
 * /teams:
 *  get:
 *      tags: ["team"]
 *      summary: Get all the teams (except deleted teams)
 *      description: Get all the teams (except deleted teams)
 *      responses:
 *          200:
 *              description: Return all teams
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.get("/", (req, res, next) => {
    Team.find({ deletedTeam: { $ne: true } })
        .then((team) => {
            res.status(200).json(team);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/deleted:
 *  get:
 *      tags: ["team"]
 *      summary: Get all the deleted teams
 *      description: Get all the deleted teams
 *      responses:
 *          200:
 *              description: Returns only deleted teams
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.get("/deleted", (req, res, next) => {
    Team.find({ deletedTeam: { $in: [true] } })
        .then((team) => {
            res.status(200).json(team);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams:
 *  post:
 *      tags: ["team"]
 *      summary: Create new team
 *      description: Create new team
 *      parameters:
 *      -   in: body
 *          name: body
 *          description: New team to be added
 *          schema:
 *              $ref: "#/components/schemas/team"
 *          required: true
 *      responses:
 *          201:
 *              description: Return created team
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.post("/", (req, res, next) => {
    const body = req.body;
    console.log("body", body);
    const TeamObject = new Team(body);
    TeamObject.save()
        .then((savedTeam) => {
            res.status(201).json(savedTeam);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/{id}:
 *  get:
 *      tags: ["team"]
 *      summary: Get single team by MongoDB ID
 *      description: Get single team by MongoDB ID
 *      responses:
 *          200:
 *              description: Returns single team
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.get("/:id", (req, res, next) => {
    Team.findById(req.params.id)
        .then((foundTeam) => {
            res.status(200).json(foundTeam);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/{id}:
 *  post:
 *      tags: ["team"]
 *      summary: Add new members (vacationers) to team
 *      description: Add new members (vacationers) to team
 *      parameters:
 *      -   in: body
 *          name: body
 *          description: New members
 *          schema:
 *              type: object
 *          required: true
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of target team
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns updated team
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.post("/:id", (req, res, next) => {
    const teamId = req.params.id;
    const newMembers = req.body;

    console.log(newMembers);

    newMembers.forEach((member) => {
        Team.findByIdAndUpdate(
            teamId,
            { $push: { members: member } },
            { new: true, runValidators: true, context: "query" }
        )
            .then((updatedTeam) => {
                res.status(200).json(updatedTeam);
            })
            .catch((error) => next(error));
    });
});

/**
 * @openapi
 * /teams/{id}:
 *  patch:
 *      tags: ["team"]
 *      summary: Change team name
 *      description: Change team name
 *      parameters:
 *      -   in: body
 *          name: body
 *          description: New team name
 *          schema:
 *              type: object
 *          required: true
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of modifiable team
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns updated team
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.patch("/:id", (req, res, next) => {
    const teamId = req.params.id;
    const newName = req.body.newName;

    console.log("Changing team:", teamId, " ", "name to", newName);

    Team.findByIdAndUpdate(
        teamId,
        { $set: { title: newName } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((updatedTeam) => {
            res.status(200).json(updatedTeam);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/{id}:
 *  patch:
 *      tags: ["team"]
 *      summary: Change name of member in all the teams
 *      description: Change name of member in all the teams
 *      parameters:
 *      -   in: body
 *          name: body
 *          description: New member name
 *          schema:
 *              type: object
 *          required: true
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of modifiable member
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns new member name
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.put("/membername/:id", (req, res, next) => {
    const memberId = req.params.id;
    const newMemberName = req.body.newName;
    console.log("Modifying team member name", memberId, "->", newMemberName);
    Team.updateMany(
        { "members.vacationerId": memberId },
        {
            $set: {
                "members.$[elem].name": newMemberName,
            },
        },
        { arrayFilters: [{ "elem.vacationerId": memberId }], multi: true }
    )
        .then(() => {
            res.status(200).json(newMemberName);
        })
        .catch((error) => next(error));
});

// Delete a team member from all the teams
teamsRouter.put("/members/all", (req, res, next) => {
    const memberId = req.body.id;
    console.log("Deleting ", req.body.name, ":", memberId);
    Team.updateMany({
        $pull: {
            members: { vacationerId: memberId },
        },
    })
        .then((updatedTeam) => {
            res.status(200).json(updatedTeam);
        })
        .catch((error) => next(error));
});

// Delete a team member from specific team
teamsRouter.put("/members/:id", (req, res, next) => {
    const teamId = req.params.id;
    const memberId = req.body.vacationerId;
    console.log("IDs", teamId, memberId);
    Team.updateOne(
        { _id: teamId },
        {
            $pull: {
                members: { vacationerId: memberId },
            },
        }
    )
        .then((updatedTeam) => {
            res.status(200).json(updatedTeam);
        })
        .catch((error) => next(error));
});

// Safe delete team (can be returned with /undelete)
teamsRouter.put("/:id/delete", (req, res, next) => {
    console.log("deleting", req.params.id);
    Team.findByIdAndUpdate(
        req.params.id,
        { $set: { deletedTeam: true }, deletedAt: new Date() },
        { new: true, runValidators: true, context: "query" }
    )
        .then((deletedTeam) => {
            console.log("delete", deletedTeam);
            res.status(200).json(deletedTeam);
        })
        .catch((error) => next(error));
});

// Return deleted team
teamsRouter.put("/:id/undelete", (req, res, next) => {
    Team.findByIdAndUpdate(
        req.params.id,
        { $set: { deletedTeam: false } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((returnedTeam) => {
            res.status(200).json(returnedTeam);
        })
        .catch((error) => next(error));
});

// Delete team permanently (can not be returned)
teamsRouter.delete("/:id", (req, res, next) => {
    Team.findByIdAndRemove(req.params.id)
        .then((deletedTeam) => {
            res.status(200).json(deletedTeam);
        })
        .catch((error) => next(error));
});

module.exports = teamsRouter;
