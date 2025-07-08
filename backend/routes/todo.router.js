const express = require('express')
const { getAllTodos, createTodo, deleteTodo, updateTodo } = require('../controllers/todo.controller')
const { isAuthenticated } = require('../middleware/auth.middleware')
const { requestValidator } = require('../middleware/dto.validator.middleware')
const { createTodoSchema, updateTodoSchema } = require('../dto/todo.dto')

const router = express.Router()

router.post('/', requestValidator(createTodoSchema), isAuthenticated, createTodo)
router.get('/', isAuthenticated, getAllTodos)
router.delete('/:id', isAuthenticated, deleteTodo)
router.put('/:id', requestValidator(updateTodoSchema), isAuthenticated, updateTodo)


module.exports = router