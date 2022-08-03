const config = require('./utils/config')
const express = require('express');
const morgan = require('morgan')
const app = express();
const cors = require('cors')
const vacationsRouter = require('./controllers/vacationers')
const teamsRouter = require('./controllers/teams')
const timeframesRouter = require('./controllers/timeframes')

const middleWare = require('./utils/middleware')
const mongoose = require('mongoose')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

app.use(cors())
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));

app.use(vacationsRouter)
app.use(teamsRouter)
app.use(timeframesRouter)

app.use(middleWare.unknownEndpoint)
app.use(middleWare.errorHandler)

module.exports = app