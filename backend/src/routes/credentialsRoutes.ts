import { Router } from 'express';
import asyncHandler from '../lib/asyncHandler.js'; // Import the wrapper
import { 
  saveCredentials, 
  getBusinessCredentials, 
  deleteCredentials 
} from '../controllers/credentialsController.js';

// Create a router instance
const router = Router();

// POST /api/credentials/:channel - Save credentials for a specific channel
router.post('/:channel', asyncHandler(saveCredentials));

// GET /api/credentials/business/:businessId - Get all credentials for a business
router.get('/business/:businessId', asyncHandler(getBusinessCredentials));

// DELETE /api/credentials/:credentialId - Delete credentials
router.delete('/:credentialId', asyncHandler(deleteCredentials));

export default router; 