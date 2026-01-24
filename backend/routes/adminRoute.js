import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard, deleteAllAppointments, updateDoctor, bulkAddDoctorsPreview, bulkAddDoctors } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import { sendEmailToPatient } from '../controllers/emailController.js';
import { getPatientHistory, getPatientByAppointment } from '../controllers/patientController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.post("/bulk-add-doctors-preview", authAdmin, upload.single('file'), bulkAddDoctorsPreview)
adminRouter.post("/bulk-add-doctors", authAdmin, bulkAddDoctors)
adminRouter.post("/update-doctor", authAdmin, upload.single('image'), updateDoctor)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.delete("/delete-all-appointments", authAdmin, deleteAllAppointments)
adminRouter.post("/send-email", authAdmin, sendEmailToPatient)
adminRouter.get("/patient-history/:userId", authAdmin, getPatientHistory)
adminRouter.get("/patient-by-appointment/:appointmentId", authAdmin, getPatientByAppointment)

export default adminRouter;