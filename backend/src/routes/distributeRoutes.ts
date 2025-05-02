import { Router } from 'express';
import asyncHandler from '../lib/asyncHandler.js';
import { distributeContent } from '../controllers/distributeController.js';

// Create a router instance
const router = Router();

// POST /api/distribute - Create distribution jobs for channels
router.post('/', asyncHandler(distributeContent));

export default router; 