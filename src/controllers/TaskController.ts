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

            //save in history
            const change = {
                change: `Task created`,
                changeBy: req.user.id
            }
            task.changeHistory.push(change)

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
            res.status(200).json(req.task)
        } catch (error) {
            console.log('[GETTASKBYID]', error.message)
            res.status(500).json({error: 'There was an error getting task'})
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            // set change history
            const change = {
                change: `Changes in the data`,
                changeBy: req.user.id
            }
            req.task.changeHistory.push(change)
            await Promise.allSettled([req.task.updateOne(req.body), req.task.save()])
            res.status(200).send('Task updated correctly')
        } catch (error) {
            console.log('[UPDATETASK]', error.message)
            res.status(500).json({error: 'There was an error updating task'})
        }
    }
    
    static deleteTaskByID = async (req: Request, res: Response) => {
        try {
            const {project} = req
            const projectTasksUpdated = project.tasks.filter(task => task.toString() !== req.task.id.toString())
            project.tasks = projectTasksUpdated
            
            await Promise.allSettled([await req.task.deleteOne(), await project.save()])
            res.status(200).send('Task deleted correctly')
            
        } catch (error) {
            console.log('[DELETETASKBYID]', error.message)
            res.status(500).json({error: 'There was an error deleting task'})
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            if(status === 'pending') {
                req.task.completedBy = null
            } else {
                req.task.completedBy = req.user.id
            }
            // set change history
            const change = {
                change: `status to ${status}`,
                changeBy: req.user.id
            }
            req.task.changeHistory.push(change)

            await req.task.save()
            res.status(200).send('Status Task updated')
        } catch (error) {
            console.log('[UPDATESTATUS]', error.message)
            res.status(500).json({error: 'There was an error updating status'})
        }
    }
}