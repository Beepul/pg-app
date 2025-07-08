const { json } = require("express");
const { getUserByEmail, saveUser, getUserById } = require("../db/queries/user.query")
const AppError = require("../utils/AppError")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const createUser = async (req, res, next) => {
    try {
        const {name, email, password} = req.body

        if(!name || !email || !password) {
            // return next({message: 'All fields required', status: 401})
            return next(new AppError('All fields required', 400))
        }

        const user = await getUserByEmail(email)

        if(user){
            return next(new AppError(`User with ${email} already exist. Please try again.`, 409))
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt)

        const {password : _, ...newUser} = await saveUser({name, email, password: hashedPassword})

        res.status(200).json({
            result: newUser,
            message: 'User created successfully',
            meta: null
        })
    } catch (error) {
        return res.status(400).json('Error occured', error)
    }
}

const loginUser = async (req,res, next) => {
    try {
        const {email, password} = req.body

        if(!email || !password) {
            return next(new AppError('All fields requiredss', 400))
        }

        const {password: userPassword, ...user} = await getUserByEmail(email)

        if(!user){
            return next(new AppError(`User with ${email} does not exist`, 404))
        }

        const isMatched = bcrypt.compareSync(password, userPassword)

        if(!isMatched){
            return next(new AppError('Password does not match. Please try again', 400))
        }

        const accessToken = jwt.sign({user}, process.env.JWT_SECRET_KEY, {
            expiresIn: '20m'
        })

        const refreshToken = jwt.sign({user}, process.env.JWT_SECRET_KEY,{
            expiresIn: '50m'
        })

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 50 * 60 * 1000
        })

        res.status(200).json({
            result: {...user, accessToken},
            message: 'User loggedin successfully',
            meta: null
        })
    } catch (error) {
        return next(new AppError('Error occured' + error.message, 400))
    }
} 

const refreshUserLogin = async (req, res, next) => {
    try {
        const cookies = req.cookies 
    
        if(!cookies?.jwt){
            return next(new AppError('No cookie found', 204))
        }
    
        const refreshToken = cookies.jwt 
    
        const tokenData = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY)
    
        const userDetail = await getUserById(tokenData.user.id)
    
        if(!userDetail){
            res.clearCookie('jwt')
            return next(new AppError('You are not eligible to access this resources, Please register and login first.', 401))
        }
    
        const accessToken = jwt.sign({user: userDetail}, process.env.JWT_SECRET_KEY, {
            expiresIn: '20m'
        })
    
        res.status(200).json({
            result: {accessToken},
            message: 'User loggedin successfully',
            meta: null
        })

    } catch (error) {
        res.clearCookie('jwt')
        return next(new AppError('Something went wrong, Please login to continue.', 400))
    }
}

const logoutUser = async (req, res, next) => {
    const cookies = req.cookies
    
    if(!cookies?.jwt){
        return next(new AppError('No cookie found', 204))
    }

    res.clearCookie('jwt')

    res.status(200).json({
        result: null,
        message: 'User logged out successfully',
        meta: null
    })
}


module.exports = {
    createUser,
    loginUser,
    logoutUser,
    refreshUserLogin
}