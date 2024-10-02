import type {Request, Response} from 'express'
import Note, {INote} from '../models/Note'
import { Types } from 'mongoose'
import Task from '../models/Task'

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        try {
            const note = new Note()
            note.content = req.body.content
            note.createdBy = req.user.id
            note.task = req.task.id

            req.task.notes.push(note.id)

            await Promise.allSettled([note.save(), req.task.save()])
            res.status(200).send('Note created')
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }
    
    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({task: req.task.id})
            res.status(200).json(notes)
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }

    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        try {
            const { noteId } = req.params
            const note = await Note.findById(noteId)
            if(!note) {
                const error = new Error('Note not found')
                res.status(404).json({error: error.message})
            }
            if(note.createdBy.toString() !== req.user.id.toString()) {
                const error = new Error('Invalid action')
                res.status(401).json({error: error.message})
            }
            

            /** delete note from task */
            req.task.notes = req.task.notes.filter( noteTask => noteTask.toString() !== note.id.toString())
            
            await Promise.allSettled([note.deleteOne(), req.task.save()])
            res.status(200).send('Note deleted correctly')

        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }
}