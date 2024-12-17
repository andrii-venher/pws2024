// foreign dependencies
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('uuid')
const mongoose = require('mongoose')
const expressSession = require('express-session')
const passport = require('passport')
const passportJson = require('passport-json')

console.log('Backend starting...')

// default configuration, override it by config.json
let config = {
    port: 8000,
    frontend: './pws2024-vue/dist',
    dbUrl: 'mongodb://localhost:27017/pws'
}

try {
    config = JSON.parse(fs.readFileSync('config.json'))
    console.log('Configuration from config.json')
} catch(err) {
    console.log('Using default configuration')
}

// own modules
const auth = require('./auth')
const person = require('./person')
const project = require('./project')

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())
app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message })
})

// initialize mechanisms of sessions handling and authorization
app.use(expressSession({ secret: config.dbUrl, resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportJson.Strategy(auth.checkCredentials))
passport.serializeUser(auth.serialize)
passport.deserializeUser(auth.deserialize)

app.use(express.static(config.frontend))

// authentication endpoints
const authEndpoint = '/api/auth'
app.get(authEndpoint, auth.whoami)
app.post(authEndpoint, passport.authenticate('json', { failWithError: true }), auth.login, auth.errorHandler)
app.delete(authEndpoint, auth.logout)

app.get(person.endpoint, auth.checkIfInRole([0,1]), person.get)
app.post(person.endpoint, auth.checkIfInRole([0]), person.post)
app.put(person.endpoint, auth.checkIfInRole([0]), person.put)
app.delete(person.endpoint, auth.checkIfInRole([0]), person.delete)

app.get(project.endpoint, project.get)
app.post(project.endpoint, auth.checkIfInRole([0]), project.post)
app.put(project.endpoint, auth.checkIfInRole([0]), project.put)
app.delete(project.endpoint, auth.checkIfInRole([0]), project.delete)

mongoose.connect(config.dbUrl)
.then(conn => {
    console.log(`Connection to ${config.dbUrl} established`)

    person.init(conn)
    project.init(conn)

    app.listen(config.port, () => {
        console.log('Backend listening on port', config.port)
    })    
})
.catch(err => {
    console.error(`Connection to ${config.dbUrl} cannot be established`)
    process.exit(0)
})