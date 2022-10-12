# Vacationer app backend

## Development instructions
* Create local mongoDB: 
    https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/
    - If you want download MongoDB Compass and connect to backend eg. port 27017 see: 
    https://www.mongodb.com/docs/compass/current/connect/ And create a database. 
    If not, from terminal create a database there and add some item that it last the db. If you only create db without adding a item will not be created.
* Add three local environment variables (e.g. by creating an .env file to root of the repo)
1. REACT_APP_MONGODB_URI=mongodb://<port>/<db name> Your local mongoDB address, e.g. mongodb://localhost:27017/vacation-data
2. REACT_APP_SLACK_URI=<Slack webhook address> Get this value from other developers of the project.

* Normal process:
1. Start the backend with "npm run dev"
2. Go to http://localhost:3001 to see the backend API.

### TO-DO 12.10.
1. Limit the rights of AWS AMS vacationer users to EC2?