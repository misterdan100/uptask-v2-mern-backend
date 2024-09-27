import { Router } from 'express'
import { body } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.post('/create-account', 
    body('name').notEmpty().withMessage('Name is required'),
    body('password').isLength({min: 8}).withMessage('Password min 8 characters'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password) throw new Error('Passwords must be the same')
            return true
    }),
    body('email').isEmail().withMessage('E-mail not valid'),
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account', 
    body('token').notEmpty().withMessage('Token is required'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login', 
    body('email').isEmail().withMessage('E-mail is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleInputErrors,
    AuthController.login
)

router.post('/request-code',
    body('email').isEmail().withMessage('E-mail is required'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)
export default router