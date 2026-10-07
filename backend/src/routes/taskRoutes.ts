import { Router } from 'express';
import {
    createTask,
    getAllTasks,
    getTaskById,
    getTasksByProject,
    updateTask,
    updateTaskStatus,
    deleteTask
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllTasks);                         // GET  /api/tasks
router.get('/:id', getTaskById);                     // GET  /api/tasks/:id
router.get('/project/:projectId', getTasksByProject); // GET  /api/tasks/project/:projectId
router.post('/', createTask);                         // POST /api/tasks
router.put('/:id', updateTask);                       // PUT  /api/tasks/:id
router.patch('/:id/status', updateTaskStatus);        // PATCH /api/tasks/:id/status
router.patch('/:id', updateTask);                     // PATCH /api/tasks/:id
router.delete('/:id', deleteTask);                    // DELETE /api/tasks/:id

export default router;