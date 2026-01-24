import express from 'express';
import {
    getHospitals,
    addHospital,
    updateHospital,
    deleteHospital,
    getPublicHospitals,
    getAllPublicHospitalsWithDoctors,
    getHospitalDetails,
    getAllHospitalDoctors,
    addDoctorToHospital,
    updateDoctorInHospital,
    deleteDoctorFromHospital,
    bulkAddHospitalDoctorsPreview,
    bulkAddHospitalDoctors,
    migrateEmbeddedDoctors
} from '../controllers/hospitalTieUpController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const hospitalTieUpRouter = express.Router();

// Public routes
hospitalTieUpRouter.get('/public', getPublicHospitals);
hospitalTieUpRouter.get('/public/all', getAllPublicHospitalsWithDoctors); // Get all hospitals with doctors for frontend
hospitalTieUpRouter.get('/public/doctors', getAllHospitalDoctors);
hospitalTieUpRouter.get('/details/:id', getHospitalDetails);

// Admin routes (Protected)
hospitalTieUpRouter.get('/all', authAdmin, getHospitals);
hospitalTieUpRouter.post('/add', authAdmin, addHospital);
hospitalTieUpRouter.put('/update', authAdmin, updateHospital);
hospitalTieUpRouter.post('/delete', authAdmin, deleteHospital);

// Doctor Management Routes (Protected)
hospitalTieUpRouter.post('/doctor/add', authAdmin, addDoctorToHospital);
hospitalTieUpRouter.put('/doctor/update', authAdmin, updateDoctorInHospital);
hospitalTieUpRouter.post('/doctor/delete', authAdmin, deleteDoctorFromHospital);

// Bulk Upload Doctor Routes (Protected)
hospitalTieUpRouter.post('/doctor/bulk-preview', authAdmin, upload.single('file'), bulkAddHospitalDoctorsPreview);
hospitalTieUpRouter.post('/doctor/bulk-add', authAdmin, bulkAddHospitalDoctors);

// Migration Route (Protected)
hospitalTieUpRouter.post('/doctor/migrate', authAdmin, migrateEmbeddedDoctors);

export default hospitalTieUpRouter;
