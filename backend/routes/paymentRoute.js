import express from 'express'
import appointmentModel from '../models/appointmentModel.js'
import authUser from '../middleware/authUser.js'

const router = express.Router()

// ========================================
// UPI Payment Webhook - Called by payment provider when payment is completed
// ========================================
router.post('/webhook/upi-payment', express.json(), async (req, res) => {
    try {
        const { 
            appointmentId, 
            transactionId, 
            amount, 
            status, 
            upiTxnId,
            payerVPA,
            timestamp,
            signature // For security verification
        } = req.body

        console.log('📥 UPI Payment Webhook Received:', {
            appointmentId,
            transactionId,
            status,
            timestamp
        })

        // TODO: VERIFY WEBHOOK SIGNATURE (IMPORTANT FOR PRODUCTION)
        // const isValid = verifyWebhookSignature(req.body, signature);
        // if (!isValid) {
        //     return res.status(403).json({ success: false, message: 'Invalid signature' });
        // }

        if (status === 'SUCCESS' || status === 'success') {
            // Update appointment payment status
            const appointment = await appointmentModel.findById(appointmentId)
            
            if (!appointment) {
                return res.status(404).json({ success: false, message: 'Appointment not found' })
            }

            // Check if payment already processed
            if (appointment.payment === true) {
                return res.json({ success: true, message: 'Payment already processed' })
            }

            // Verify amount matches
            if (parseFloat(amount) !== parseFloat(appointment.amount)) {
                console.error('❌ Amount mismatch:', { received: amount, expected: appointment.amount })
                return res.status(400).json({ success: false, message: 'Amount mismatch' })
            }

            // Update appointment
            appointment.payment = true
            appointment.paymentStatus = 'paid'
            if (transactionId) appointment.transactionId = transactionId
            if (upiTxnId) appointment.upiTransactionId = upiTxnId
            if (payerVPA) appointment.payerVPA = payerVPA
            if (timestamp) appointment.paymentTimestamp = new Date(timestamp)
            
            await appointment.save()

            console.log('✅ Payment processed successfully for appointment:', appointmentId)

            // Notify connected WebSocket clients
            if (global.notifyPaymentSuccess) {
                global.notifyPaymentSuccess(appointmentId)
            }

            return res.json({ 
                success: true, 
                message: 'Payment processed successfully',
                appointmentId 
            })
        } else {
            console.log('⚠️ Payment failed or pending:', status)
            return res.json({ success: false, message: 'Payment not successful', status })
        }
    } catch (error) {
        console.error('❌ Webhook error:', error)
        return res.status(500).json({ success: false, message: 'Webhook processing failed' })
    }
})

// ========================================
// Manual payment verification endpoint
// ========================================
router.post('/verify-manual', authUser, async (req, res) => {
    try {
        const { appointmentId, transactionId } = req.body
        const appointment = await appointmentModel.findById(appointmentId)
        
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // Check if user owns this appointment
        if (appointment.userId.toString() !== req.body.userId) {
            return res.json({ success: false, message: 'Unauthorized' })
        }

        // Check payment status
        const isPaid = appointment.payment === true || appointment.paymentStatus === 'paid'
        return res.json({ 
            success: true, 
            isPaid,
            appointment: {
                payment: appointment.payment,
                paymentStatus: appointment.paymentStatus,
                transactionId: appointment.transactionId
            }
        })
    } catch (error) {
        console.error('Verification error:', error)
        return res.json({ success: false, message: 'Verification failed' })
    }
})

// ========================================
// Get merchant UPI ID
// ========================================
router.get('/merchant-upi', authUser, async (req, res) => {
    try {
        // In production, fetch from database or config
        const merchantUPI = process.env.MERCHANT_UPI_ID || '824771300@ybl'
        
        return res.json({ 
            success: true, 
            merchantUPI 
        })
    } catch (error) {
        console.error('Error fetching merchant UPI:', error)
        return res.json({ success: false, message: 'Failed to fetch merchant UPI' })
    }
})

// ========================================
// Simulate UPI payment (for testing only - remove in production)
// ========================================
router.post('/simulate-upi-payment', authUser, async (req, res) => {
    try {
        const { appointmentId, amount } = req.body
        console.log('🧪 SIMULATING UPI PAYMENT:', { appointmentId, amount })

        // Simulate webhook call after 3 seconds
        setTimeout(async () => {
            try {
                const appointment = await appointmentModel.findById(appointmentId)
                if (appointment) {
                    appointment.payment = true
                    appointment.paymentStatus = 'paid'
                    appointment.transactionId = `SIM${Date.now()}`
                    appointment.upiTransactionId = `UPI${Date.now()}`
                    appointment.paymentTimestamp = new Date()
                    await appointment.save()

                    // Notify via WebSocket
                    if (global.notifyPaymentSuccess) {
                        global.notifyPaymentSuccess(appointmentId)
                    }

                    console.log('✅ Simulated payment completed')
                }
            } catch (error) {
                console.error('Error in simulation:', error)
            }
        }, 3000)

        return res.json({ 
            success: true, 
            message: 'Payment simulation started. Payment will be confirmed in 3 seconds.' 
        })
    } catch (error) {
        console.error('Simulation error:', error)
        return res.json({ success: false, message: 'Simulation failed' })
    }
})

export default router

