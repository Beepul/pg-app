const { getUserById } = require("../db/queries/user.query")
const AppError = require("../utils/AppError")
const jwt = require('jsonwebtoken')


const isAuthenticated = async (req, res, next) => {
    try {
        let token =  req.headers['authorization'] || null 

        if(!token) {
            return next(new AppError('Please login to continue', 401))
        }

        token = token.split(" ").pop()

        const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const userDetail = await getUserById(tokenData.user.id)

        if(!userDetail){
            return next(new AppError('You are not eligible to access this resources, Please register and login first.', 401))
        }

        req.user = userDetail

        next()

    } catch (error) {
        return next(new AppError(error.message + ', You are not authorized to access this resources', 401))
    }
}

module.exports = {
    isAuthenticated
}