const teamsRouter = require('express').Router()
const Team = require('../models/team');

teamsRouter.get('/teams', (req, res, next) => {
    Team.find({})
        .then(team => {
            res.status(200).json(team)
        })
        .catch(error => next(error))
})

teamsRouter.post('/teams', (req, res, next) => {
    const body = req.body
    console.log("body", body)
    const TeamObject = new Team(body)
    TeamObject.save()
        .then(savedTeam => {
            res.status(201).json(savedTeam)
        })
        .catch(error => next(error))
})

teamsRouter.get('/teams/:id', (req, res, next) => {
    Team.findById(req.params.id)
        .then(foundTeam => {
            res.status(200).json(foundTeam)
        })
        .catch(error => next(error))
})

// Receives Vacationer to add to team
teamsRouter.put('/teams/:id', (req, res, next) => {
    const teamId = req.params.id;
    const newMember = {name: req.body.name, vacationerId: req.body.id};

    console.log("Adding newMember:", newMember, " ", " to ->", teamId);

    Team.findByIdAndUpdate(
        teamId, {$push: {members: newMember}}, {new: true, runValidators: true, context: 'query'})
        .then(updatedTeam => {
            res.status(200).json(updatedTeam)
        })
        .catch(error => next(error))
})

teamsRouter.patch('/teams/:id', (req, res, next) => {
    const teamId = req.params.id;
    const newName = req.body.newName;

    console.log("Changing team:", teamId, " ", "name to", newName);

    Team.findByIdAndUpdate(
        teamId, {$set: {title: newName}}, {new: true, runValidators: true, context: 'query'})
        .then(updatedTeam => {
            res.status(200).json(updatedTeam)
        })
        .catch(error => next(error))
})

// Change name of a team member in all the teams
teamsRouter.put('/teams/membername/:id', (req, res, next) => {
    const memberId = req.params.id;
    const newMemberName = req.body.newName;
    console.log("nyt muokataan ", memberId, "->", newMemberName)
    Team.updateMany( {"members.vacationerId": memberId},
        {
            $set: {
                "members.$[elem].name": newMemberName
            }},
    {arrayFilters: [{"elem.vacationerId": memberId}], "multi": true}
    )
        .then(updatedTeam => {
            res.status(200).json(updatedTeam)
        })
        .catch(error => next(error))
})

// Delete a team member from all the teams
teamsRouter.put('/teams/members/all', (req, res, next) => {
    const memberId = req.body.id;
    console.log("nyt poistetaan ", req.body.name, ":", memberId)
    Team.updateMany( {
        $pull: {
            members: {vacationerId: memberId}
        }
    })
        .then(updatedTeam => {
            res.status(200).json(updatedTeam)
        })
        .catch(error => next(error))
})

// Delete a team member from spesific team
teamsRouter.put('/teams/members/:id', (req, res, next) => {
    const teamId = req.params.id;
    const memberId = req.body.vacationerId;
    console.log("IDs", teamId, memberId)
    Team.updateOne({_id: teamId}, {
        $pull: {
            members: {vacationerId: memberId}
        }
    })
        .then(updatedTeam => {
            res.status(200).json(updatedTeam)
        })
        .catch(error => next(error))
})

teamsRouter.delete('/teams/:id', (req, res, next) => {
    Team.findByIdAndRemove(req.params.id)
        .then(deletedTeam => {
            res.status(200).json(deletedTeam)
        })
        .catch(error => next(error))
})

module.exports = teamsRouter