const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const config = {
    port: 8000,
    frontend: './pws2024-vue/dist'
}

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())
app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message })
})

app.use(express.static(config.frontend))

let series = []

app.get('/api', (req, res) => {
    res.json(series)
})

app.post('/api', (req, res) => {
    // check if all required field exists
    let valid = req.body && req.body.firstName && req.body.yearOfBirth
    let data = {}
    if(valid) {
        // check value restrictions of all the fields
        let yearOfBirth = parseInt(req.body.yearOfBirth)
        if(/^[A-Z]/.test(req.body.firstName) && yearOfBirth >= 1900 && yearOfBirth <= 2024) {
            // store the data
            data.firstName = req.body.firstName
            data.yearOfBirth = yearOfBirth
            series.push(data)
        } else {
            valid = false
        }
    }
    if(valid) {
        res.json(data)
    } else {
        res.status(400).json({ error: 'Invalid data'})
    }
})

app.listen(config.port, () => {
    console.log('Backend listening on port', config.port)
})