import express from 'express'
import dotevn from 'dotenv'
import cors, { CorsOptions } from 'cors'
import morgan from 'morgan'
import { connectDB } from './config/db'
import authRoutes  from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'

dotevn.config()

connectDB()

const app = express()

/** Allowed Clients CORS */
const corsOptions: CorsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = [process.env.FRONTEND_URL]
        if(process.argv[2] === '--api') {
            allowedOrigins.push(undefined)
        }
        if(allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback( new Error('CORS policy violation'), false)
        }
    }
}

app.use(cors(corsOptions))

app.use(express.json())

app.use(morgan('dev'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)




export default app