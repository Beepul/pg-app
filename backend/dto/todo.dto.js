const Joi = require('joi')


const createTodoSchema = Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().max(200).allow(null, ""),
})

const updateTodoSchema = Joi.object({
    title: Joi.string().min(3).max(150).required(), 
    description: Joi.string().max(200).allow(null, ""), 
    status: Joi.string().valid('pending', 'on_progress', 'completed')
})

module.exports = {
    createTodoSchema,
    updateTodoSchema
}