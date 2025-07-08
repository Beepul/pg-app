const { getTodos, addTodo, getCountOfTodos, getSingleTodo, deleteTodoById, updateTodoById } = require("../db/queries/todo.query")
const AppError = require("../utils/AppError")

const createTodo = async (req, res, next) => {
    try {
        const {title, description} = req.body

        if(!title){
            return next(new AppError('Title is required', 400))
        }

        const user = req.user 

        const todoObj = {
            title: title.trim(),
            description: description ? description.trim() : null,
            user_id: user.id,
            status: 'pending'
        }

        const result = await addTodo(todoObj)

        res.status(200).json({
            result: result,
            message: 'Todo created successfully',
            meta: null
        })
    } catch (error) {
        return next(new AppError('Unable to create todo: '+error.message, 400))
    }
}

const getAllTodos = async (req, res, next) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 5
        const skip = (page - 1) * limit 

        const sort = req.query.sort || 'latest'
        const orderBy = sort === 'oldest' ? 'ASC' : 'DESC'

        const status = req.query.status || null 
        const title = req.query.title || null 

        const user = req.user
        
        const todos = await getTodos(user.id, limit, skip, orderBy, status, title)
        const count = await getCountOfTodos(user.id)

        res.status(200).json({
            result: todos,
            message: 'Fetched all todos',
            meta: {
                page: Number(page),
                limit: Number(limit),
                total: Number(count.count), 

            }
        }) 
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const deleteTodo = async (req, res, next) => {
    try {
        const id = req.params.id 
        
        const user = req.user

        const result = await getSingleTodo({id, user_id: user.id})

        if(!result){
            return next(new AppError('Todo doesnot exist', 400))
        }

        if(result.user_id !== user.id){
            return next(new AppError('Todo doesnot belong to '+ user.email, 409))
        }

        const deletedResult = await deleteTodoById(result.id)

        res.status(200).json({
            result: deletedResult,
            message: 'Todo deleted successfully',
            meta: null
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const updateTodo = async (req, res, next) => {
    try {
        const id = req.params.id 
        const {title, description, status} = req.body

        const user = req.user

        const todo = await getSingleTodo({id, user_id: user.id})

        if(!todo){
            return next(new AppError('Todo doesnot exist', 400))
        }

        if(todo.user_id !== user.id){
            return next(new AppError('Todo doesnot belong to '+ user.email, 409))
        }

        const enumStatus = ['pending', 'on_progress', 'completed']

        if(status){
            if(!enumStatus.includes(status)){
                return next(new AppError('Unknown type of status, please provide valid status', 400))
            }
        }

        let data = {
            title: title ? title.trim() : todo.title,
            description: description ? description.trim() : null,
            status: status ? status : todo.status,
            updated_at: new Date()
        }

        const result = await updateTodoById(id, {
            title: data.title,
            description: data.description,
            status: data.status,
            updated_at: data.updated_at
        })

        res.status(200).json({
            result: result,
            message: 'Todo updated successfully',
            meta: null 
        })

    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

module.exports = {
    getAllTodos,
    createTodo,
    deleteTodo,
    updateTodo
}