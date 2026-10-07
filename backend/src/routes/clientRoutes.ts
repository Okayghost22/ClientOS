import { Router } from 'express';
import {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
} from '../controllers/clientController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getClients);           // GET    /api/clients
router.get('/:id', getClientById);     // GET    /api/clients/:id
router.post('/', createClient);         // POST   /api/clients
router.put('/:id', updateClient);       // PUT    /api/clients/:id
router.patch('/:id', updateClient);     // PATCH  /api/clients/:id
router.delete('/:id', deleteClient);    // DELETE /api/clients/:id

export default router;
