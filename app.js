require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => res.json(person))
})

app.get('/api/persons', (req, res) => {
  Person.find().then(people => res.json(people))
})

app.get('/info', (req, res, next) => {
  const time = new Date()
  Person.find().then(people => {
    return res.send('<p>Phonebook has info for ' + people.length + ' people</p><p>' + time + '</p>')
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      return res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const person = {
    name: req.body.name,
    number: req.body.number
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if(!body.name || !body.number){
    return res.status(400).json({ error: 'name or number missing' })
  }
  const person = Person({
    name: body.name,
    number: body.number
  })

  person.save().then(person => {
    res.json(person)
  }).catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {

  if(error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }
  else if(error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

app.listen(process.env.PORT)