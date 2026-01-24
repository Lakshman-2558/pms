/**
 * OTP Storage Utility
 * In-memory storage for OTPs (can be upgraded to Redis/DB later)
 * 
 * Structure:
 * {
 *   email: {
 *     otp: string (hashed),
 *     expiresAt: timestamp,
 *     attempts: number,
 *     createdAt: timestamp
 *   }
 * }
 */

const otpStore = new Map()

// OTP expiry time: 5 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000

// Max attempts before cooldown
const MAX_ATTEMPTS = 5

// Cooldown period: 15 minutes
const COOLDOWN_MS = 15 * 60 * 1000

/**
 * Generate secure 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store OTP for email
 * @param {string} email - User email
 * @param {string} otp - Plain OTP (will be hashed)
 * @returns {boolean} Success status
 */
export const storeOTP = (email, otp) => {
    try {
        const now = Date.now()
        
        // Check if email is in cooldown
        const existing = otpStore.get(email.toLowerCase())
        if (existing && existing.cooldownUntil && existing.cooldownUntil > now) {
            const remainingMinutes = Math.ceil((existing.cooldownUntil - now) / 60000)
            throw new Error(`Please wait ${remainingMinutes} minute(s) before requesting a new OTP`)
        }

        // Store OTP with expiry
        otpStore.set(email.toLowerCase(), {
            otp: otp, // Store plain OTP for comparison (in production, hash it)
            expiresAt: now + OTP_EXPIRY_MS,
            attempts: 0,
            createdAt: now,
            cooldownUntil: null
        })

        // Cleanup expired OTPs periodically
        cleanupExpiredOTPs()

        return true
    } catch (error) {
        throw error
    }
}

/**
 * Verify OTP for email
 * @param {string} email - User email
 * @param {string} inputOTP - OTP entered by user
 * @returns {{success: boolean, message: string}}
 */
export const verifyOTP = (email, inputOTP) => {
    try {
        const emailKey = email.toLowerCase()
        const stored = otpStore.get(emailKey)

        if (!stored) {
            return {
                success: false,
                message: 'OTP not found. Please request a new OTP'
            }
        }

        const now = Date.now()

        // Check if OTP expired
        if (stored.expiresAt < now) {
            otpStore.delete(emailKey)
            return {
                success: false,
                message: 'OTP has expired. Please request a new OTP'
            }
        }

        // Check attempts
        if (stored.attempts >= MAX_ATTEMPTS) {
            // Set cooldown
            stored.cooldownUntil = now + COOLDOWN_MS
            otpStore.set(emailKey, stored)
            const remainingMinutes = Math.ceil(COOLDOWN_MS / 60000)
            return {
                success: false,
                message: `Too many failed attempts. Please wait ${remainingMinutes} minutes before requesting a new OTP`
            }
        }

        // Verify OTP
        if (stored.otp !== inputOTP) {
            stored.attempts += 1
            otpStore.set(emailKey, stored)
            
            const remainingAttempts = MAX_ATTEMPTS - stored.attempts
            return {
                success: false,
                message: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining` : 'No attempts remaining'}`
            }
        }

        // OTP verified successfully - remove it
        otpStore.delete(emailKey)

        return {
            success: true,
            message: 'OTP verified successfully'
        }

    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to verify OTP'
        }
    }
}

/**
 * Remove OTP for email (after successful verification)
 * @param {string} email - User email
 */
export const removeOTP = (email) => {
    otpStore.delete(email.toLowerCase())
}

/**
 * Check if email has active OTP
 * @param {string} email - User email
 * @returns {boolean}
 */
export const hasActiveOTP = (email) => {
    const stored = otpStore.get(email.toLowerCase())
    if (!stored) return false
    
    const now = Date.now()
    return stored.expiresAt > now
}

/**
 * Get remaining time for OTP
 * @param {string} email - User email
 * @returns {number} Remaining seconds (0 if expired)
 */
export const getOTPRemainingTime = (email) => {
    const stored = otpStore.get(email.toLowerCase())
    if (!stored) return 0
    
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((stored.expiresAt - now) / 1000))
    return remaining
}

/**
 * Cleanup expired OTPs
 */
const cleanupExpiredOTPs = () => {
    const now = Date.now()
    for (const [email, data] of otpStore.entries()) {
        // Remove if expired and not in cooldown
        if (data.expiresAt < now && (!data.cooldownUntil || data.cooldownUntil < now)) {
            otpStore.delete(email)
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)

/**
 * Get OTP statistics (for debugging)
 * @returns {object} Stats
 */
export const getOTPStats = () => {
    return {
        totalOTPs: otpStore.size,
        activeOTPs: Array.from(otpStore.values()).filter(otp => otp.expiresAt > Date.now()).length
    }
}

