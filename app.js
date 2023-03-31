const express = require('express')
const cors = require('cors')
const app = express()
const morgan = require('morgan')
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

morgan.token('data', (req, res) => JSON.stringify(req.body))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

app.use(express.static('dist'))

let persons =[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons/:id', (req, res) => {
    const person = persons.find(p => p.id == req.params.id)
    if(person){
        return res.json(person)
    }
    else{
        return res.status(404).end('not found')
    }
})

app.get('/api/persons', (req, res) => {
    return res.json(persons)
})

app.get('/info', (req, res) => {
    const time = new Date()
    return res.send('<p>Phonebook has info for ' + persons.length + ' people</p><p>' + time + '</p>')
})

app.delete('/api/persons/:id', (req, res) => {
    persons = persons.filter(p => p.id !== req.params.id)
    return res.status(204).end()
})


app.post('/api/persons', (req, res) => {
    const body = req.body
    if(!body.name || !body.number){
        return res.status(400).json({error: 'name or number missing'})
    }
    else if(persons.find(p => p.name === body.name)){
        return res.status(400).json({error: 'that name already exists'})
    }
    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 1000000)
    }

    persons = persons.concat(person)

    return res.json(person)
})

const PORT = 5000

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

app.listen(PORT)