const fs = require('fs')

const uuid = require('uuid')
const mongoose = require('mongoose')
const { faker } = require('@faker-js/faker')

let config = {}
try {
    config = JSON.parse(fs.readFileSync('../config.json'))
} catch(err) {
    console.error(err.message)
    process.exit(0)
}

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

const deleteExisting = true
const NumOfPersons = 1000

let Person = null

const generateData = async (model, deleteExisting) => {
    if(deleteExisting) {
        console.log('Delete existing %s...', model.collection.name)
        let count = (await model.deleteMany({})).deletedCount
        console.log(count + ' done')
    }
    console.log('Generate and save %d %s', NumOfPersons, model.collection.name)
    for(let i = 0; i < NumOfPersons; i++) {
        let person = new model({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            birthDate: faker.date.birthdate()
        })
        await person.save()
        process.stdout.write('\r' + (i + 1) + ' ')
    }
    console.log('done')
    process.exit(0)
}

mongoose.connect(config.dbUrl)
.then(conn => {
    console.log('Database connected')
    Person = conn.model('Person', personSchema)
    generateData(Person, deleteExisting)
})
.catch(err => console.error(err.message))