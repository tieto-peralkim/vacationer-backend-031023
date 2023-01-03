const teamsRouter = require("express").Router();
const Team = require("../models/team");
const Vacationer = require("../models/vacationer");

// Get all the teams (except deletedTeams)
teamsRouter.get("/teams", (req, res, next) => {
    Team.find({deletedTeam: {$ne: true}})
        .then((team) => {
            res.status(200).json(team);
        })
        .catch((error) => next(error));
});

// Get all the deletedTeams
teamsRouter.get("/teams/deletedTeams", (req, res, next) => {
    Team.find({deletedTeam: {$in: [true]}})
        .then((team) => {
            res.status(200).json(team);
        })
        .catch((error) => next(error));
});

// Add a new team
teamsRouter.post("/teams", (req, res, next) => {
    const body = req.body;
    console.log("body", body);
    const TeamObject = new Team(body);
    TeamObject.save()
        .then((savedTeam) => {
            res.status(201).json(savedTeam);
        })
        .catch((error) => next(error));
});

teamsRouter.get("/teams/:id", (req, res, next) => {
    Team.findById(req.params.id)
        .then((foundTeam) => {
            res.status(200).json(foundTeam);
        })
        .catch((error) => next(error));
});

// Add a new member (vacationer) to team
teamsRouter.post("/teams/:id", (req, res, next) => {
    const teamId = req.params.id;
    const newMember = { name: req.body.name, vacationerId: req.body.id };

    console.log("Adding newMember:", newMember, " ", " to teamId:", teamId);

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

// Change team name
teamsRouter.patch("/teams/:id", (req, res, next) => {
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

// Change name of a team member in all the teams
teamsRouter.put("/teams/membername/:id", (req, res, next) => {
    const memberId = req.params.id;
    const newMemberName = req.body.newName;
    console.log("Modifying ", memberId, "->", newMemberName);
    Team.updateMany(
        { "members.vacationerId": memberId },
        {
            $set: {
                "members.$[elem].name": newMemberName,
            },
        },
        { arrayFilters: [{ "elem.vacationerId": memberId }], multi: true }
    )
        .then((updatedTeam) => {
            res.status(200).json(updatedTeam);
        })
        .catch((error) => next(error));
});

// Delete a team member from all the teams
teamsRouter.put("/teams/members/all", (req, res, next) => {
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
teamsRouter.put("/teams/members/:id", (req, res, next) => {
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
teamsRouter.put("/teams/:id/delete", (req, res, next) => {
    Team.findByIdAndUpdate(
        req.params.id,
        {$set: {deletedTeam: true }},
        { new: true, runValidators: true, context: "query" }
    )
        .then((deletedTeam) => {
            res.status(200).json(deletedTeam);
        })
        .catch((error) => next(error));
});

// Return deleted team
teamsRouter.put("/teams/:id/undelete", (req, res, next) => {
    Team.findByIdAndUpdate(
        req.params.id,
        {$set: {deletedTeam: false }},
        { new: true, runValidators: true, context: "query" }
    )
        .then((returnedTeam) => {
            res.status(200).json(returnedTeam);
        })
        .catch((error) => next(error));
});

// Delete team permanently (can not be returned)
teamsRouter.delete("/teams/:id", (req, res, next) => {
    Team.findByIdAndRemove(req.params.id)
        .then((deletedTeam) => {
            res.status(200).json(deletedTeam);
        })
        .catch((error) => next(error));
});

module.exports = teamsRouter;
