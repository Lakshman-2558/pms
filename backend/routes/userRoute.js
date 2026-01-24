import express from 'express';
import { loginUser, registerUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, paymentStripe, verifyStripe, getQueueStatus, getDoctorStatus, markAlerted, getEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact, forgotPassword, resetPassword, sendContactMessage, getSavedProfiles, saveProfile, verifyAppointment, initPayUPayment, verifyPayUPayment, getMerchantUPI } from '../controllers/userController.js';
import { sendEmergencyAlert } from '../controllers/emergencyController.js';
import { createHealthRecord, getHealthRecords, getHealthRecord, deleteHealthRecord } from '../controllers/healthRecordController.js';
import { createConsultation, getUserConsultations, getConsultation } from '../controllers/consultationController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';
const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)

// Password Reset Routes
userRouter.post("/forgot-password", forgotPassword)
userRouter.post("/reset-password", resetPassword)

// Public appointment verification (for QR code scanning)
userRouter.get("/appointment/verify/:id", verifyAppointment)

// Public contact form
userRouter.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Name, email and message are required." });
        }

        const result = await sendContactMessage({ name, email, message });

        if (!result.success) {
            return res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
        }

        res.json({ success: true, message: "Message sent successfully." });
    } catch (error) {
        console.error("Error in /contact route:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
})

userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.get("/saved-profiles", authUser, getSavedProfiles)
userRouter.post("/save-profile", authUser, saveProfile)
userRouter.post("/book-appointment", upload.single('prescription'), authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.post("/payment-stripe", authUser, paymentStripe)
userRouter.post("/verifyStripe", authUser, verifyStripe)
userRouter.post("/payment-payu/init", authUser, initPayUPayment)
userRouter.post("/payment-payu/verify", authUser, verifyPayUPayment)
userRouter.get("/payment/merchant-upi", authUser, getMerchantUPI)

// Queue Management Routes for Patients
userRouter.get("/queue-status", authUser, getQueueStatus)
userRouter.get("/doctor-status", getDoctorStatus)
userRouter.post("/mark-alerted", authUser, markAlerted)

// Emergency SMS Route
userRouter.post("/emergency-sms", authUser, sendEmergencyAlert)

// Emergency Contacts Routes
userRouter.get("/emergency-contacts", authUser, getEmergencyContacts)
userRouter.post("/emergency-contacts/add", authUser, addEmergencyContact)
userRouter.post("/emergency-contacts/update", authUser, updateEmergencyContact)
userRouter.post("/emergency-contacts/delete", authUser, deleteEmergencyContact)

// Health Records Routes
userRouter.post("/health-records", authUser, upload.array('files', 10), createHealthRecord)
userRouter.get("/health-records", authUser, getHealthRecords)
userRouter.get("/health-records/:recordId", authUser, getHealthRecord)
userRouter.delete("/health-records/:recordId", authUser, deleteHealthRecord)

// Video Consultation Routes
userRouter.post("/consultation/create", authUser, createConsultation)
userRouter.get("/consultations", authUser, getUserConsultations)
userRouter.get("/consultation/:consultationId", authUser, getConsultation)

export default userRouter;