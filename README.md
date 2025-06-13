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
