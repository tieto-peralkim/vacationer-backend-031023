# Vacationer app backend

## Development instructions
1. Create local mongo DB: 
    https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/
    - If you want download MongoDB Compass and connect to backend eg. port 27017 see: 
    https://www.mongodb.com/docs/compass/current/connect/ And create a database. 
    If not, from terminal create a database there and add some item that it last the db. If you only create db without adding a item will not be created.
    - Connect to backend: change in your .env the REACT_APP_MONGODB_URI for mongodb://<port>/<db name>
2. Create .env file: add ....
3. Start backend start: npm run dev
4. Start frontend
5. ...

### TO-DO 21.9.
1. Creating production version including DocumentDB database
2. Check AWS settings (cleanups, billing… )