import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import * as queueService from '../services/queueService.js';
import { sendAppointmentCompletionEmail, sendPasswordResetOTP, sendPasswordResetConfirmation } from "../services/emailService.js";
import validator from "validator";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// API for doctor Login 
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await doctorModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.DOCTOR_JWT_SECRET || process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({ success: true, message: 'Appointment Cancelled' })
        }

        res.json({ success: false, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to mark appointment completed for doctor panel (legacy support - uses queue system)
const appointmentComplete = async (req, res) => {
    try {

        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            // Use queue service to properly update status
            await queueService.updateAppointmentStatus(appointmentId, 'completed')

            // Update doctor status if this was the current appointment
            const doctor = await doctorModel.findById(docId)
            if (doctor?.currentAppointmentId === appointmentId) {
                await doctorModel.findByIdAndUpdate(docId, {
                    status: 'in-clinic',
                    currentAppointmentId: null
                })
            }

            // Send thank you email to patient
            try {
                const emailDetails = {
                    patientName: appointmentData.userData.name,
                    doctorName: appointmentData.docData.name,
                    speciality: appointmentData.docData.speciality,
                    date: appointmentData.slotDate,
                    time: appointmentData.slotTime
                };

                await sendAppointmentCompletionEmail(appointmentData.userData.email, emailDetails);
                console.log('✅ Thank you email sent to patient');
            } catch (emailError) {
                console.error('⚠️ Failed to send thank you email:', emailError.message);
                // Continue even if email fails
            }

            return res.json({ success: true, message: 'Appointment Completed' })
        }

        res.json({ success: false, message: 'Appointment not found' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {
        // Support filtering by hospitalId if provided
        const { hospitalId } = req.query;
        const query = {};
        
        if (hospitalId) {
            query.hospitalId = hospitalId;
        }

        // Get all doctors from doctors collection
        const doctors = await doctorModel.find(query).select(['-password', '-email'])
        
        // Log for debugging
        console.log(`📋 Doctor List API: Found ${doctors.length} doctors in database`)
        
        // Ensure all doctors have available field set (for backward compatibility)
        const doctorsWithDefaults = doctors.map(doc => ({
            ...doc.toObject(),
            available: doc.available !== undefined ? doc.available : true
        }))
        
        res.json({ success: true, doctors: doctorsWithDefaults })

    } catch (error) {
        console.error('❌ Error in doctorList:', error)
        res.json({ success: false, message: error.message })
    }

}

// Removed: getDefaultAgeSymptomsBySpecialty and getDoctorAgeSymptoms (no longer needed - symptoms now based on specialization)

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
    try {

        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availablity Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {

        // Get docId from req.doctorId (set by auth middleware) or req.body (fallback)
        // req.doctorId is preserved even when multer processes FormData
        const docId = req.doctorId || req.body.docId
        const { fees, address, available, about } = req.body
        const imageFile = req.file

        if (!docId) {
            console.log('Missing docId - req.doctorId:', req.doctorId, 'req.body.docId:', req.body.docId)
            return res.json({ success: false, message: 'Doctor ID is required' })
        }

        const updateData = {}
        
        // Parse fees (comes as string from FormData)
        if (fees !== undefined && fees !== null && fees !== '') {
            updateData.fees = parseFloat(fees) || 0
        }

        // Parse address (comes as JSON string from FormData)
        if (address !== undefined && address !== null && address !== '') {
            try {
                if (typeof address === 'string') {
                    updateData.address = JSON.parse(address)
                } else {
                    updateData.address = address
                }
            } catch (e) {
                console.log('Address parse error:', e)
                // If parsing fails, try to use as is
                updateData.address = address
            }
        }

        // Parse available (comes as string from FormData)
        if (available !== undefined && available !== null) {
            updateData.available = available === 'true' || available === true || available === '1' || available === 1
        }

        // Add about field if provided
        if (about !== undefined && about !== null) {
            updateData.about = about
        }

        // Update basic fields
        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            docId, 
            updateData, 
            { new: true, runValidators: true }
        )
        
        if (!updatedDoctor) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        // Handle image upload if provided
        if (imageFile) {
            try {
                // Upload image to cloudinary
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, { 
                    resource_type: "image",
                    folder: "doctor-profiles"
                })
                const imageURL = imageUpload.secure_url

                // Update doctor image
                await doctorModel.findByIdAndUpdate(docId, { image: imageURL })
                
                // Delete temporary file
                try {
                    fs.unlinkSync(imageFile.path)
                } catch (unlinkError) {
                    console.log("Error deleting temp file:", unlinkError)
                }
            } catch (uploadError) {
                console.log("Image upload error:", uploadError)
                // Delete temp file even on error
                try {
                    if (imageFile.path) {
                        fs.unlinkSync(imageFile.path)
                    }
                } catch (unlinkError) {
                    console.log("Error deleting temp file:", unlinkError)
                }
            }
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log('Update profile error:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {

        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })



        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get queue status for doctor
const getQueueStatus = async (req, res) => {
    try {
        const { docId } = req.body // Set by authDoctor middleware
        let { slotDate } = req.query

        if (!docId) {
            return res.json({ success: false, message: 'Doctor ID is required' })
        }

        if (!slotDate) {
            // Use today's date if not provided
            const today = new Date()
            const day = today.getDate()
            const month = today.getMonth() + 1
            const year = today.getFullYear()
            slotDate = `${day}_${month}_${year}`
        }

        const queueStatus = await queueService.getDoctorQueueStatus(docId, slotDate)
        
        if (!queueStatus) {
            return res.json({
                success: true,
                queueStatus: {
                    status: 'in-clinic',
                    currentAppointmentId: null,
                    queueLength: 0,
                    appointments: [],
                    docId: docId
                },
                suggestions: [],
                delayedAppointments: []
            })
        }

        const suggestions = await queueService.getSmartSchedulingSuggestions(docId, slotDate, queueStatus?.currentAppointmentId || null).catch(err => {
            console.error('Error getting suggestions:', err)
            return []
        })
        
        const delayedAppointments = await queueService.checkDelayedAppointments(docId, slotDate).catch(err => {
            console.error('Error checking delayed appointments:', err)
            return []
        })

        res.json({
            success: true,
            queueStatus: {
                ...queueStatus,
                docId: docId // Include docId in response
            },
            suggestions: suggestions || [],
            delayedAppointments: delayedAppointments || []
        })
    } catch (error) {
        console.error('Error in getQueueStatus:', error)
        res.json({ success: false, message: error.message || 'Failed to get queue status' })
    }
}

// API to update doctor status
const updateDoctorStatus = async (req, res) => {
    try {
        const { docId } = req.body // Set by authDoctor middleware
        const { status, breakDuration } = req.body

        if (!docId) {
            return res.json({ success: false, message: 'Doctor ID is required' })
        }

        if (!status) {
            return res.json({ success: false, message: 'Status is required' })
        }

        const validStatuses = ['in-clinic', 'in-consult', 'on-break', 'unavailable']
        if (!validStatuses.includes(status)) {
            return res.json({ success: false, message: 'Invalid status' })
        }

        const updateData = { status }

        if (status === 'on-break') {
            updateData.breakStartTime = Date.now()
            updateData.breakDuration = breakDuration || 15
        } else if (status === 'in-clinic') {
            updateData.breakStartTime = null
        } else if (status === 'unavailable') {
            updateData.currentAppointmentId = null
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)
        res.json({ success: true, message: 'Status updated successfully' })
    } catch (error) {
        console.error('Error in updateDoctorStatus:', error)
        res.json({ success: false, message: error.message || 'Failed to update status' })
    }
}

// API to start consultation (move patient to in-consult)
const startConsultation = async (req, res) => {
    try {
        const { docId } = req.body // Set by authDoctor middleware
        const { appointmentId } = req.body

        if (!docId || !appointmentId) {
            return res.json({ success: false, message: 'Doctor ID and Appointment ID are required' })
        }

        // Verify appointment belongs to doctor
        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment || appointment.docId !== docId) {
            return res.json({ success: false, message: 'Invalid appointment' })
        }

        if (appointment.cancelled || appointment.isCompleted) {
            return res.json({ success: false, message: 'Cannot start cancelled or completed appointment' })
        }

        // Update appointment status
        const updated = await queueService.updateAppointmentStatus(appointmentId, 'in-consult')
        if (!updated) {
            return res.json({ success: false, message: 'Failed to update appointment status' })
        }

        // Update doctor status and current appointment
        await doctorModel.findByIdAndUpdate(docId, {
            status: 'in-consult',
            currentAppointmentId: appointmentId
        })

        // Mark appointment as alerted
        await appointmentModel.findByIdAndUpdate(appointmentId, { alerted: true })

        res.json({ success: true, message: 'Consultation started successfully' })
    } catch (error) {
        console.error('Error in startConsultation:', error)
        res.json({ success: false, message: error.message || 'Failed to start consultation' })
    }
}

// API to complete consultation and move to next
const completeConsultation = async (req, res) => {
    try {
        const { docId } = req.body // Set by authDoctor middleware
        const { appointmentId, markNoShow } = req.body

        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment || appointment.docId !== docId) {
            return res.json({ success: false, message: 'Invalid appointment' })
        }

        if (markNoShow) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                status: 'no-show',
                isCompleted: false
            })
        } else {
            await queueService.updateAppointmentStatus(appointmentId, 'completed')

            // Send thank you email to patient after successful completion
            try {
                const emailDetails = {
                    patientName: appointment.userData.name,
                    doctorName: appointment.docData.name,
                    speciality: appointment.docData.speciality,
                    date: appointment.slotDate,
                    time: appointment.slotTime
                };

                await sendAppointmentCompletionEmail(appointment.userData.email, emailDetails);
                console.log('✅ Thank you email sent to patient');
            } catch (emailError) {
                console.error('⚠️ Failed to send thank you email:', emailError.message);
                // Continue even if email fails
            }
        }

        // Update doctor status
        await doctorModel.findByIdAndUpdate(docId, {
            status: 'in-clinic',
            currentAppointmentId: null
        })

        // Get smart suggestions for next patient
        const slotDate = appointment.slotDate
        const suggestions = await queueService.getSmartSchedulingSuggestions(docId, slotDate, appointmentId)

        res.json({
            success: true,
            message: markNoShow ? 'Marked as no-show' : 'Consultation completed',
            suggestions
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to move appointment in queue (for smart scheduling)
const moveAppointmentInQueue = async (req, res) => {
    try {
        const { docId } = req.body // Set by authDoctor middleware
        const { appointmentId, newPosition } = req.body

        if (!docId || !appointmentId || !newPosition) {
            return res.json({ success: false, message: 'Doctor ID, Appointment ID, and new position are required' })
        }

        if (newPosition < 1) {
            return res.json({ success: false, message: 'Position must be at least 1' })
        }

        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment || appointment.docId !== docId) {
            return res.json({ success: false, message: 'Invalid appointment' })
        }

        if (appointment.cancelled || appointment.isCompleted) {
            return res.json({ success: false, message: 'Cannot move cancelled or completed appointment' })
        }

        // Get all appointments for the day
        const appointments = await appointmentModel.find({
            docId: docId,
            slotDate: appointment.slotDate,
            cancelled: false,
            isCompleted: false,
            status: { $in: ['pending', 'in-queue'] } // Only move pending/in-queue appointments
        }).sort({ tokenNumber: 1 })

        if (appointments.length === 0) {
            return res.json({ success: false, message: 'No appointments found to move' })
        }

        if (newPosition > appointments.length) {
            return res.json({ success: false, message: `Position cannot be greater than ${appointments.length}` })
        }

        // Reorder appointments
        const appointmentToMove = appointments.find(apt => apt._id.toString() === appointmentId)
        if (!appointmentToMove) {
            return res.json({ success: false, message: 'Appointment not found in queue' })
        }

        const currentIndex = appointments.indexOf(appointmentToMove)
        appointments.splice(currentIndex, 1)
        appointments.splice(newPosition - 1, 0, appointmentToMove)

        // Update token numbers
        for (let i = 0; i < appointments.length; i++) {
            await appointmentModel.findByIdAndUpdate(appointments[i]._id, {
                tokenNumber: i + 1,
                queuePosition: i + 1
            })
        }

        res.json({ success: true, message: 'Appointment moved successfully' })
    } catch (error) {
        console.error('Error in moveAppointmentInQueue:', error)
        res.json({ success: false, message: error.message || 'Failed to move appointment' })
    }
}

// API to get smart scheduling suggestions
const getSmartSuggestions = async (req, res) => {
    try {
        const { docId } = req.body
        const { slotDate, currentAppointmentId } = req.query

        if (!slotDate) {
            const today = new Date()
            const day = today.getDate()
            const month = today.getMonth() + 1
            const year = today.getFullYear()
            slotDate = `${day}_${month}_${year}`
        }

        const suggestions = await queueService.getSmartSchedulingSuggestions(
            docId,
            slotDate,
            currentAppointmentId || null
        )

        res.json({ success: true, suggestions })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor forgot password - send OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const doctor = await doctorModel.findOne({ email: email.toLowerCase() });

        if (!doctor) {
            // Don't reveal if email exists for security
            return res.json({ 
                success: true, 
                message: "If the email exists, an OTP has been sent to your email address." 
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Set OTP expiry (10 minutes)
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        // Save OTP to database
        await doctorModel.findByIdAndUpdate(doctor._id, {
            resetPasswordOTP: hashedOTP,
            resetPasswordOTPExpiry: otpExpiry
        });

        // Send OTP email
        try {
            await sendPasswordResetOTP(doctor.email, otp, doctor.name);
            console.log(`✅ Password reset OTP sent to doctor ${doctor.email}`);
        } catch (emailError) {
            console.error('⚠️ Failed to send password reset OTP:', emailError);
            // Clear OTP if email fails
            await doctorModel.findByIdAndUpdate(doctor._id, {
                $unset: { resetPasswordOTP: 1, resetPasswordOTPExpiry: 1 }
            });
            return res.json({ 
                success: false, 
                message: "Failed to send OTP. Please try again later." 
            });
        }

        res.json({ 
            success: true, 
            message: "OTP has been sent to your email address. Please check your inbox." 
        });

    } catch (error) {
        console.error('Error in doctor forgotPassword:', error);
        res.json({ success: false, message: error.message || "Failed to process request" });
    }
}

// API for doctor reset password - verify OTP and reset
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.json({ success: false, message: "Email, OTP, and new password are required" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }

        const doctor = await doctorModel.findOne({ email: email.toLowerCase() });

        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        if (!doctor.resetPasswordOTP || !doctor.resetPasswordOTPExpiry) {
            return res.json({ 
                success: false, 
                message: "No OTP found. Please request a new OTP." 
            });
        }

        if (new Date() > doctor.resetPasswordOTPExpiry) {
            // Clear expired OTP
            await doctorModel.findByIdAndUpdate(doctor._id, {
                $unset: { resetPasswordOTP: 1, resetPasswordOTPExpiry: 1 }
            });
            return res.json({ 
                success: false, 
                message: "OTP has expired. Please request a new OTP." 
            });
        }

        // Verify OTP
        const isOTPValid = await bcrypt.compare(otp, doctor.resetPasswordOTP);

        if (!isOTPValid) {
            return res.json({ success: false, message: "Invalid OTP. Please try again." });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP
        await doctorModel.findByIdAndUpdate(doctor._id, {
            password: hashedPassword,
            $unset: { resetPasswordOTP: 1, resetPasswordOTPExpiry: 1 }
        });

        // Send confirmation email
        try {
            await sendPasswordResetConfirmation(doctor.email, doctor.name);
            console.log(`✅ Password reset confirmation sent to doctor ${doctor.email}`);
        } catch (emailError) {
            console.error('⚠️ Failed to send password reset confirmation:', emailError);
            // Continue even if email fails - password is still reset
        }

        res.json({ 
            success: true, 
            message: "Password reset successful. You can now login with your new password." 
        });

    } catch (error) {
        console.error('Error in doctor resetPassword:', error);
        res.json({ success: false, message: error.message || "Failed to reset password" });
    }
}

export {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    getQueueStatus,
    updateDoctorStatus,
    startConsultation,
    completeConsultation,
    moveAppointmentInQueue,
    getSmartSuggestions,
    forgotPassword,
    resetPassword
    // Removed: getDoctorAgeSymptoms (no longer needed)
}