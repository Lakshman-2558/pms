import express from 'express';
import { sendEmergencyAlert } from '../controllers/emergencyController.js';

const emergencyRouter = express.Router();

// Public emergency route (no authentication required)
emergencyRouter.post("/send-alert", sendEmergencyAlert)

export default emergencyRouter;

