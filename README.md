# Vacationer API

## Environment setup
1. Clone the repo.
2. Add code formatter Prettier to your IDE: https://prettier.io/docs/en/editors.html
3. Create local mongoDB: 
    - https://www.mongodb.com/docs/manual/administration/install-community/
    - If you want to use MongoDB Compass, see: https://www.mongodb.com/docs/compass/current/connect/
4. Copy /.env.example file as /.env and add the missing values from 1Password. For database connection add:
```
REACT_APP_MONGODB_URI=mongodb://<port>/<db name> Your local mongoDB address, e.g. mongodb://localhost:27017/vacation-data 
```
5. Run
```
npm install
```

## Admin rights
After the first log in to the local Vacationer, add admin rights to your user in your local database:
```
use <db name>
 db.vacationers.updateOne({nameId: <your Github user name>},{$set: {admin: true}})
```

## Run locally:
1. Start the backend to port 3001 with
```
npm start
```

## API Documentation
Swagger endpoint <BACKEND_ADDRESS>/api-docs, e.g. http://localhost:3001/api-docs
(you need to be logged in to Vacationer)

## Development instructions
* Kanban board with Github issues: https://github.com/orgs/tieto-cem/projects/2/views/1
* When you start working on an issue, mark it on your name and move to "In progress" column in Kanban.
* Git branching strategy is Github Flow: all feature branches are created from and merged to main branch.
* From Github issue select "Create a branch" and "Checkout locally".
* In commit and PR messages, always mark issue number as a prefix, e.g. "56 description".
* Before pushing the feature branch to remote, rebase the feature branch to main branch.
* Push the feature branch to remote feature branch.
* Create a pull request: describe it well and feel free to add screenshots.
* If PR resolves also other issues, mark to comment as "Closes #<issue number>".
* When your PR has been accepted, merge it. Merging will start QA deployment.
* Move resolved issue(s) to "Test on Qa" column in Kanban. If feature branch was created from Github issue, this should happen automatically.
* Test PR change on QA environment.
* If testing is ok, move ticket to "Done" column. If not, move ticket to "In progress" column and add a new commit for PR.
* After completing ticket, inform the team about it. With team members decide when next PROD deployment will be.