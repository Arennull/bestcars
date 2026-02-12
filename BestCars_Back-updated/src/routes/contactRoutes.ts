import express from 'express';
import { getAllContacts, submitContact, updateContact } from '../controllers/contactController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', requireAuth, getAllContacts);
router.patch('/:id', requireAuth, updateContact);

export default router;
