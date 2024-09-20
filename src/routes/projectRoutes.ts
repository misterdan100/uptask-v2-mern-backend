import { Router } from 'express'
import { body } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.post('/',
    body('projectName').notEmpty().withMessage('Name Project is required.'),
    body('clientName').notEmpty().withMessage('Name Client is required.'),
    body('description').notEmpty().withMessage('Description is required.'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

export default router