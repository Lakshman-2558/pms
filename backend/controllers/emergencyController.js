import { sendEmergencySMS } from '../services/smsService.js'

// API to send emergency SMS alerts
const sendEmergencyAlert = async (req, res) => {
    try {
        const { phone, patientName, location } = req.body

        if (!phone || !patientName) {
            return res.json({ 
                success: false, 
                message: 'Phone number and patient name are required' 
            })
        }

        const result = await sendEmergencySMS(phone, patientName, location)

        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Emergency SMS sent successfully',
                sid: result.sid
            })
        } else {
            res.json({ 
                success: false, 
                message: result.message || 'Failed to send emergency SMS' 
            })
        }
    } catch (error) {
        console.error('Error sending emergency SMS:', error)
        res.json({ 
            success: false, 
            message: error.message || 'Failed to send emergency SMS' 
        })
    }
}

export { sendEmergencyAlert }

