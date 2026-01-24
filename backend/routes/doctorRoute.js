import express from 'express';
import { 
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
} from '../controllers/doctorController.js';
import { getPatientRecordsForDoctor, markRecordAsViewed } from '../controllers/healthRecordController.js';
import { 
    getVideoConsultDoctors, 
    getDoctorConsultations, 
    startConsultation as startVideoConsultation,
    endConsultation 
} from '../controllers/consultationController.js';
import authDoctor from '../middleware/authDoctor.js';
import upload from '../middleware/multer.js';
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor)
doctorRouter.post("/forgot-password", forgotPassword)
doctorRouter.post("/reset-password", resetPassword)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.get("/list", doctorList)
// Removed: age-symptoms endpoint (no longer needed - symptoms now based on specialization)
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.get("/profile", authDoctor, doctorProfile)
doctorRouter.post("/update-profile", authDoctor, upload.single('image'), updateDoctorProfile)

// Queue Management Routes
doctorRouter.get("/queue-status", authDoctor, getQueueStatus)
doctorRouter.post("/update-status", authDoctor, updateDoctorStatus)
doctorRouter.post("/start-consultation", authDoctor, startConsultation)
doctorRouter.post("/complete-consultation", authDoctor, completeConsultation)
doctorRouter.post("/move-appointment", authDoctor, moveAppointmentInQueue)
doctorRouter.get("/smart-suggestions", authDoctor, getSmartSuggestions)

// Patient Health Records Routes
doctorRouter.get("/patient-records/:appointmentId", authDoctor, getPatientRecordsForDoctor)
doctorRouter.post("/patient-records/:recordId/viewed", authDoctor, markRecordAsViewed)

// Video Consultation Routes
doctorRouter.get("/video-consult", getVideoConsultDoctors)
doctorRouter.get("/consultations", authDoctor, getDoctorConsultations)
doctorRouter.post("/consultation/start", authDoctor, startVideoConsultation)
doctorRouter.post("/consultation/end", authDoctor, endConsultation)

export default doctorRouter;