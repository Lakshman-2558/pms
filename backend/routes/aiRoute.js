import express from 'express';
// Using Gemini (FREE) instead of OpenAI
import { aiChat, getUserAppointmentsContext, getDoctorSlots } from '../controllers/aiControllerGemini.js';
import authUser from '../middleware/authUser.js';

const aiRouter = express.Router();

// AI Chat endpoint (public, but can use userId if logged in)
// Now using Google Gemini (FREE!) - Connected to appointment booking system
aiRouter.post('/chat', aiChat);

// Get available slots for a doctor
aiRouter.get('/doctor-slots', getDoctorSlots);

// Get user appointments context (requires authentication)
aiRouter.post('/user-context', authUser, getUserAppointmentsContext);

export default aiRouter;

