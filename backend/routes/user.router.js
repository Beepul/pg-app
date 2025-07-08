const express = require('express')
const { createUser, loginUser, logoutUser, refreshUserLogin} = require('../controllers/user.controller')
const { isAuthenticated } = require('../middleware/auth.middleware')
const { requestValidator } = require('../middleware/dto.validator.middleware')
const { registerSchema, loginSchema } = require('../dto/user.dto')

const router = express.Router()

router.post('/', requestValidator(registerSchema), createUser)
router.post('/login', requestValidator(loginSchema), loginUser)
router.get('/log-out', logoutUser)
router.get('/refresh-login', refreshUserLogin)


module.exports = router