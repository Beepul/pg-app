const AppError = require("../utils/AppError")

const requestValidator = (schema) => {
    return async (req, res, next) => {
        try {
            const data = req.body

            if(!data){
                return next(new AppError('No data found in your request', 400))
            }

            await schema.validateAsync(data, {
                abortEarly: false 
            })
            
            next()
        } catch (error) {
            let errorMsg = []
            error.details.map((err, index) => {
                if(!err.path.includes('password')){
                    errorMsg.push(err.message)
                } else {
                    if(!err.context?.regex){
                        errorMsg.push(err.message)
                    }else {
                        errorMsg.push('"password" is required and must contain A-Z, a-z, 0-9, and one symbol like: @#$%...')
                    }
                }
            })
            return next(new AppError(errorMsg.join(' / '), 400))
        }
    }
}

module.exports = {
    requestValidator
}