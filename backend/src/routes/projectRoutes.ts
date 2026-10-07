import { Router } from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from '../controllers/projectController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken); // Protect all project routes

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;