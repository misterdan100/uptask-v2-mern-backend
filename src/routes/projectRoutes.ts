import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { projectExists } from '../middleware/project'
import { taskBelongsToProject, taskExist } from '../middleware/task'
import { authenticate } from '../middleware/auth'
import { TeamMemberController } from '../controllers/TeamController'

const router = Router()

// validate endpoints by user
router.use(authenticate)

router.post('/',
    body('projectName').notEmpty().withMessage('Name Project is required.'),
    body('clientName').notEmpty().withMessage('Name Client is required.'),
    body('description').notEmpty().withMessage('Description is required.'),
    handleInputErrors,
    ProjectController.createProject
)

router.get("/",
  ProjectController.getAllProjects
)

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

/** Routes for tasks */
router.param("projectId", projectExists);
router.param("taskId", param("taskId").isMongoId().withMessage("Invalid ID"));
router.param('taskId', taskExist)
router.param('taskId', taskBelongsToProject)

router.post(
  "/:projectId/tasks",
  body("name").notEmpty().withMessage("Name Task is required"),
  body("description").notEmpty().withMessage("A description is required"),
  handleInputErrors,
  TaskController.createTask
);

router.get("/:projectId/tasks", TaskController.getProjectTasks);

router.get("/:projectId/tasks/:taskId",
  handleInputErrors,
  TaskController.getTaskByID
);

router.put("/:projectId/tasks/:taskId",
  body("name").notEmpty().withMessage("Name Task is required"),
  body("description").notEmpty().withMessage("A description is required"),
  handleInputErrors,
  TaskController.updateTask
);

router.delete("/:projectId/tasks/:taskId",
  handleInputErrors,
  TaskController.deleteTaskByID
);

router.post('/:projectId/tasks/:taskId/status',
  body('status').notEmpty().withMessage('Status is required'),
  handleInputErrors,
  TaskController.updateStatus
)

/** Routes for Teams */
router.get('/:projectId/team',
  handleInputErrors,
  TeamMemberController.getProjectTeam
)

router.post('/:projectId/team/find',
  body('email').isEmail().withMessage('A valid e-mail is required'),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
)

router.post('/:projectId/team',
  body('id').isMongoId().withMessage('Invalid User ID'),
  handleInputErrors,
  TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
  param('userId').isMongoId().withMessage('User ID not valid'),
  handleInputErrors,
  TeamMemberController.removeMemberById
)

export default router