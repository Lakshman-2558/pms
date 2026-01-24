import express from 'express'
import { sendOTP, verifyOTPCode, verifyBrevo } from '../controllers/otpController.js'

const router = express.Router()

// OTP Routes
router.post('/send-otp', sendOTP)
router.post('/verify-otp', verifyOTPCode)
router.get('/verify-brevo', verifyBrevo) // For testing Brevo connection

export default router

