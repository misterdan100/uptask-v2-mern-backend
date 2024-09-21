import { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExist( req: Request, res: Response, next: NextFunction) {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if(!task) {
            const error = new Error('Task not found')
            return res.status(400).json({error: error.message})
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({errror: 'There was an error validating if task exist'})
    }
}

export async function taskBelongsToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // check if the task belongs to the right project
    if (req.task.project.toString() !== req.project.id.toString()) {
      const error = new Error("Invalid action");
      return res.status(400).json({ error: error.message });
    }
    next()
  } catch (error) {
    res.status(500).json({errror: 'There was an error validating if task exist'})
    console.log('[TASKBELONGTOPROJECT]', error.message)
  }
}