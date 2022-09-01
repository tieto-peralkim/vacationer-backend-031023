require('dotenv').config()

const {MONGODB_URI, NODE_LOCAL_PORT} = process.env;

module.exports = {
    MONGODB_URI,
    NODE_LOCAL_PORT
}