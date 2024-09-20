import type { Request, Response } from 'express'
import Project from '../models/Project'
import { connectDB } from '../config/db'

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        try {
            const response = await project.save()
            res.status(201).send(response)
        } catch (error) {
            console.log('[CREATEPROJECT]', error.message)
        }
    }
    
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const project = await Project.find({})
            res.status(200).json(project)
        } catch (error) {
            console.log('[GETALLPROJECTS]', error.message)
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.params.id)
            if(!project) {
                const error = new Error('Project not found')
                return res.status(404).json({error: error.message})
            }
            res.status(200).json(project)
        } catch (error) {
            console.log('[GETPROJECTSBYID]', error.message)
        }
    }

    static updateProjectById = async (req: Request, res: Response) => {
        try {
            const project = await Project.findByIdAndUpdate(req.params.id, req.body)
            await project.save()
            if(!project) {
                const error = new Error('Project not found')
                return res.status(404).json({error: error.message})
            }
            res.status(200).json(project)
        } catch (error) {
            console.log('[UPDATEPROJECTSBYID]', error.message)
        }
    }
    
    static deleteProjectById = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.params.id)
            if(!project) {
                const error = new Error('Project not found')
                return res.status(404).json({error: error.message})
            }
            project.deleteOne()
            res.status(200).json({msg: 'Project deleted'})
        } catch (error) {
            console.log('[DELETEPROJECTSBYID]', error.message)
        }
    }
}