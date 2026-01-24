import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendContactMessage } from "../services/emailService.js";
import validator from "validator";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import HospitalTieUp from "../models/hospitalTieUpModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';
import crypto from 'crypto';
import { sendPasswordResetOTP, sendPasswordResetConfirmation, sendAppointmentConfirmation } from '../services/emailService.js';

// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password, phone, dob, gender, bloodGroup } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // Calculate age from DOB if provided
        let calculatedAge = null;
        if (dob) {
            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            calculatedAge = age > 0 ? age : null;
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
            phone: phone || '000000000',
            dob: dob || 'Not Selected',
            age: calculatedAge,
            gender: gender || 'Not Selected',
            bloodGroup: bloodGroup || '',
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        // Handle MongoDB duplicate key error for userId index
        if (error.code === 11000 && error.keyPattern?.userId) {
            return res.json({ 
                success: false, 
                message: 'Database configuration error. Please contact administrator or try again.' 
            })
        }
        // Handle MongoDB duplicate email error
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.json({ 
                success: false, 
                message: 'Email already exists. Please use a different email or login instead.' 
            })
        }
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender, bloodGroup } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        // Calculate age from DOB
        let calculatedAge = null;
        if (dob && dob !== 'Not Selected') {
            const today = new Date();
            const birthDate = new Date(dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            calculatedAge = age > 0 ? age : null;
        }

        await userModel.findByIdAndUpdate(userId, { 
            name, 
            phone, 
            address: JSON.parse(address), 
            dob, 
            gender,
            age: calculatedAge,
            bloodGroup: bloodGroup || ''
        })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get saved patient profiles
const getSavedProfiles = async (req, res) => {
    try {
        const { userId } = req.body
        
        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' })
        }

        const user = await userModel.findById(userId).select('savedProfiles')
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        res.json({ 
            success: true, 
            profiles: user.savedProfiles || [] 
        })

    } catch (error) {
        console.error('Error fetching saved profiles:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to save a patient profile
const saveProfile = async (req, res) => {
    try {
        const { userId, profileData } = req.body
        
        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' })
        }

        if (!profileData || !profileData.name || !profileData.age || !profileData.gender || !profileData.relationship) {
            return res.json({ success: false, message: 'Missing required profile data' })
        }

        const user = await userModel.findById(userId)
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        // Initialize savedProfiles if it doesn't exist
        if (!user.savedProfiles) {
            user.savedProfiles = []
        }

        // Add new profile
        user.savedProfiles.push({
            name: profileData.name,
            age: profileData.age,
            gender: profileData.gender,
            relationship: profileData.relationship,
            phone: profileData.phone || '',
            medicalHistory: profileData.medicalHistory || []
        })

        await user.save()

        res.json({ 
            success: true, 
            message: 'Profile saved successfully',
            profiles: user.savedProfiles 
        })

    } catch (error) {
        console.error('Error saving profile:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify appointment by ID (public endpoint for QR code scanning)
const verifyAppointment = async (req, res) => {
    try {
        const { id } = req.params
        
        if (!id) {
            return res.json({ success: false, message: 'Appointment ID is required' })
        }

        // Find appointment by ID
        const appointment = await appointmentModel.findById(id)
            .populate('userId', 'name email phone')
            .populate('docId', 'name speciality specialization qualification experience fees address')
            .lean()

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // Format appointment data for display
        const formattedAppointment = {
            _id: appointment._id,
            id: appointment._id.toString(),
            slotDate: appointment.slotDate,
            slotTime: appointment.slotTime,
            status: appointment.status || 'pending',
            tokenNumber: appointment.tokenNumber || null,
            amount: appointment.amount || 0,
            date: appointment.date || null,
            actualPatient: appointment.actualPatient || null,
            selectedSymptoms: appointment.selectedSymptoms || [],
            recentPrescription: appointment.recentPrescription || null,
            userData: appointment.userId ? {
                name: appointment.userId.name,
                email: appointment.userId.email,
                phone: appointment.userId.phone
            } : null,
            docData: appointment.docId ? {
                name: appointment.docId.name,
                speciality: appointment.docId.speciality || appointment.docId.specialization,
                specialization: appointment.docId.specialization || appointment.docId.speciality,
                qualification: appointment.docId.qualification,
                experience: appointment.docId.experience,
                fees: appointment.docId.fees,
                address: appointment.docId.address
            } : null
        }

        res.json({ 
            success: true, 
            appointment: formattedAppointment 
        })

    } catch (error) {
        console.error('Error verifying appointment:', error)
        res.json({ success: false, message: error.message || 'Failed to verify appointment' })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime, symptoms, actualPatient, paymentMethod } = req.body
        const prescriptionFile = req.file
        
        // Try to find doctor in main doctor collection first
        let docData = await doctorModel.findById(docId).select("-password")
        
        // If not found in main collection, check hospital tie-up doctors
        if (!docData) {
            const hospitals = await HospitalTieUp.find({})
            for (const hospital of hospitals) {
                const hospitalDoctor = hospital.doctors.find(doc => doc._id.toString() === docId)
                if (hospitalDoctor) {
                    // Convert hospital doctor to match main doctor structure
                    docData = {
                        _id: hospitalDoctor._id,
                        name: hospitalDoctor.name,
                        speciality: hospitalDoctor.specialization,
                        specialization: hospitalDoctor.specialization,
                        qualification: hospitalDoctor.qualification,
                        degree: hospitalDoctor.qualification,
                        experience: hospitalDoctor.experience || 0,
                        available: hospitalDoctor.available !== undefined && hospitalDoctor.available !== null 
                            ? hospitalDoctor.available 
                            : true, // Default to available if not set
                        fees: hospitalDoctor.fees || 50,
                        slots_booked: hospitalDoctor.slots_booked || {},
                        hospitalName: hospital.name,
                        hospitalId: hospital._id,
                        isHospitalDoctor: true
                    }
                    break
                }
            }
        }
        
        // Check if doctor was found
        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }
        
        // Ensure available property exists and check availability
        const isAvailable = docData.available !== undefined && docData.available !== null 
            ? (docData.available === true || docData.available === 'true')
            : true // Default to available if property is missing
        
        if (!isAvailable) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        // Ensure slots_booked exists
        let slots_booked = docData.slots_booked || {}

        // Define slot types: "10-1" (10 AM to 1 PM) and "4-9" (4 PM to 9 PM)
        const slotTypes = [
            { start: 10, end: 13, label: '10-1' },  // 10 AM to 1 PM
            { start: 16, end: 21, label: '4-9' }    // 4 PM to 9 PM
        ]

        // Parse slot time to get hour
        const slotHour = parseInt(slotTime.split(':')[0])
        const slotMinute = parseInt(slotTime.split(':')[1]?.split(' ')[0] || slotTime.split(':')[1])
        
        // Determine which slot type this booking belongs to
        let selectedSlotType = null
        for (const slotType of slotTypes) {
            if (slotHour >= slotType.start && slotHour < slotType.end) {
                selectedSlotType = slotType
                break
            }
        }

        if (!selectedSlotType) {
            return res.json({ success: false, message: 'Invalid time slot. Only slots between 10 AM-1 PM and 4 PM-9 PM are available.' })
        }

        // Check if this specific time slot is already booked
        if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
            return res.json({ success: false, message: 'Slot Not Available' })
        }

        // Count bookings for this slot type on this date
        const slotsBookedForDate = slots_booked[slotDate] || []
        const slotTypeBookings = slotsBookedForDate.filter(bookedTime => {
            const bookedHour = parseInt(bookedTime.split(':')[0])
            return (bookedHour >= selectedSlotType.start && bookedHour < selectedSlotType.end)
        })

        // Check if slot type has reached 25 bookings limit
        if (slotTypeBookings.length >= 25) {
            return res.json({ 
                success: false, 
                message: `Slot type "${selectedSlotType.label}" is full. Maximum 25 bookings allowed per slot type.` 
            })
        }

        // Add the booking
        if (!slots_booked[slotDate]) {
            slots_booked[slotDate] = []
        }
        slots_booked[slotDate].push(slotTime)

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        // Parse actualPatient if it's a JSON string
        let parsedActualPatient = null
        if (actualPatient) {
            try {
                parsedActualPatient = typeof actualPatient === 'string' ? JSON.parse(actualPatient) : actualPatient
            } catch (e) {
                parsedActualPatient = actualPatient
            }
        }

        // Upload prescription if provided
        let prescriptionUrl = ''
        if (prescriptionFile) {
            try {
                const prescriptionUpload = await cloudinary.uploader.upload(prescriptionFile.path, {
                    resource_type: prescriptionFile.mimetype.includes('pdf') ? 'raw' : 'image',
                    folder: 'prescriptions'
                })
                prescriptionUrl = prescriptionUpload.secure_url
            } catch (uploadError) {
                console.error('Error uploading prescription:', uploadError)
                // Continue without prescription if upload fails
            }
        }

        // Calculate cost breakdown
        const consultationFee = docData.fees || 50
        const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5') // Default 5%
        const gstPercentage = parseFloat(process.env.GST_PERCENTAGE || '18') // Default 18%
        
        const platformFee = Math.round((consultationFee * platformFeePercentage) / 100)
        const subtotal = consultationFee + platformFee
        const gst = Math.round((subtotal * gstPercentage) / 100)
        const totalAmount = subtotal + gst

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: totalAmount, // Total amount including fees and GST
            consultationFee: consultationFee,
            platformFee: platformFee,
            gst: gst,
            costBreakdown: {
                consultationFee: consultationFee,
                platformFee: platformFee,
                gst: gst,
                total: totalAmount
            },
            slotTime,
            slotDate,
            date: Date.now(),
            selectedSymptoms: symptoms || [], // Store selected symptoms
            actualPatient: parsedActualPatient || {
                name: userData?.name || '',
                age: userData?.age || '',
                gender: userData?.gender || '',
                relationship: 'Self',
                medicalHistory: [],
                symptoms: '',
                phone: userData?.phone || '',
                isSelf: true
            },
            recentPrescription: prescriptionUrl,
            paymentMethod: paymentMethod || 'payOnVisit' // Save payment method selected by user
        }

        // Assign token number and calculate queue position
        const { assignTokenNumber, calculateQueuePosition } = await import('../services/queueService.js')
        const tokenNumber = await assignTokenNumber(docId, slotDate)
        appointmentData.tokenNumber = tokenNumber
        appointmentData.status = 'pending'
        appointmentData.queuePosition = null

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // Calculate queue position and wait time
        const queueInfo = await calculateQueuePosition(newAppointment._id.toString(), docId, slotDate)
        if (queueInfo) {
            await appointmentModel.findByIdAndUpdate(newAppointment._id, {
                queuePosition: queueInfo.queuePosition,
                estimatedWaitTime: queueInfo.estimatedWaitTime,
                status: 'in-queue'
            })
        }

        // save new slots data in docData (only for main doctors, not hospital doctors)
        // Hospital doctors don't have slots_booked in the main collection
        if (!docData.isHospitalDoctor) {
            await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        } else if (docData.hospitalId) {
            // For hospital doctors, update slots in the hospital document
            try {
                const hospital = await HospitalTieUp.findById(docData.hospitalId)
                if (hospital) {
                    const doctorIndex = hospital.doctors.findIndex(doc => doc._id.toString() === docId)
                    if (doctorIndex !== -1) {
                        if (!hospital.doctors[doctorIndex].slots_booked) {
                            hospital.doctors[doctorIndex].slots_booked = {}
                        }
                        hospital.doctors[doctorIndex].slots_booked = slots_booked
                        await hospital.save()
                    }
                }
            } catch (error) {
                console.error('Error updating hospital doctor slots:', error)
                // Continue even if update fails
            }
        }

        // Format date for SMS message
        const dateArray = slotDate.split('_')
        const day = dateArray[0]
        const month = dateArray[1]
        const year = dateArray[2]
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const formattedDate = `${day} ${monthNames[parseInt(month) - 1]} ${year}`
        
        // Get doctor's address for location
        const doctorAddress = docData.address || {}
        const addressLine1 = doctorAddress.line1 || ''
        const addressLine2 = doctorAddress.line2 || ''
        const fullAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}`.trim() || (docData.hospitalName || '')
        
        // Create Google Maps search URL for doctor's location
        const doctorName = docData.name || 'Doctor'
        const doctorSpeciality = docData.speciality || docData.specialization || 'General Medicine'
        const locationQuery = encodeURIComponent(fullAddress || `${doctorName} ${doctorSpeciality}`)
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`
        
        // Prepare appointment data for notifications
        // Use actual patient name if booking for someone else
        const actualPatientName = parsedActualPatient && !parsedActualPatient.isSelf 
            ? parsedActualPatient.name 
            : userData.name

        const appointmentNotificationData = {
            patientName: actualPatientName,
            accountHolderName: userData?.name || 'User', // Who booked the appointment
            actualPatient: parsedActualPatient, // Full patient details
            doctorName: docData.name || 'Doctor',
            speciality: docData.speciality || docData.specialization || 'General Medicine',
            date: formattedDate,
            time: slotTime,
            fee: docData.fees || 50,
            hospitalAddress: fullAddress || (docData.hospitalName || 'MediChain Hospital'),
            googleMapsLink: googleMapsUrl,
            tokenNumber: tokenNumber
        }

        // Send Email notification to patient ONLY if payment is NOT online
        // For online payments, email will be sent after payment verification
        const userEmail = userData.email
        if (userEmail && paymentMethod !== 'onlinePayment') {
            try {
                console.log(`\n📧 Sending appointment confirmation email to: ${userEmail}`)
                const emailResult = await sendAppointmentConfirmation(userEmail, appointmentNotificationData)
                
                if (emailResult.success) {
                    console.log(`✅ Appointment confirmation email sent successfully!`)
                    console.log(`   Message ID: ${emailResult.messageId}`)
                } else {
                    console.error(`❌ Failed to send appointment email:`)
                    console.error(`   Error: ${emailResult.message}`)
                }
            } catch (emailError) {
                console.error('❌ Error sending appointment confirmation email:', emailError)
                // Continue even if email fails - appointment is still booked
            }
        } else if (paymentMethod === 'onlinePayment') {
            console.log('⏳ Online payment selected - Email will be sent after payment verification')
        } else {
            console.log('⚠️  No email found for user, email notification not sent')
        }

        // Send SMS and WhatsApp notifications to patient
        const userPhone = userData.phone ? userData.phone.replace(/\D/g, '') : null
        let whatsappLink = null
        
        if (userPhone) {

            // Send SMS notification
            try {
                const { sendAppointmentSMS } = await import('../services/smsService.js')
                console.log(`\n📱 Sending appointment SMS to: ${userPhone}`)
                const smsResult = await sendAppointmentSMS(userPhone, appointmentNotificationData)
                
                if (smsResult.success) {
                    console.log(`✅ Appointment SMS sent successfully!`)
                    console.log(`   Provider: ${smsResult.provider || 'N/A'}`)
                } else {
                    console.error(`❌ Failed to send appointment SMS:`)
                    console.error(`   Error: ${smsResult.message}`)
                }
            } catch (smsError) {
                console.error('❌ Error sending appointment SMS:', smsError)
                // Continue even if SMS fails - appointment is still booked
            }

            // Send WhatsApp notification (only if phone number is valid)
            if (userPhone && userPhone !== '000000000' && userPhone.length >= 10) {
                try {
                    const { sendAppointmentWhatsApp } = await import('../services/whatsappService.js')
                    console.log(`\n📱 Generating WhatsApp link for: ${userPhone}`)
                    const whatsappResult = await sendAppointmentWhatsApp(userPhone, appointmentNotificationData)
                    
                    if (whatsappResult.success) {
                        console.log(`✅ WhatsApp link generated successfully!`)
                        console.log(`   Provider: ${whatsappResult.provider || 'N/A'}`)
                        if (whatsappResult.link) {
                            whatsappLink = whatsappResult.link
                            console.log(`   Link: ${whatsappResult.link}`)
                        }
                    } else {
                        console.error(`❌ Failed to generate WhatsApp link:`)
                        console.error(`   Error: ${whatsappResult.message}`)
                    }
                } catch (whatsappError) {
                    console.error('❌ Error generating WhatsApp link:', whatsappError)
                    // Continue even if WhatsApp fails - appointment is still booked
                }
            } else {
                console.log('⚠️  Invalid phone number - WhatsApp link not generated')
                console.log(`   Phone: ${userPhone || 'not provided'}`)
                console.log(`   Please update phone number in profile to receive WhatsApp notifications`)
            }
        } else {
            console.log('⚠️  No phone number found for user, notifications not sent')
        }

        // Fetch the saved appointment to return complete data
        const savedAppointment = await appointmentModel.findById(newAppointment._id).lean()
        
        res.json({ 
            success: true, 
            message: 'Appointment Booked Successfully! Confirmation sent to your email and registered phone number.',
            whatsappLink: whatsappLink || null,
            appointmentId: newAppointment._id.toString(),
            appointment: {
                _id: savedAppointment._id,
                costBreakdown: savedAppointment.costBreakdown || {
                    consultationFee: savedAppointment.consultationFee || savedAppointment.amount || 0,
                    platformFee: savedAppointment.platformFee || 0,
                    gst: savedAppointment.gst || 0,
                    total: savedAppointment.amount || 0
                }
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        // Get userId from req.body (POST) or from auth middleware (GET)
        const userId = req.body?.userId || req.userId || req.user?.userId
        
        if (!userId) {
            return res.json({ success: false, message: 'User ID not found' })
        }
        
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get queue status for patient appointment
const getQueueStatus = async (req, res) => {
    try {
        const { userId } = req.body
        const { appointmentId } = req.query

        const appointment = await appointmentModel.findOne({
            _id: appointmentId,
            userId: userId
        })

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // Get doctor status
        const doctor = await doctorModel.findById(appointment.docId).select('status currentAppointmentId')
        
        // Calculate current queue status
        const queueInfo = await import('../services/queueService.js')
        const queueData = await queueInfo.calculateQueuePosition(
            appointmentId,
            appointment.docId,
            appointment.slotDate
        )

        // Check if it's patient's turn
        const isNextUp = doctor?.currentAppointmentId === appointmentId || 
                        (queueData && queueData.queuePosition === 1 && doctor?.status === 'in-clinic')

        // Check for delays
        const [hour, minute] = appointment.slotTime.split(':').map(Number)
        const appointmentTime = new Date()
        appointmentTime.setHours(hour, minute, 0, 0)
        const currentTime = new Date()
        const delayMinutes = Math.round((currentTime - appointmentTime) / (1000 * 60))
        const isDelayed = delayMinutes > 15 && appointment.status !== 'in-consult'

        // Mark as delayed if needed
        if (isDelayed && !appointment.isDelayed) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                isDelayed: true,
                delayReason: 'Doctor running behind schedule'
            })
        }

        res.json({
            success: true,
            queueStatus: {
                tokenNumber: appointment.tokenNumber,
                queuePosition: queueData?.queuePosition || appointment.queuePosition,
                estimatedWaitTime: queueData?.estimatedWaitTime || appointment.estimatedWaitTime,
                doctorStatus: doctor?.status || 'in-clinic',
                appointmentStatus: appointment.status,
                isNextUp,
                isDelayed,
                delayMinutes: isDelayed ? delayMinutes : 0,
                totalInQueue: queueData?.totalInQueue || 0,
                appointmentId: appointment._id.toString()
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to mark appointment as alerted
const markAlerted = async (req, res) => {
    try {
        const { userId } = req.body
        const { appointmentId } = req.body

        const appointment = await appointmentModel.findOne({
            _id: appointmentId,
            userId: userId
        })

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { alerted: true })
        res.json({ success: true, message: 'Marked as alerted' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor live status
const getDoctorStatus = async (req, res) => {
    try {
        const { docId } = req.query

        const doctor = await doctorModel.findById(docId).select('status currentAppointmentId name')
        
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        res.json({
            success: true,
            status: doctor.status,
            isAvailable: doctor.status === 'in-clinic',
            isInConsult: doctor.status === 'in-consult',
            isOnBreak: doctor.status === 'on-break'
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            const appointmentId = orderInfo.receipt
            const updated = await appointmentModel.findByIdAndUpdate(appointmentId, { 
                payment: true,
                paymentMethod: 'Online' // Update payment method to Online when payment is successful
            }, { new: true })

            // Send appointment confirmation email AFTER payment is successful
            if (updated) {
                try {
                    const userData = await userModel.findById(updated.userId).select('name email phone')
                    if (userData && userData.email) {
                        // Format date for email
                        const slotDate = updated.slotDate || ''
                        const dateArray = slotDate.split('_')
                        const day = dateArray[0] || ''
                        const month = dateArray[1] || ''
                        const year = dateArray[2] || ''
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        const formattedDate = `${day} ${monthNames[parseInt(month) - 1] || ''} ${year}`

                        // Get doctor data
                        const docData = await doctorModel.findById(updated.docId).select('name speciality specialization fees address hospitalName')
                        
                        // Get doctor's address
                        const doctorAddress = docData?.address || {}
                        const addressLine1 = doctorAddress.line1 || ''
                        const addressLine2 = doctorAddress.line2 || ''
                        const fullAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}`.trim() || (docData?.hospitalName || '')

                        // Prepare appointment notification data
                        const actualPatient = updated.actualPatient || {}
                        const actualPatientName = actualPatient && !actualPatient.isSelf 
                            ? actualPatient.name 
                            : userData.name

                        const appointmentNotificationData = {
                            patientName: actualPatientName,
                            accountHolderName: userData.name || 'User',
                            actualPatient: actualPatient,
                            doctorName: docData?.name || 'Doctor',
                            speciality: docData?.speciality || docData?.specialization || 'General Medicine',
                            date: formattedDate,
                            time: updated.slotTime || '',
                            fee: docData?.fees || 50,
                            hospitalAddress: fullAddress || (docData?.hospitalName || 'MediChain Hospital'),
                            tokenNumber: updated.tokenNumber || ''
                        }

                        console.log(`\n📧 Sending appointment confirmation email after Razorpay payment to: ${userData.email}`)
                        const emailResult = await sendAppointmentConfirmation(userData.email, appointmentNotificationData)
                        
                        if (emailResult.success) {
                            console.log(`✅ Appointment confirmation email sent successfully after Razorpay payment!`)
                        } else {
                            console.error(`❌ Failed to send appointment email: ${emailResult.message}`)
                        }
                    }
                } catch (emailError) {
                    console.error('❌ Error sending appointment confirmation email after Razorpay payment:', emailError)
                    // Continue even if email fails - payment is still successful
                }
            }

            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            const updated = await appointmentModel.findByIdAndUpdate(appointmentId, { 
                payment: true,
                paymentMethod: 'Online' // Update payment method to Online when payment is successful
            }, { new: true })

            // Send appointment confirmation email AFTER payment is successful
            if (updated) {
                try {
                    const userData = await userModel.findById(updated.userId).select('name email phone')
                    if (userData && userData.email) {
                        // Format date for email
                        const slotDate = updated.slotDate || ''
                        const dateArray = slotDate.split('_')
                        const day = dateArray[0] || ''
                        const month = dateArray[1] || ''
                        const year = dateArray[2] || ''
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        const formattedDate = `${day} ${monthNames[parseInt(month) - 1] || ''} ${year}`

                        // Get doctor data
                        const docData = await doctorModel.findById(updated.docId).select('name speciality specialization fees address hospitalName')
                        
                        // Get doctor's address
                        const doctorAddress = docData?.address || {}
                        const addressLine1 = doctorAddress.line1 || ''
                        const addressLine2 = doctorAddress.line2 || ''
                        const fullAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}`.trim() || (docData?.hospitalName || '')

                        // Prepare appointment notification data
                        const actualPatient = updated.actualPatient || {}
                        const actualPatientName = actualPatient && !actualPatient.isSelf 
                            ? actualPatient.name 
                            : userData.name

                        const appointmentNotificationData = {
                            patientName: actualPatientName,
                            accountHolderName: userData.name || 'User',
                            actualPatient: actualPatient,
                            doctorName: docData?.name || 'Doctor',
                            speciality: docData?.speciality || docData?.specialization || 'General Medicine',
                            date: formattedDate,
                            time: updated.slotTime || '',
                            fee: docData?.fees || 50,
                            hospitalAddress: fullAddress || (docData?.hospitalName || 'MediChain Hospital'),
                            tokenNumber: updated.tokenNumber || ''
                        }

                        console.log(`\n📧 Sending appointment confirmation email after Stripe payment to: ${userData.email}`)
                        const emailResult = await sendAppointmentConfirmation(userData.email, appointmentNotificationData)
                        
                        if (emailResult.success) {
                            console.log(`✅ Appointment confirmation email sent successfully after Stripe payment!`)
                        } else {
                            console.error(`❌ Failed to send appointment email: ${emailResult.message}`)
                        }
                    }
                } catch (emailError) {
                    console.error('❌ Error sending appointment confirmation email after Stripe payment:', emailError)
                    // Continue even if email fails - payment is still successful
                }
            }

            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get emergency contacts
const getEmergencyContacts = async (req, res) => {
    try {
        const { userId } = req.body
        
        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' })
        }
        
        const user = await userModel.findById(userId).select('emergencyContacts')
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        res.json({
            success: true,
            contacts: {
                friends: user.emergencyContacts?.friends || [],
                family: user.emergencyContacts?.family || []
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to add emergency contact
const addEmergencyContact = async (req, res) => {
    try {
        const { userId } = req.body
        const { name, phone, relation, type } = req.body // type: 'friend' or 'family'

        if (!name || !phone || !type) {
            return res.json({ success: false, message: 'Missing required fields' })
        }

        if (type !== 'friend' && type !== 'family') {
            return res.json({ success: false, message: 'Type must be "friend" or "family"' })
        }

        if (type === 'family' && !relation) {
            return res.json({ success: false, message: 'Relation is required for family contacts' })
        }

        const user = await userModel.findById(userId)
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        // Initialize emergencyContacts if it doesn't exist
        if (!user.emergencyContacts) {
            user.emergencyContacts = { friends: [], family: [] }
        }

        const newContact = {
            name,
            phone,
            relation: type === 'friend' ? (relation || 'Friend') : relation
        }

        if (type === 'friend') {
            user.emergencyContacts.friends.push(newContact)
        } else {
            user.emergencyContacts.family.push(newContact)
        }

        await user.save()

        res.json({
            success: true,
            message: 'Contact added successfully',
            contact: newContact
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update emergency contact
const updateEmergencyContact = async (req, res) => {
    try {
        const { userId } = req.body
        const { contactId, name, phone, relation, type } = req.body

        if (!contactId || !type) {
            return res.json({ success: false, message: 'Missing required fields' })
        }

        const user = await userModel.findById(userId)
        
        if (!user || !user.emergencyContacts) {
            return res.json({ success: false, message: 'User or contacts not found' })
        }

        const contacts = type === 'friend' ? user.emergencyContacts.friends : user.emergencyContacts.family
        const contactIndex = contacts.findIndex(c => c._id.toString() === contactId)

        if (contactIndex === -1) {
            return res.json({ success: false, message: 'Contact not found' })
        }

        if (name) contacts[contactIndex].name = name
        if (phone) contacts[contactIndex].phone = phone
        if (relation) contacts[contactIndex].relation = relation

        await user.save()

        res.json({
            success: true,
            message: 'Contact updated successfully',
            contact: contacts[contactIndex]
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete emergency contact
const deleteEmergencyContact = async (req, res) => {
    try {
        const { userId } = req.body
        const { contactId, type } = req.body

        if (!contactId || !type) {
            return res.json({ success: false, message: 'Missing required fields' })
        }

        const user = await userModel.findById(userId)
        
        if (!user || !user.emergencyContacts) {
            return res.json({ success: false, message: 'User or contacts not found' })
        }

        const contacts = type === 'friend' ? user.emergencyContacts.friends : user.emergencyContacts.family
        const contactIndex = contacts.findIndex(c => c._id.toString() === contactId)

        if (contactIndex === -1) {
            return res.json({ success: false, message: 'Contact not found' })
        }

        contacts.splice(contactIndex, 1)
        await user.save()

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to send OTP for password reset
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please provide a valid email' });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'No account found with this email' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before storing
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        // Set OTP expiry to 10 minutes from now
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP and expiry to database
        await userModel.findByIdAndUpdate(user._id, {
            resetPasswordOTP: hashedOTP,
            resetPasswordOTPExpiry: otpExpiry
        });

        // Send OTP via email
        const emailResult = await sendPasswordResetOTP(email, otp, user.name);

        if (emailResult.success) {
            console.log(`✅ Password reset OTP sent to ${email}`);
            res.json({ 
                success: true, 
                message: 'OTP sent successfully to your email. Please check your inbox.' 
            });
        } else {
            // If email fails, remove OTP from database
            await userModel.findByIdAndUpdate(user._id, {
                $unset: { resetPasswordOTP: 1, resetPasswordOTPExpiry: 1 }
            });
            res.json({ 
                success: false, 
                message: 'Failed to send OTP. Please try again later.' 
            });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to verify OTP and reset password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate inputs
        if (!email || !otp || !newPassword) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please provide a valid email' });
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters long' });
        }

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'No account found with this email' });
        }

        // Check if OTP exists and is not expired
        if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
            return res.json({ success: false, message: 'No OTP found. Please request a new one.' });
        }

        if (new Date() > user.resetPasswordOTPExpiry) {
            // Clear expired OTP
            await userModel.findByIdAndUpdate(user._id, {
                $unset: { resetPasswordOTP: 1, resetPasswordOTPExpiry: 1 }
            });
            return res.json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        const isOTPValid = await bcrypt.compare(otp, user.resetPasswordOTP);
        if (!isOTPValid) {
            return res.json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP fields
        await userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            $unset: { resetPasswordOTP: 1, resetPasswordOTPExpiry: 1 }
        });

        // Send confirmation email
        await sendPasswordResetConfirmation(email, user.name);

        console.log(`✅ Password reset successful for ${email}`);
        res.json({ 
            success: true, 
            message: 'Password reset successful. You can now login with your new password.' 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to initialize PayU payment
// 
// PayU Test Credentials (Hardcoded):
// ===================================
// Test Key: TrOeqi
// Test Salt Value: oUwlPbUgo653mTYzLfv2flsuCRdYqfkv
// Test Environment Variable: env_pro = 0
//
// Test Scenarios:
// ===============
// 1. Net Banking Mode:
//    - Bank Name: testbank
//    - Username: payu
//    - Password: payu
//
// 2. UPI Mode:
//    - Use the Direct Scanner option for testing
//    - Merchant UPI ID: 824771300@ybl (hardcoded in getMerchantUPI)
//
// Note: During testing, ensure the transaction ID is changed manually each time
// in the transaction variable declaration path.
//
const initPayUPayment = async (req, res) => {
    try {
        const { appointmentId, amount, productinfo, firstname, email, phone, pg, bankcode } = req.body
        const { userId } = req.body

        if (!appointmentId || !amount) {
            return res.json({ success: false, message: 'Appointment ID and amount are required' })
        }

        // Verify appointment belongs to user
        // Handle both MongoDB ObjectId and custom ID format
        let appointment = null
        if (mongoose.Types.ObjectId.isValid(appointmentId)) {
            appointment = await appointmentModel.findById(appointmentId)
        } else {
            // If not a valid ObjectId, try to find by custom ID or return error
            return res.json({ success: false, message: 'Invalid appointment ID format. Please try again.' })
        }
        
        if (!appointment || appointment.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized or appointment not found' })
        }

        // PayU Test Credentials - Hardcoded
        // Test Key: TrOeqi
        // Test Salt: oUwlPbUgo653mTYzLfv2flsuCRdYqfkv
        // Test Environment: 0 (test.payu.in)
        const PAYU_KEY = 'TrOeqi'
        const PAYU_SALT = 'oUwlPbUgo653mTYzLfv2flsuCRdYqfkv'
        const PAYU_ENV = '0'

        // Generate transaction ID
        const txnid = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`

        // Build hash string for PayU
        // Correct format: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
        const udf1 = appointmentId || ''
        const udf2 = 'appointment_booking'
        const udf3 = ''
        const udf4 = ''
        const udf5 = ''
        
        // Build hash string exactly as PayU requires
        const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo || 'Appointment Payment'}|${firstname || 'Patient'}|${email || 'test@example.com'}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${PAYU_SALT}`
        
        // Generate hash (using crypto)
        const hash = crypto.createHash('sha512').update(hashString).digest('hex')

        // Determine PayU URL based on environment
        const payuUrl = PAYU_ENV === '0' ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment'

        // Build payment data object
        const paymentData = {
            key: PAYU_KEY,
            txnid: txnid,
            amount: amount,
            productinfo: productinfo || 'Appointment Payment',
            firstname: firstname || 'Patient',
            email: email || 'test@example.com',
            phone: phone || '9999999999',
            surl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment?status=success&txnid=${txnid}&appointmentId=${appointmentId}`,
            furl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment?status=failed&txnid=${txnid}&appointmentId=${appointmentId}`,
            service_provider: 'payu_paisa',
            hash: hash,
            udf1: appointmentId,
            udf2: 'appointment_booking',
            payuUrl: payuUrl
        }

        // Add payment gateway mode if specified
        if (pg) {
            paymentData.pg = pg
        }

        // Add bank code for net banking if specified
        if (pg === 'NB' && bankcode) {
            paymentData.bankcode = bankcode
        }

        res.json({
            success: true,
            paymentData: paymentData
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify PayU payment
const verifyPayUPayment = async (req, res) => {
    try {
        const { appointmentId, txnid, status } = req.body

        console.log('PayU Payment Verification Request:', { appointmentId, txnid, status })

        if (!appointmentId) {
            console.error('Payment verification failed: Appointment ID is required')
            return res.json({ success: false, message: 'Appointment ID is required' })
        }

        // Check if appointment exists first
        const existingAppointment = await appointmentModel.findById(appointmentId)
        if (!existingAppointment) {
            console.error('Payment verification failed: Appointment not found', appointmentId)
            return res.json({ success: false, message: 'Appointment not found' })
        }

        console.log('Existing appointment before update:', {
            _id: existingAppointment._id,
            payment: existingAppointment.payment,
            paymentMethod: existingAppointment.paymentMethod
        })

        // Check if payment status is success
        if (status === 'success' || status === 'SUCCESS') {
            // Update appointment payment status
            const updated = await appointmentModel.findByIdAndUpdate(
                appointmentId, 
                { 
                    payment: true,
                    paymentMethod: 'Online' // Update payment method to Online when payment is successful
                }, 
                { new: true, runValidators: true }
            )
            
            if (!updated) {
                console.error('Payment verification failed: Appointment update returned null')
                return res.json({ success: false, message: 'Failed to update appointment' })
            }

            console.log('Payment verification - Appointment updated successfully:', {
                appointmentId: updated._id,
                payment: updated.payment,
                paymentMethod: updated.paymentMethod,
                userId: updated.userId
            })

            // Send appointment confirmation email AFTER payment is successful
            try {
                const userData = await userModel.findById(updated.userId).select('name email phone')
                if (userData && userData.email) {
                    // Format date for email
                    const slotDate = updated.slotDate || ''
                    const dateArray = slotDate.split('_')
                    const day = dateArray[0] || ''
                    const month = dateArray[1] || ''
                    const year = dateArray[2] || ''
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                    const formattedDate = `${day} ${monthNames[parseInt(month) - 1] || ''} ${year}`

                    // Get doctor data
                    const docData = await doctorModel.findById(updated.docId).select('name speciality specialization fees address hospitalName')
                    
                    // Get doctor's address
                    const doctorAddress = docData?.address || {}
                    const addressLine1 = doctorAddress.line1 || ''
                    const addressLine2 = doctorAddress.line2 || ''
                    const fullAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}`.trim() || (docData?.hospitalName || '')

                    // Prepare appointment notification data
                    const actualPatient = updated.actualPatient || {}
                    const actualPatientName = actualPatient && !actualPatient.isSelf 
                        ? actualPatient.name 
                        : userData.name

                    const appointmentNotificationData = {
                        patientName: actualPatientName,
                        accountHolderName: userData.name || 'User',
                        actualPatient: actualPatient,
                        doctorName: docData?.name || 'Doctor',
                        speciality: docData?.speciality || docData?.specialization || 'General Medicine',
                        date: formattedDate,
                        time: updated.slotTime || '',
                        fee: docData?.fees || 50,
                        hospitalAddress: fullAddress || (docData?.hospitalName || 'MediChain Hospital'),
                        tokenNumber: updated.tokenNumber || ''
                    }

                    console.log(`\n📧 Sending appointment confirmation email after payment to: ${userData.email}`)
                    const emailResult = await sendAppointmentConfirmation(userData.email, appointmentNotificationData)
                    
                    if (emailResult.success) {
                        console.log(`✅ Appointment confirmation email sent successfully after payment!`)
                    } else {
                        console.error(`❌ Failed to send appointment email: ${emailResult.message}`)
                    }
                }
            } catch (emailError) {
                console.error('❌ Error sending appointment confirmation email after payment:', emailError)
                // Continue even if email fails - payment is still successful
            }
            
            return res.json({ success: true, message: 'Payment Successful', appointment: {
                _id: updated._id,
                payment: updated.payment,
                paymentMethod: updated.paymentMethod
            }})
        }

        console.log('Payment verification failed: Invalid status', status)
        res.json({ success: false, message: 'Payment verification failed - invalid status' })
    } catch (error) {
        console.error('Payment verification error:', error)
        res.json({ success: false, message: error.message || 'Payment verification error' })
    }
}

// API to get merchant UPI ID
// 
// Merchant UPI ID for PayU Testing:
// ==================================
// UPI ID: 824771300@ybl
// 
// Note: This is the test merchant UPI ID for PayU testing.
// For UPI mode testing, use the Direct Scanner option.
//
const getMerchantUPI = async (req, res) => {
    try {
        // Merchant UPI ID - Hardcoded for PayU testing
        // Use this UPI ID with Direct Scanner option for UPI mode testing
        const merchantUPI = '9676599738@axl'

        console.log('Merchant UPI ID requested. Using hardcoded value:', merchantUPI)

        // Validate UPI ID format
        const upiPattern = /^[a-z0-9._-]+@[a-z0-9]+$/i
        if (!upiPattern.test(merchantUPI)) {
            console.error('Invalid UPI ID format in ENV:', merchantUPI)
            return res.json({ success: false, message: 'Invalid UPI ID format in configuration' })
        }

        console.log('Merchant UPI ID returned:', merchantUPI)

        res.json({
            success: true,
            merchantUPI: merchantUPI.trim()
        })
    } catch (error) {
        console.log('Error in getMerchantUPI:', error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
    getQueueStatus,
    getDoctorStatus,
    markAlerted,
    getEmergencyContacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    forgotPassword,
    resetPassword,
    sendContactMessage,
    getSavedProfiles,
    saveProfile,
    verifyAppointment,
    initPayUPayment,
    verifyPayUPayment,
    getMerchantUPI
}