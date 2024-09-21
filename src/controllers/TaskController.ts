import type { Request, Response } from 'express'
import Task from '../models/Task'


export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        try {
            const {project} = req
            // create task
            const task = new Task(req.body)
            task.project = project.id
            project.tasks.push(task.id)
            await Promise.allSettled([task.save(), project.save()])
            res.status(201).json('Tasks created correctly')
        } catch (error) {
            console.log('[CREATETASK]', error.message)
            res.status(500).json({error: 'There was an error creating task'})
        }
    }
    
    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            // const { project } = req
            // const tasks = await project.populate('tasks')

            const tasks = await Task.find({project: req.project.id}).populate('project')
            res.status(200).json(tasks)
        } catch (error) {
            console.log('[GETPROJECTTASKS]', error.message)
            res.status(500).json({error: 'There was an error getting tasks'})
        }
    }
    
    static getTaskByID = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.params.taskId).populate('project')
            if(!task) {
                const error = new Error('Task not found')
                return res.status(404).json({error: error.message})
            }
            // check if the task belongs to the right project
            if(task.project.id !== req.project.id) {
                const error = new Error('Invalid action')
                return res.status(400).json({error: error.message})
            }
            res.status(200).json(task)
        } catch (error) {
            console.log('[GETTASKBYID]', error.message)
            res.status(500).json({error: 'There was an error getting task'})
        }
    }
}