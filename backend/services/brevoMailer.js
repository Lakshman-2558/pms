import axios from 'axios'

/**
 * Brevo Email Service
 * Production-grade email sending using Brevo API
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// Get configuration from environment (don't throw error on module load)
const getBrevoConfig = () => {
    const apiKey = process.env.BERVO_API_KEY || process.env.BREVO_API_KEY
    const senderEmail = process.env.BERVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || 'medichain@yourdomain.com'
    const appName = process.env.BERVO_APP_NAME || process.env.BREVO_APP_NAME || 'Medichain'
    
    return { apiKey, senderEmail, appName }
}

/**
 * Send OTP Email via Brevo API
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<{success: boolean, message: string, messageId?: string}>}
 */
export const sendOTPEmail = async (to, otp, userName = 'User') => {
    try {
        // Get configuration
        const { apiKey, senderEmail, appName } = getBrevoConfig()
        
        // Validate API key
        if (!apiKey) {
            console.error('❌ BERVO_API_KEY is not set in .env file')
            return {
                success: false,
                message: 'Email service not configured. Please contact administrator.'
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(to)) {
            return {
                success: false,
                message: 'Invalid email address format'
            }
        }

        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return {
                success: false,
                message: 'Invalid OTP format'
            }
        }

        // Prepare email HTML template with Medichain branding
        const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification - ${appName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🏥 ${appName}</h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">OTP Verification</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Hi ${userName},
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 15px; line-height: 1.7;">
                                We received a request to verify your email address. Please use the OTP below to complete the verification:
                            </p>
                            
                            <!-- OTP Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 42px; font-weight: 700; padding: 25px 40px; border-radius: 12px; letter-spacing: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px;">
                                        <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600;">⚠️ Important Security Information:</p>
                                        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px; line-height: 1.8;">
                                            <li>This OTP is valid for <strong>5 minutes</strong> only</li>
                                            <li>Do not share this OTP with anyone</li>
                                            <li>${appName} will never ask for your OTP via phone or email</li>
                                            <li>If you didn't request this, please ignore this email</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you have any questions or concerns, please contact our support team.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                                <strong>${appName}</strong> - Your Health, Our Priority
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} ${appName}. All rights reserved.
                            </p>
                            <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px;">
                                This is an automated email, please do not reply to this message.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `

        // Prepare Brevo API payload
        const payload = {
            sender: {
                name: appName,
                email: senderEmail
            },
            to: [
                {
                    email: to,
                    name: userName
                }
            ],
            subject: `Your ${appName} Verification Code`,
            htmlContent: emailHTML
        }

        // Send email via Brevo API
        const response = await axios.post(BREVO_API_URL, payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        })

        // Log success (without exposing sensitive data)
        console.log(`✅ OTP email sent successfully to ${to}`)
        console.log(`   Message ID: ${response.data?.messageId || 'N/A'}`)

        return {
            success: true,
            message: 'OTP sent successfully',
            messageId: response.data?.messageId
        }

    } catch (error) {
        // Handle different error types
        let errorMessage = 'Failed to send OTP email'
        
        if (error.response) {
            // Brevo API error response
            const status = error.response.status
            const data = error.response.data
            
            if (status === 401) {
                errorMessage = 'Invalid API key. Please check BERVO_API_KEY in .env file'
            } else if (status === 400) {
                errorMessage = data?.message || 'Invalid email request'
            } else if (status === 429) {
                errorMessage = 'Rate limit exceeded. Please try again later'
            } else if (status >= 500) {
                errorMessage = 'Brevo service temporarily unavailable. Please try again later'
            } else {
                errorMessage = data?.message || `Brevo API error: ${status}`
            }
            
            console.error(`❌ Brevo API Error (${status}):`, data?.message || error.message)
        } else if (error.request) {
            // Network/timeout error
            errorMessage = 'Network error. Please check your internet connection'
            console.error('❌ Network error sending OTP email:', error.message)
        } else {
            // Other errors
            errorMessage = error.message || 'Failed to send OTP email'
            console.error('❌ Error sending OTP email:', error.message)
        }

        return {
            success: false,
            message: errorMessage
        }
    }
}

/**
 * Generic function to send any email via Brevo API
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @param {string} recipientName - Recipient name (optional)
 * @param {string} senderName - Sender name (optional, defaults to appName)
 * @returns {Promise<{success: boolean, message: string, messageId?: string}>}
 */
export const sendEmail = async (to, subject, htmlContent, recipientName = 'User', senderName = null) => {
    try {
        const { apiKey, senderEmail, appName } = getBrevoConfig()
        
        // Validate API key
        if (!apiKey) {
            console.error('❌ BERVO_API_KEY is not set in .env file')
            return {
                success: false,
                message: 'Email service not configured. Please contact administrator.'
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(to)) {
            return {
                success: false,
                message: 'Invalid email address format'
            }
        }

        // Prepare Brevo API payload
        const payload = {
            sender: {
                name: senderName || appName,
                email: senderEmail
            },
            to: [
                {
                    email: to,
                    name: recipientName
                }
            ],
            subject: subject,
            htmlContent: htmlContent
        }

        // Send email via Brevo API
        const response = await axios.post(BREVO_API_URL, payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        })

        // Log success (without exposing sensitive data)
        console.log(`✅ Email sent successfully to ${to}`)
        console.log(`   Subject: ${subject}`)
        console.log(`   Message ID: ${response.data?.messageId || 'N/A'}`)

        return {
            success: true,
            message: 'Email sent successfully',
            messageId: response.data?.messageId
        }

    } catch (error) {
        // Handle different error types
        let errorMessage = 'Failed to send email'
        
        if (error.response) {
            // Brevo API error response
            const status = error.response.status
            const data = error.response.data
            
            if (status === 401) {
                errorMessage = 'Invalid API key. Please check BERVO_API_KEY in .env file'
            } else if (status === 400) {
                errorMessage = data?.message || 'Invalid email request'
            } else if (status === 429) {
                errorMessage = 'Rate limit exceeded. Please try again later'
            } else if (status >= 500) {
                errorMessage = 'Brevo service temporarily unavailable. Please try again later'
            } else {
                errorMessage = data?.message || `Brevo API error: ${status}`
            }
            
            console.error(`❌ Brevo API Error (${status}):`, data?.message || error.message)
        } else if (error.request) {
            // Network/timeout error
            errorMessage = 'Network error. Please check your internet connection'
            console.error('❌ Network error sending email:', error.message)
        } else {
            // Other errors
            errorMessage = error.message || 'Failed to send email'
            console.error('❌ Error sending email:', error.message)
        }

        return {
            success: false,
            message: errorMessage
        }
    }
}

/**
 * Verify Brevo API connection
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyBrevoConnection = async () => {
    try {
        const { apiKey } = getBrevoConfig()
        
        if (!apiKey) {
            return {
                success: false,
                message: 'BERVO_API_KEY not configured'
            }
        }

        // Test API connection by checking account info
        const response = await axios.get('https://api.brevo.com/v3/account', {
            headers: {
                'api-key': apiKey,
                'Accept': 'application/json'
            },
            timeout: 5000
        })

        return {
            success: true,
            message: 'Brevo API connection verified',
            accountEmail: response.data?.email
        }
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to verify Brevo connection'
        }
    }
}

