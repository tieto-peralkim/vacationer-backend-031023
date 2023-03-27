const teamsRouter = require("express").Router();
const Team = require("../models/team");

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
    Team.find({ deletedAt: { $exists: false } })
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
    Team.find({ deletedAt: { $ne: null } })
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
 *      summary: Create new team (TODO request id field is extra, vacationerId needed)
 *      description: Create new team
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  description: New team to be added
 *                  schema:
 *                      $ref: "#/components/schemas/team"
 *      responses:
 *          201:
 *              description: Return created team
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          409:
 *              description: When trying to create a new team, team title already taken
 *          422:
 *              description: Validation error (middleware)
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
        .catch((error) => {
            if (error.code === 11000) {
                res.status(409).json("This team title is already taken!");
                next(error);
            }
        });
});

/**
 * @openapi
 * /teams/{id}:
 *  get:
 *      tags: ["team"]
 *      summary: Get single team by MongoDB ID (also deleted)
 *      description: Get single team by MongoDB ID (also deleted)
 *      parameters:
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of the team
 *          schema:
 *              type: string
 *          required: true
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
 *      summary: Add new members (vacationers) to team (TODO check the members first)
 *      description: Add new members (vacationers) to team (TODO check the members first)
 *      requestBody:
 *          description: New members to be added
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  description: Name of member
 *                                  type: string
 *                              vacationerId:
 *                                  description: MongoDB ID of member
 *                                  type: string
 *      parameters:
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of team
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
        let newMember = { name: member.name, vacationerId: member.id };
        Team.findByIdAndUpdate(
            teamId,
            { $push: { members: newMember } },
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
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          newName:
 *                              description: New team name
 *                              type: string
 *      parameters:
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
 * /teams/membername/{id}:
 *  put:
 *      tags: ["team"]
 *      summary: Change name of member in all the teams
 *      description: Change name of member in all the teams
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          newName:
 *                              description: New name of member
 *                              type: string
 *      parameters:
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of modifiable member
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns MongoDB logging
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
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
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/members/all/:
 *  put:
 *      tags: ["team"]
 *      summary: Delete a team member from all teams (TODO change to DELETE?)
 *      description: Delete a team member from all teams
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              description: MongoDB ID of deletable member
 *                              type: string
 *      responses:
 *          200:
 *              description: Returns MongoDB logging
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.put("/members/all", (req, res, next) => {
    const memberId = req.body.id;
    console.log("Deleting ", memberId);
    Team.updateMany({
        $pull: {
            members: { vacationerId: memberId },
        },
    })
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/members/{id}/:
 *  put:
 *      tags: ["team"]
 *      summary: Delete a team member from specific team (TODO change to DELETE?)
 *      description: Delete a team member from specific team
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          vacationerId:
 *                              description: MongoDB ID of deletable member
 *                              type: string
 *      parameters:
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of team
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns MongoDB logging
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.put("/members/:id", (req, res, next) => {
    const teamId = req.params.id;
    const memberId = req.body.vacationerId;
    Team.updateOne(
        { _id: teamId },
        {
            $pull: {
                members: { vacationerId: memberId },
            },
        }
    )
        .then((response) => {
            res.status(200).json(response);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/{id}/delete:
 *  put:
 *      tags: ["team"]
 *      summary: Safe delete team
 *      description: Safe delete team
 *      parameters:
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of deletable team
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns deleted team
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.put("/:id/delete", (req, res, next) => {
    console.log("deleting", req.params.id);
    Team.findByIdAndUpdate(
        req.params.id,
        { $set: { deletedAt: new Date() } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((deletedTeam) => {
            console.log("delete", deletedTeam);
            res.status(200).json(deletedTeam);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/{id}/undelete:
 *  put:
 *      tags: ["team"]
 *      summary: Return deleted team
 *      description: Return deleted team
 *      parameters:
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of returnable team
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns undeleted team
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.put("/:id/undelete", (req, res, next) => {
    Team.findByIdAndUpdate(
        req.params.id,
        { $unset: { deletedAt: 1 } },
        { new: true, runValidators: true, context: "query" }
    )
        .then((returnedTeam) => {
            res.status(200).json(returnedTeam);
        })
        .catch((error) => next(error));
});

/**
 * @openapi
 * /teams/{id}:
 *  delete:
 *      tags: ["team"]
 *      summary: Delete team permanently
 *      description: Delete team permanently
 *      parameters:
 *      -   in: path
 *          name: id
 *          description: MongoDB ID of deletable team
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Returns permanently deleted team
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/team"
 *          401:
 *              description: Unauthenticated user
 *          500:
 *              description: Internal server error
 */
teamsRouter.delete("/:id", (req, res, next) => {
    Team.findByIdAndRemove(req.params.id)
        .then((deletedTeam) => {
            res.status(200).json(deletedTeam);
        })
        .catch((error) => next(error));
});

module.exports = teamsRouter;
