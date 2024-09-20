import express from 'express'
import dotevn from 'dotenv'
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes'

dotevn.config()

connectDB()

const app = express()

app.use(express.json())

// Routes
app.use('/api/projects', projectRoutes)

export default app