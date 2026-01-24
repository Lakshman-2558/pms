/**
 * SMS Service - Development Mode Only
 * SMS functionality is disabled - logs messages in development mode
 */

/**
 * Main SMS sending function - Development mode only
 */
export const sendSMS = async (to, message) => {
    try {
        // Development mode - log SMS details
        console.log('\n📱 SMS Service (Development Mode):')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`To: ${to}`)
        console.log(`Message: ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('⚠️  SMS service is disabled (development mode)')
        console.log('   SMS notifications are logged but not sent.\n')
        return {
            success: true,
            message: 'SMS service disabled (development mode)',
            provider: 'dev-mode'
        }
    } catch (error) {
        console.error('SMS Service Error:', error)
        return {
            success: false,
            message: error.message || 'Failed to send SMS'
        }
    }
}

/**
 * Send appointment confirmation SMS
 */
export const sendAppointmentSMS = async (phone, appointmentData) => {
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

    const message = `Appointment Confirmation

Hello ${patientName || 'Patient'},

Your appointment with Dr. ${doctorName || 'Doctor'} (${speciality || 'General'}) is confirmed.

Date: ${date || 'N/A'}
Time: ${time || 'N/A'}
Fee: Rs. ${fee || '0'}
Location: ${hospitalAddress || 'Address not provided'}
${googleMapsLink ? `Maps: ${googleMapsLink}` : ''}
${tokenNumber ? `Token Number: ${tokenNumber}` : ''}

Thank you for choosing our service!`

    return await sendSMS(phone, message)
}

/**
 * Send emergency alert SMS
 * @param {string} phone - Phone number
 * @param {string} patientName - Name of the patient/person in emergency
 * @param {string|object} location - Location string or object with latitude/longitude
 */
export const sendEmergencySMS = async (phone, patientName, location) => {
    let locationText = 'Location not available'
    
    if (location) {
        if (typeof location === 'string') {
            // If location is already a formatted string, use it directly
            locationText = location
        } else if (location.latitude && location.longitude) {
            // If location is an object with coordinates
            locationText = `Location: https://www.google.com/maps?q=${location.latitude},${location.longitude}\nLat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`
        }
    }

    const message = `EMERGENCY ALERT

${patientName} needs immediate help!

${locationText}

Please help or contact emergency services immediately.`

    return await sendSMS(phone, message)
}
