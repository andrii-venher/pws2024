const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('uuid')
const mongoose = require('mongoose')

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

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())
app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message })
})

app.use(express.static(config.frontend))

const personSchema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    firstName: { type: String, required: true, validate: {
        validator: v => {
          return /^[A-Z]/.test(v);
        },
        message: props => `${props.value} does not start from a capital`
      }
    },
    lastName: { type: String, required: true, validate: {
        validator: v => {
          return /^[A-Za-z]/.test(v);
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

app.get('/api', (req, res) => {
    Person.find({})
        .then(rows => {
            res.json(rows)
        })
        .catch(err => {
            res.status(400).json({ error: err.message })
        })
})

app.post('/api', (req, res) => {
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

app.put('/api', (req, res) => {
    let _id = req.body._id
    if(!_id) {
        res.status(400).json({ error: 'no _id!' })
        return
    }
    delete req.body._id
    Person.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
        .then(row => {
            res.json(row)
        })
        .catch(err => {
            res.status(400).json({ error: err.message })
        })
})

app.delete('/api', (req, res) => {
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