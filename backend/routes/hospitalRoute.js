import express from 'express';
import { 
    hospitalList,
    getDoctorsByHospital
} from '../controllers/hospitalController.js';

const hospitalRouter = express.Router();

// Public routes
hospitalRouter.get('/list', hospitalList);
hospitalRouter.get('/:hospitalId/doctors', getDoctorsByHospital);

export default hospitalRouter;
