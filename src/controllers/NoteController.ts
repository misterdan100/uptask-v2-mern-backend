import type {Request, Response} from 'express'
import Note, {INote} from '../models/Note'

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
}