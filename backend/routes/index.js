const express = require('express')
const todoRoutes = require('./todo.router')
const userRoutes = require('./user.router')

const router = express.Router()

router.use('/todo', todoRoutes)
router.use('/user', userRoutes)


module.exports = router