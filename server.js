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

const personSchema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    firstName: { type: String, required: true, validate: {
        validator: v => {
          return /^\p{L}/u.test(v);
        },
        message: props => `${props.value} does not start from a letter`
      }
    },
    lastName: { type: String, required: true, validate: {
        validator: v => {
          return /^\p{L}/u.test(v);
        },
        message: props => `${props.value} does not start from a letter`
      }
    },
    birthDate: { type: Date, required: true, transform: v => v.toISOString().substr(0, 10) }
}, {
    versionKey: false,
    additionalProperties: false
})

let Person = null
mongoose.connect(config.dbUrl)
.then(conn => {
    console.log(`Connection to ${config.dbUrl} established`)
    Person = conn.model('Person', personSchema)
})
.catch(err => {
    console.error(`Connection to ${config.dbUrl} cannot be established`)
    process.exit(0)
}) 

const personEndpoint = '/api/person'

app.get(personEndpoint, (req, res) => {
    let sort = {}
    if(req.query.sort) {
        sort[req.query.sort] = +req.query.order || 1
    }
    const matching = {
        $match: {
            $or: [
                { firstName: { $regex: req.query.search || '', $options: 'i' }},
                { lastName: { $regex: req.query.search || '', $options: 'i' }}
            ]
        }
    }

    const aggregation = [ matching ]

    aggregation.push({ $match: { firstName: { $regex: req.query.firstName || '' }}})
    aggregation.push({ $match: { lastName: { $regex: req.query.lastName || '' }}})
    if(req.query.sort) {
        aggregation.push({ $sort: sort })
    }
    aggregation.push({ $skip: +req.query.skip || 0 })
    let limit = +req.query.limit
    if(!isNaN(limit) && limit > 0) {
        aggregation.push({ $limit: limit })
    }
    Person.aggregate([{ $facet: {
        total: [ matching, { $count: 'count' } ],
        data: aggregation
    }}])
    .then(facet => {
        [ facet ] = facet
        facet.total = ( facet.total && facet.total[0] ? facet.total[0].count : 0) || 0
        facet.data = facet.data.map(person => new Person(person))
        res.json(facet)
    })
    .catch(err => {
        res.status(400).json({ error: err.message })
    })  
})

app.post(personEndpoint, (req, res) => {
    let person = new Person(req.body)
    let err = person.validateSync()
    if(err) {
        res.status(400).json({ error: err.message })
        return    
    }
    person.save()
        .then(row => {
            res.json(row)
        })
        .catch(err => {
            res.status(400).json({ error: err.message })
        })
})

app.put(personEndpoint, (req, res) => {
    let _id = req.body._id
    if(!_id) {
        res.status(400).json({ error: 'no _id!' })
        return
    }
    delete req.body._id
    Person.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
        .then(row => {
            console.log(row)
            res.json(row)
        })
        .catch(err => {
            res.status(400).json({ error: err.message })
        })
})

app.delete(personEndpoint, (req, res) => {
    let _id = req.query._id
    if(!_id) {
        res.status(400).json({ error: 'no _id!' })
        return
    }
    Person.findOneAndDelete({ _id })
        .then(row => {
            res.json(row)
        })
        .catch(err => {
            res.status(400).json({ error: err.message })
        })
})

app.listen(config.port, () => {
    console.log('Backend listening on port', config.port)
})