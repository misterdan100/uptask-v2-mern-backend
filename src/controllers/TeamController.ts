import {Request, Response} from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        try {
            const user = await User.findOne({email: req.body.email}).select('_id email name')
            if(!user) {
                const error = new Error('User not found')
                return res.status(404).json({error: error.message})
            }

            res.status(200).json(user)
            
        } catch (error) {
            res.status(500).json({error: 'There was an error in findMemberByEmail'})
        }
    }

    static addMemberById = async (req: Request, res: Response) => {
        try {
            const userId = req.body.id
            const user = await User.findById(userId).select('id')

            // validate if req user is manager
            if(req.user.id.toString() !== req.project.manager.toString()) {
                const error = new Error('Only manager can add users to project')
                return res.status(401).json({error: error.message})
            }

            // validate if user to add exists
            if(!user) {
                const error = new Error('User not Found')
                return res.status(404).json({error: error.message})
            }
            
            // validate if user are not already in the project
            if(req.project.team.some(team => team.toString() === user.id.toString()) || req.body.id.toString() === req.project.manager.toString()) {
                const error = new Error('User is already in the project')
                return res.status(500).json({error: error.message})
            }
            
            req.project.team.push(user.id)
            await req.project.save()

            res.status(200).send('User added in the team')
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }

    static removeMemberById = async (req: Request, res: Response) => {
        try {
            // validate if req user is manager
            if(req.user.id.toString() !== req.project.manager.toString()) {
                const error = new Error('Only manager can delete user in the project')
                return res.status(401).json({error: error.message})
            }

            // validate if user to delete is in the project
            if(!req.project.team.some(team => team.toString() === req.body.id.toString())) {
                const error = new Error('User to delete is not in the project')
                return res.status(404).json({error: error.message})
            }

            req.project.team = req.project.team.filter( member => member.toString() !== req.body.id.toString())
            await req.project.save()

            res.status(200).send('User deleted from project')
            
        } catch (error) {
            res.status(500).json({error: 'There was an error in deleteMemberById'})
        }
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        try {
            if(req.user.id.toString() !== req.project.manager.toString()) {
                const error = new Error('Only manager can get all members in the project')
                return res.status(401).json({error: error.message})
            }

            const biggerProject = await req.project.populate({
                path: 'team',
                select: 'id name email'
            })

            res.status(200).json(biggerProject.team)
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }


}