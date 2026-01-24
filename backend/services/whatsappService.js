/**
 * WhatsApp Service - Twilio & Meta Cloud API Integration
 * Supports Twilio WhatsApp API and Meta WhatsApp Cloud API
 */

// WhatsApp Provider Configuration
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || (process.env.TWILIO_ACCOUNT_SID ? 'twilio' : process.env.WHATSAPP_ACCESS_TOKEN ? 'meta' : 'dev-mode')

/**
 * Send WhatsApp message using Twilio
 */
const sendViaTwilio = async (to, message) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886' // Default sandbox number

        if (!accountSid || !authToken) {
            console.log('⚠️  TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not configured')
            return { success: false, message: 'Twilio credentials not configured' }
        }

        // Clean phone number (remove all non-digits)
        const cleanPhone = to.replace(/\D/g, '')
        
        // Ensure phone number starts with country code
        // Format: whatsapp:+919876543210
        const phoneNumber = cleanPhone.startsWith('91') ? `whatsapp:+${cleanPhone}` : `whatsapp:+91${cleanPhone}`

        const twilio = (await import('twilio')).default
        const client = twilio(accountSid, authToken)

        console.log(`📱 Twilio WhatsApp: Sending message to ${phoneNumber}`)
        
        const result = await client.messages.create({
            from: fromNumber,
            to: phoneNumber,
            body: message
        })

        console.log('✅ Twilio WhatsApp: Message sent successfully')
        console.log(`   Message SID: ${result.sid}`)
        console.log(`   Status: ${result.status}`)

        return {
            success: true,
            message: 'WhatsApp message sent successfully',
            provider: 'Twilio',
            sid: result.sid,
            status: result.status
        }
    } catch (error) {
        console.error('❌ Twilio WhatsApp Error:', error)
        return {
            success: false,
            message: error.message || 'Failed to send WhatsApp message'
        }
    }
}

/**
 * Send WhatsApp message using Meta Cloud API
 */
const sendViaMeta = async (to, message) => {
    try {
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

        if (!accessToken || !phoneNumberId) {
            console.log('⚠️  WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured')
            return { success: false, message: 'Meta WhatsApp credentials not configured' }
        }

        // Clean phone number (remove all non-digits)
        const cleanPhone = to.replace(/\D/g, '')
        
        // Ensure phone number starts with country code
        // Format: 919876543210 (no + sign for Meta API)
        const phoneNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`

        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
        
        console.log(`📱 Meta WhatsApp: Sending message to ${phoneNumber}`)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'text',
                text: {
                    body: message
                }
            })
        })

        const data = await response.json()

        if (response.ok && data.messages) {
            console.log('✅ Meta WhatsApp: Message sent successfully')
            console.log(`   Message ID: ${data.messages[0].id}`)
            return {
                success: true,
                message: 'WhatsApp message sent successfully',
                provider: 'Meta',
                messageId: data.messages[0].id
            }
        } else {
            console.error('❌ Meta WhatsApp Error:', data.error || data)
            return {
                success: false,
                message: data.error?.message || 'Failed to send WhatsApp message'
            }
        }
    } catch (error) {
        console.error('❌ Meta WhatsApp Error:', error)
        return {
            success: false,
            message: error.message || 'Failed to send WhatsApp message'
        }
    }
}


/**
 * Main WhatsApp sending function - routes to selected provider
 */
export const sendWhatsApp = async (to, message) => {
    try {
        // Development mode - log WhatsApp details if no provider configured
        if (WHATSAPP_PROVIDER === 'dev-mode' && !process.env.TWILIO_ACCOUNT_SID && !process.env.WHATSAPP_ACCESS_TOKEN) {
            console.log('\n📱 WhatsApp Service (Development Mode):')
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log(`To: ${to}`)
            console.log(`Message: ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}`)
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('⚠️  WhatsApp provider not configured')
            console.log('   Configure: TWILIO_ACCOUNT_SID or WHATSAPP_ACCESS_TOKEN in .env\n')
            return {
                success: false,
                message: 'WhatsApp service not configured. Please configure Twilio or Meta WhatsApp API.',
                provider: 'dev-mode'
            }
        }

        // Route to selected provider
        switch (WHATSAPP_PROVIDER.toLowerCase()) {
            case 'twilio':
                return await sendViaTwilio(to, message)
            case 'meta':
                return await sendViaMeta(to, message)
            default:
                // Auto-detect provider
                if (process.env.TWILIO_ACCOUNT_SID) {
                    return await sendViaTwilio(to, message)
                } else if (process.env.WHATSAPP_ACCESS_TOKEN) {
                    return await sendViaMeta(to, message)
                } else {
                    return {
                        success: false,
                        message: 'No WhatsApp provider configured. Please configure Twilio or Meta WhatsApp API.'
                    }
                }
        }
    } catch (error) {
        console.error('WhatsApp Service Error:', error)
        return {
            success: false,
            message: error.message || 'Failed to send WhatsApp message'
        }
    }
}

/**
 * Send appointment confirmation WhatsApp
 */
export const sendAppointmentWhatsApp = async (phone, appointmentData) => {
    const {
        patientName,
        doctorName,
        speciality,
        date,
        time,
        fee,
        hospitalAddress,
        googleMapsLink,
        tokenNumber
    } = appointmentData

    const message = `🏥 *Appointment Confirmation*

Hello ${patientName || 'Patient'},

Your appointment with *Dr. ${doctorName || 'Doctor'}* (${speciality || 'General'}) is confirmed.

📅 *Date:* ${date || 'N/A'}
⏰ *Time:* ${time || 'N/A'}
💰 *Fee:* Rs. ${fee || '0'}
📍 *Location:* ${hospitalAddress || 'Address not provided'}
${googleMapsLink ? `🗺️ *Maps:* ${googleMapsLink}` : ''}
🎫 *Token Number:* ${tokenNumber || 'N/A'}

Thank you for choosing our service!`

    return await sendWhatsApp(phone, message)
}

/**
 * Send emergency alert WhatsApp
 * @param {string} phone - Phone number
 * @param {string} patientName - Name of the patient/person in emergency
 * @param {string|object} location - Location string or object with latitude/longitude
 */
export const sendEmergencyWhatsApp = async (phone, patientName, location) => {
    let locationText = 'Location not available'
    
    if (location) {
        if (typeof location === 'string') {
            locationText = location
        } else if (location.latitude && location.longitude) {
            locationText = `📍 Location: https://www.google.com/maps?q=${location.latitude},${location.longitude}\nLat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`
        }
    }

    const message = `🚨 *EMERGENCY ALERT* 🚨

${patientName} needs immediate help!

${locationText}

Please help or contact emergency services immediately.`

    return await sendWhatsApp(phone, message)
}

