import validator from 'validator'
import { sendOTPEmail, verifyBrevoConnection } from '../services/brevoMailer.js'
import { generateOTP, storeOTP, verifyOTP, hasActiveOTP, getOTPRemainingTime, removeOTP } from '../utils/otpStorage.js'

/**
 * Send OTP to user's email
 * POST /api/send-otp
 */
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body

        // Validate email
        if (!email || !validator.isEmail(email)) {
            return res.json({
                success: false,
                message: 'Please provide a valid email address'
            })
        }

        // Check if API key is configured
        if (!process.env.BERVO_API_KEY && !process.env.BREVO_API_KEY) {
            console.error('❌ BERVO_API_KEY not configured')
            return res.json({
                success: false,
                message: 'Email service not configured. Please contact administrator.'
            })
        }

        // Check if email already has active OTP
        if (hasActiveOTP(email)) {
            const remaining = getOTPRemainingTime(email)
            const minutes = Math.floor(remaining / 60)
            const seconds = remaining % 60
            return res.json({
                success: false,
                message: `OTP already sent. Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before requesting a new one`
            })
        }

        // Generate OTP
        const otp = generateOTP()

        // Store OTP
        try {
            storeOTP(email, otp)
        } catch (storeError) {
            return res.json({
                success: false,
                message: storeError.message || 'Failed to generate OTP'
            })
        }

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otp)

        if (emailResult.success) {
            console.log(`✅ OTP sent successfully to ${email}`)
            return res.json({
                success: true,
                message: 'OTP sent successfully to your email. Please check your inbox.'
            })
        } else {
            // Remove stored OTP if email failed
            removeOTP(email)
            return res.json({
                success: false,
                message: emailResult.message || 'Failed to send OTP email. Please try again later.'
            })
        }

    } catch (error) {
        console.error('❌ Error in sendOTP:', error)
        return res.json({
            success: false,
            message: error.message || 'Failed to send OTP. Please try again later.'
        })
    }
}

/**
 * Verify OTP
 * POST /api/verify-otp
 */
export const verifyOTPCode = async (req, res) => {
    try {
        const { email, otp } = req.body

        // Validate inputs
        if (!email || !validator.isEmail(email)) {
            return res.json({
                success: false,
                message: 'Please provide a valid email address'
            })
        }

        if (!otp || !/^\d{6}$/.test(otp)) {
            return res.json({
                success: false,
                message: 'Please provide a valid 6-digit OTP'
            })
        }

        // Verify OTP
        const result = verifyOTP(email, otp)

        if (result.success) {
            console.log(`✅ OTP verified successfully for ${email}`)
            return res.json({
                success: true,
                message: 'OTP verified successfully'
            })
        } else {
            return res.json({
                success: false,
                message: result.message || 'Invalid or expired OTP'
            })
        }

    } catch (error) {
        console.error('❌ Error in verifyOTPCode:', error)
        return res.json({
            success: false,
            message: error.message || 'Failed to verify OTP. Please try again.'
        })
    }
}

/**
 * Verify Brevo API connection (for testing)
 * GET /api/verify-brevo
 */
export const verifyBrevo = async (req, res) => {
    try {
        const result = await verifyBrevoConnection()
        return res.json(result)
    } catch (error) {
        return res.json({
            success: false,
            message: error.message || 'Failed to verify Brevo connection'
        })
    }
}

