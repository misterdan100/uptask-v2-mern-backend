import type { Request, Response } from 'express'
import Project from '../models/Project'
import Task from '../models/Task'


export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        try {
            const {project} = req
            // create task
            const task = new Task(req.body)
            task.project = project.id
            project.tasks.push(task.id)
            await task.save()
            await project.save()
            res.status(201).json('Tasks created correctly')
        } catch (error) {
            console.log('[CREATETASK]', error.message)
        }
    }
}