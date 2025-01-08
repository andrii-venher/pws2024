const uuid = require('uuid')
const mongoose = require('mongoose')

const project = module.exports = {
    model: null,
    endpoint: '/api/project',
    init: conn => {
        project.schema = new mongoose.Schema({
            _id: { type: String, default: uuid.v4 },
            name: { type: String, required: true, validate: {
                validator: v => {
                  return /^\p{L}/u.test(v)
                },
                message: props => `${props.value} does not start from a letter`
              }
            },
            startDate: { type: Date, required: true, transform: v => v.toISOString().substr(0, 10) },
            endDate: { type: Date, required: false, transform: v => v.toISOString().substr(0, 10) },
            contractor_ids: { type: [ String ], required: false, default: [] }
        }, {
            versionKey: false,
            additionalProperties: false
        })
        project.model = conn.model('Project', project.schema)
    },
    schema: null,
    get: (req, res) => {
        let sort = {}
        if(req.query.sort) {
            sort[req.query.sort] = +req.query.order || 1
        }
        const matching = {
            $match: { name: { $regex: req.query.search || '', $options: 'i' }},
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
        project.model.aggregate([{ $facet: {
            total: [ matching, { $count: 'count' } ],
            data: aggregation
        }}])
        .then(facet => {
            [ facet ] = facet
            facet.total = ( facet.total && facet.total[0] ? facet.total[0].count : 0) || 0
            facet.data = facet.data.map(item => new project.model(item).toObject())
            res.json(facet)
        })
        .catch(err => {
            res.status(400).json({ error: err.message })
        })  
    },
    post: (req, res) => {
        let item = new project.model(req.body)
        let err = item.validateSync()
        if(err) {
            res.status(400).json({ error: err.message })
            return    
        }
        item.save()
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
        project.model.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
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
        project.model.findOneAndDelete({ _id })
            .then(row => {
                res.json(row)
            })
            .catch(err => {
                res.status(400).json({ error: err.message })
            })
    }
}