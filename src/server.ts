import express from 'express'
import dotevn from 'dotenv'
import { connectDB } from './config/db'

dotevn.config()

connectDB()

const app = express()

export default app