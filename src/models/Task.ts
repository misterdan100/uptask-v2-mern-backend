import mongoose, {Schema, Document, Types} from "mongoose";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

export interface ITask extends Document {
    name: string
    description: string
    project: Types.ObjectId
    status: TaskStatus
    completedBy: Types.ObjectId
    changeHistory: {
        change: string,
        changeBy: Types.ObjectId,
        changeDate?: Date
    }[]
}

const TaskSchema: Schema = new Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        require: true,
        trim: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    },
    completedBy: {
        type: Types.ObjectId,
        ref: 'User',
        default: null
    },
    changeHistory: [
        {
            change: {type: String},
            changeBy: {type: Types.ObjectId, ref: 'User'},
            changeDate: {type: Date, default: Date.now},
        }
    ]
}, {timestamps: true}) 

const Task = mongoose.model<ITask>('Task', TaskSchema)
export default Task