import mongoose, { Schema, Document, PopulatedDoc, Types } from 'mongoose'
import { IProjectType } from './Project'

export interface IUser extends Document {
    email: string
    password: string
    name: string
    confirmed: boolean
    projects: PopulatedDoc<IProjectType & Document>[]
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    projects: [
        {
            type: Types.ObjectId,
            ref: 'Project'
        }
    ]
    
})

const User = mongoose.model<IUser>('User', userSchema)
export default User