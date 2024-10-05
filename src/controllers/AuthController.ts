import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const {email, password} = new User(req.body)
            // check if email exists
            const userExists = await User.findOne({email})
            if(userExists) {
                const error = new Error('User already exists')
                return res.status(409).json({error: error.message})
            }
            // create new user
            const user = new User(req.body)
            // hash password
            user.password = await hashPassword(password)

            // Generate Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send confirmation email w/ mailtrap
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token

            })

            // save user and token in MongoDB
            await Promise.allSettled([user.save(), token.save()])
            // await user.save()

            res.status(200).send('Account created, check your e-mail to validate it')
        } catch (error) {
            console.log(error.message)
            res.status(500).json({error: 'There was an error creating user'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Token not valid')
                return res.status(404).send({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            return res.status(200).send('Account confirmated')
        } catch (error) {
            console.log(error.message)
            res.status(500).json({error: 'There was an error in confirm account'})
        }
    }
    
    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({email})

            // check if user exists
            if(!user) {
                const error = new Error('User not found')
                return res.status(404).json({error: error.message})
            }
            
            // check if user is confirmated
            if (!user.confirmed) {
              const token = new Token();
              token.user = user.id;
              token.token = generateToken();
              await token.save();

              // Send confirmation email w/ mailtrap
              AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
              });

              const error = new Error("Account not confirmed, we have sent you a new confirmation e-mail");
              return res.status(401).json({ error: error.message });
            }
            
            // check if the password is correct
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error("The password is incorrect");
                return res.status(401).json({ error: error.message });
            }

            const token = generateJWT({id: user.id})
            return res.status(200).send(token)
        } catch (error) {
            console.log(error.message)
            res.status(500).json({error: 'There was an error loging user'})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            const user = await User.findOne({email})
            if(!user) {
                const error = new Error("User don't have an account")
                return res.status(404).json({error: error.message})
            }
            
            if(user.confirmed) {
                const error = new Error("User is already confirm")
                return res.status(403).json({error: error.message})    
            }

            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
            })

            await token.save()
            res.status(200).send('Check your e-mail to get the new code')
        } catch (error) {
            res.status(500).json({error: 'There was an error in requestConfirmationCode'})
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('User not found')
                return res.status(404).json({error: error.message})
            }

            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            // const hashedPassword = await hashPassword(password)
            // user.password = hashedPassword
            // await user.save()
            return res.status(200).send('Check your e-mail to instrucctions')
        } catch (error) {
            res.status(500).json({error: 'There was an error in forgot password'})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({token})
            if(!tokenExist) {
                const error = new Error('Token not found')
                return res.status(404).json({error: error.message})
            }

            res.status(200).send('Valid Token, define a new password')
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Token not found')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            const hashedPassword = await hashPassword(password)
            user.password = hashedPassword

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.status(200).send('Password reseted correctly')
        } catch (error) {
            res.status(500).json({error: 'There was an error in updatePasswordWithToken'})
        }
    }

    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        try {
            const { user } = req
            const { name, email } = req.body

            // check if email is own of other user
            // check if email is the current same email
            const userExists = await User.findOne({email})
            if(userExists && userExists.id.toString() !== user.id.toString()) {
                const error = new Error('E-mail is being used by another user')
                return res.status(409).json({error: error.message})
            }

            req.user.name = name
            req.user.email = email

            await req.user.save()
            res.status(200).send('Profile updated')            
        } catch (error) {
            console.log('[updateProfile]', error.message)
            res.status(500).json({error: error.message})
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        try {
            const user = await User.findById(req.user.id)
            const { current_password, password } = req.body

            // chechk if current password is valited
            const isPasswordCorrect = await checkPassword(current_password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error('Current password is wrong')
                return res.status(401).json({error: error.message})
            }

            user.password = await hashPassword(password)
            await user.save()

            res.status(200).send('Password changed')
        } catch (error) {
            console.log('[updateCurrentUserPassword]', error)
            res.status(500).json({error: error.message})
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        try {
            const { password } = req.body
            const user = await User.findById(req.user.id)

            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) {
                const error = new Error('Password incorrect')
                return res.status(401).json({error: error.message})
            }

            res.status(200).send('Password is OK')
        } catch (error) {
            console.log('checkPassword')
            res.status(500).json({error: error.message})
        }
    }
}