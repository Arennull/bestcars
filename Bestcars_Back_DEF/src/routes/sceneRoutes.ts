/**
 * Rutas de escenas (editor del panel).
 * Persiste en DB si DATABASE_URL está configurada.
 */

import express from 'express';
import {
  createScene,
  deleteScene,
  duplicateScene,
  getAllScenes,
  getActiveScene,
  getSceneById,
  setActiveScene,
  updateScene,
} from '../controllers/sceneController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  sceneBackgroundUpload,
  uploadSceneBackground,
} from '../controllers/storageController.js';

const router = express.Router();

// Evitar caché: la web debe ver los cambios del panel al volver a la pestaña
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

router.get('/', asyncHandler(getAllScenes));
router.get('/active', asyncHandler(getActiveScene));

router.post(
  '/upload-background',
  requireAuth,
  sceneBackgroundUpload.single('image'),
  asyncHandler(uploadSceneBackground)
);

router.get('/:id', asyncHandler(getSceneById));

router.post('/', requireAuth, asyncHandler(createScene));
router.post('/:id/duplicate', requireAuth, asyncHandler(duplicateScene));
router.patch('/:id', requireAuth, asyncHandler(updateScene));
router.patch('/:id/activate', requireAuth, asyncHandler(setActiveScene));
router.delete('/:id', requireAuth, asyncHandler(deleteScene));

export default router;
