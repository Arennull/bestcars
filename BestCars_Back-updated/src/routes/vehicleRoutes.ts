import express from 'express';
import { createVehicle, deleteVehicle, getAllVehicles, getVehicleById, updateVehicle } from '../controllers/vehicleController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Panel endpoints (protected)
router.post('/', requireAuth, createVehicle);
router.patch('/:id', requireAuth, updateVehicle);
router.delete('/:id', requireAuth, deleteVehicle);

export default router;
