const uuid = require('uuid')
const mongoose = require('mongoose')

module.exports = {
    model: null,
    endpoint: '/api/person',
    init: conn => {
        this.schema = new mongoose.Schema({
            _id: { type: String, default: uuid.v4 },
            firstName: { type: String, required: true, validate: {
                validator: v => {
                  return /^\p{L}/u.test(v)
                },
                message: props => `${props.value} does not start from a letter`
              }
            },
            lastName: { type: String, required: true, validate: {
                validator: v => {
                  return /^\p{L}/u.test(v)
                },
                message: props => `${props.value} does not start from a letter`
              }
            },
            birthDate: { type: Date, required: true, transform: v => v.toISOString().substr(0, 10) }
        }, {
            versionKey: false,
            additionalProperties: false
        })
        this.model = conn.model('Person', this.schema)
    },
    schema: null,
    get: (req, res) => {
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
    
        if(req.query.sort) {
            aggregation.push({ $sort: sort })
        }
        aggregation.push({ $skip: +req.query.skip || 0 })
        let limit = +req.query.limit
        if(!isNaN(limit) && limit > 0) {
            aggregation.push({ $limit: limit })
        }
        this.model.aggregate([{ $facet: {
            total: [ matching, { $count: 'count' } ],
            data: aggregation
        }}])
        .then(facet => {
            [ facet ] = facet
            facet.total = ( facet.total && facet.total[0] ? facet.total[0].count : 0) || 0
            facet.data = facet.data.map(person => new this.model(person))
            res.json(facet)
        })
        .catch(err => {
            res.status(400).json({ error: err.message })
        })  
    },
    post: (req, res) => {
        let person = new this.model(req.body)
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
    },
    put: (req, res) => {
        let _id = req.body._id
        if(!_id) {
            res.status(400).json({ error: 'no _id!' })
            return
        }
        delete req.body._id
        this.model.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
            .then(row => {
                res.json(row)
            })
            .catch(err => {
                res.status(400).json({ error: err.message })
            })
    },
    delete: (req, res) => {
        let _id = req.query._id
        if(!_id) {
            res.status(400).json({ error: 'no _id!' })
            return
        }
        this.model.findOneAndDelete({ _id })
            .then(row => {
                res.json(row)
            })
            .catch(err => {
                res.status(400).json({ error: err.message })
            })
    }
}