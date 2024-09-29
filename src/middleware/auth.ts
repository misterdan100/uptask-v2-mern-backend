import { Request, Response, NextFunction } from 'express'
import jwt, { decode } from 'jsonwebtoken'
import User, { IUser } from '../models/User'

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    
    const bearer = req.headers.authorization
    if(!bearer) {
        const error = new Error('No Authorized')
        return res.status(401).json({error: error.message})
    }
    // get JWT
    const token = bearer.split(' ')[1]
    
    // verificate JWT
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id).select('_id name email')
            if(!user) {
                const error = new Error('User not found')
                return res.status(401).json({error: error.message})
            }
            req.user = user
            next()
        }
    } catch (error) {
        return res.status(500).json({error: 'Not valid token'})
    }


}