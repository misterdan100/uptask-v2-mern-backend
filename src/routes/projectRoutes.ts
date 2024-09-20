import { Router } from 'express'
import { body, param } from 'express-validator'
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
router.get('/:id', 
    param('id').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ProjectController.getProjectById
)
router.put('/:id', 
    body('projectName').notEmpty().withMessage('Name Project is required.'),
    body('clientName').notEmpty().withMessage('Name Client is required.'),
    body('description').notEmpty().withMessage('Description is required.'),
    param('id').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ProjectController.updateProjectById
)
router.delete('/:id', 
    param('id').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ProjectController.deleteProjectById
)

export default router