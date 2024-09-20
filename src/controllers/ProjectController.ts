import type { Request, Response } from 'express'
import Project from '../models/Project'
import { connectDB } from '../config/db'

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        try {
            const response = await project.save()
            res.send(response)
        } catch (error) {
            console.log('[CREATEPROJECT]', error.message)
        }
        
    }
    
    static getAllProjects = async (req: Request, res: Response) => {
        
        try {
            // const res = await 
        } catch (error) {
            console.log('[CREATEPROJECT]', error.message)
        }
        res.send('Todos los projectos')
    }


}