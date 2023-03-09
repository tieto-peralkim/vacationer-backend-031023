# Vacationer app backend

## Development instructions
* Create local mongoDB: 
    - https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/
    - If you want download MongoDB Compass and connect to backend eg. port 27017 see: 
    https://www.mongodb.com/docs/compass/current/connect/ And create a database. 
    - If not, from terminal create a database there and add some item that it last the db. If you only create db without adding a item will not be created.
* In the root of repo copy .env.example file to .env and add the values (get rest of the values from 1Password):
* Integrate code formatter Prettier to your IDE, check https://prettier.io/docs/en/editors.html

```
REACT_APP_MONGODB_URI=mongodb://<port>/<db name> Your local mongoDB address, e.g. mongodb://localhost:27017/vacation-data 
```

Normal process:
- Start the backend with
```
npm start
```
- Consume the API with http://localhost:3001/<ENDPOINT>