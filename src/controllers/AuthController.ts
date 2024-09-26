import { Request, Response } from "express"
import bcrypt from 'bcrypt'
import User from "../models/User"
import { hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { transporter } from "../config/nodemailer"
import { AuthEmail } from "../emails/AuthEmail"

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
                return res.status(401).send({error: error.message})
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
}