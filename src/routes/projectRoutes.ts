import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { projectExists } from '../middleware/project'
import { taskBelongsToProject, taskExist } from '../middleware/task'

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

export default router