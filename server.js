const app = require("./app")
const http = require("http")
const config = require('./utils/config')
const server = http.createServer(app)

server.listen(config.NODE_LOCAL_PORT, () => {
    console.log(`Server running on port ${config.NODE_LOCAL_PORT}`)
})




