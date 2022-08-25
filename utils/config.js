require('dotenv').config()

const {DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, NODE_LOCAL_PORT} = process.env;

module.exports = {
    //MONGODB_URI: `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`,
    NODE_LOCAL_PORT
}