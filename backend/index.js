const express = require('express')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const mainRouter = require('./routes/')

const errMiddleware = require('./middleware/errorHandler.middleware')

const app = express()

app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT

app.use('/', mainRouter)

app.listen(PORT, () => {
    console.log('Server running at port', PORT)
})

app.use(errMiddleware)