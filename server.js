const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('uuid')
const mongoose = require('mongoose')

const config = {
    port: 8000,
    frontend: './pws2024-vue/dist',
    dbUrl: 'mongodb://localhost:27017/pws2024'
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
    yearOfBirth: { type: Number, required: true, min: 1900, max: 2024 }
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

app.listen(config.port, () => {
    console.log('Backend listening on port', config.port)
})