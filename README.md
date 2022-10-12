# Vacationer app backend

## Development instructions
* Create local mongo DB: 
    https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/
    - If you want download MongoDB Compass and connect to backend eg. port 27017 see: 
    https://www.mongodb.com/docs/compass/current/connect/ And create a database. 
    If not, from terminal create a database there and add some item that it last the db. If you only create db without adding a item will not be created.
    - Connect to backend: change in your .env the REACT_APP_MONGODB_URI for mongodb://<port>/<db name>
* Add three local environment variables (e.g. by creating an .env file to root of the repo): REACT_APP_MONGODB_URI=mongodb://localhost:27017/vacation-data, REACT_APP_SLACK_URI and REACT_APP_ADDRESS. The values of the latter two you can get from other developers of the project.

* Normal process:
1. Start the backend with "npm run dev"
2. Go to http://localhost:3001 to see the backend API.

### TO-DO 12.10.
1. Limit the rights of AWS AMS vacationer users to EC2?