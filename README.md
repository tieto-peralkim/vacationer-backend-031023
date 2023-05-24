# Vacationer API

## API Documentation
Swagger (you need to be logged in to Vacationer):
- endpoint <BACKEND_ADDRESS>/api-docs, e.g. http://localhost:3001/api-docs

## Environment setup
* Clone the repo
* Add code formatter Prettier to your IDE: https://prettier.io/docs/en/editors.html
* Create local mongoDB: 
    - https://www.mongodb.com/docs/manual/administration/install-community/
    - If you want download MongoDB Compass and connect to backend eg. port 27017 see: 
    https://www.mongodb.com/docs/compass/current/connect/ And create a database. 
* Copy /.env.example file as /.env and add the missing values (from 1Password).
* For database connection add to .env
```
REACT_APP_MONGODB_URI=mongodb://<port>/<db name> Your local mongoDB address, e.g. mongodb://localhost:27017/vacation-data 
```
* Run
```
npm install
```

## Admin rights
* After the first log in to the local Vacationer, add admin rights to your user in your local database:
```
use <db name>
 db.vacationers.updateOne({nameId: <your Github user name>},{$set: {admin: true}})
```

## Run local version:
- Start the backend with
```
npm start
```
- Consume the API with http://localhost:3001/<ENDPOINT>

## Development instructions
* Kanban board with Github issues: https://github.com/orgs/tieto-cem/projects/2/views/1
* When you start working on a ticket, mark it on your name and move to "In progress" column in Kanban
* If ticket doesn't require code changes, report your progress to the ticket and inform the team.
* From Github issue select "Create a branch" and "Checkout locally"
* Git branching strategy is Github Flow: all feature branches are created from and merged to main branch
* In commit and PR messages, mark ticket number as a prefix, e.g. "56 <description>"
* After changes have been committed, rebase the feature branch to main branch
* Push the feature branch to remote feature branch
* Create a pull request: describe the change well and feel free to add screenshots.
* If PR resolves also other tickets, mark to comment as "Closes #<ticket number>"
* When PR has been accepted, merge it. Merging will start QA deployment.
* If feature branch was created from Github issue, issue should move automatically to "Test on Qa" column in Kanban
* Test ticket on QA. If successful, move ticket to "Done" column. If not, move ticket to "In progress" column and create a new PR for the ticket

## PROD deployments
* After completing ticket, inform the team about it. With team members decide when next PROD deployment will be.
* PROD deployments should be done often enough
* How to: https://tietoevry-experience.atlassian.net/wiki/spaces/SUP/pages/3824844801/Vacationer+Lomasovellus#How-to-deploy