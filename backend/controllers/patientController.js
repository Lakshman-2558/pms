import appointmentModel from '../models/appointmentModel.js';
import healthRecordModel from '../models/healthRecordModel.js';
import userModel from '../models/userModel.js';

// Get patient complete history (appointments + medical records)
export const getPatientHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.json({
                success: false,
                message: 'Patient ID is required'
            });
        }

        // Get patient user data
        const patient = await userModel.findById(userId);
        if (!patient) {
            return res.json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Get all appointments for this patient
        const appointments = await appointmentModel
            .find({ userId })
            .sort({ date: -1 }) // Most recent first
            .lean();

        // Get all health records for this patient
        const healthRecords = await healthRecordModel
            .find({ userId })
            .sort({ date: -1 }) // Most recent first
            .lean();

        // Format patient data
        const patientData = {
            _id: patient._id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            dob: patient.dob,
            gender: patient.gender,
            image: patient.image
        };

        // Format appointments with additional info
        const formattedAppointments = appointments.map(apt => ({
            _id: apt._id,
            date: apt.date,
            slotDate: apt.slotDate,
            slotTime: apt.slotTime,
            doctor: apt.docData?.name || 'Unknown',
            doctorId: apt.docId,
            doctorSpeciality: apt.docData?.speciality || '',
            doctorImage: apt.docData?.image || '',
            status: apt.cancelled 
                ? 'Cancelled' 
                : apt.isCompleted 
                    ? 'Completed' 
                    : 'Active',
            fees: apt.amount,
            mode: apt.mode || 'In-person', // Assuming mode field exists or default
            symptoms: apt.selectedSymptoms || apt.actualPatient?.symptoms || [],
            actualPatient: apt.actualPatient,
            tokenNumber: apt.tokenNumber,
            statusDetail: apt.status,
            payment: apt.payment || false,
            cancelled: apt.cancelled || false,
            isCompleted: apt.isCompleted || false
        }));

        // Format health records
        const formattedRecords = healthRecords.map(record => ({
            _id: record._id,
            appointmentId: record.appointmentId,
            recordType: record.recordType,
            title: record.title,
            description: record.description,
            doctorName: record.doctorName,
            date: record.date,
            files: record.files || [],
            tags: record.tags || [],
            isImportant: record.isImportant
        }));

        res.json({
            success: true,
            data: {
                patient: patientData,
                appointments: formattedAppointments,
                healthRecords: formattedRecords,
                totalAppointments: formattedAppointments.length,
                totalRecords: formattedRecords.length
            }
        });

    } catch (error) {
        console.error('Error fetching patient history:', error);
        res.json({
            success: false,
            message: error.message || 'Failed to fetch patient history'
        });
    }
};

// Get patient by appointment ID (helper for admin panel)
export const getPatientByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        if (!appointmentId) {
            return res.json({
                success: false,
                message: 'Appointment ID is required'
            });
        }

        // Get appointment
        const appointment = await appointmentModel.findById(appointmentId).lean();
        if (!appointment) {
            return res.json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Get patient data
        const patient = await userModel.findById(appointment.userId).lean();
        if (!patient) {
            return res.json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Get all appointments for this patient
        const allAppointments = await appointmentModel
            .find({ userId: appointment.userId })
            .sort({ date: -1 })
            .lean();

        // Get health records for this patient
        const healthRecords = await healthRecordModel
            .find({ userId: appointment.userId })
            .sort({ date: -1 })
            .lean();

        // Format response
        const patientData = {
            _id: patient._id,
            name: appointment.actualPatient && !appointment.actualPatient.isSelf
                ? appointment.actualPatient.name
                : patient.name,
            email: patient.email,
            phone: appointment.actualPatient && !appointment.actualPatient.isSelf
                ? appointment.actualPatient.phone || patient.phone
                : patient.phone,
            dob: patient.dob,
            gender: appointment.actualPatient && !appointment.actualPatient.isSelf
                ? appointment.actualPatient.gender || patient.gender
                : patient.gender,
            age: appointment.actualPatient && !appointment.actualPatient.isSelf
                ? appointment.actualPatient.age
                : null,
            relationship: appointment.actualPatient && !appointment.actualPatient.isSelf
                ? appointment.actualPatient.relationship
                : 'Self',
            image: patient.image
        };

        const formattedAppointments = allAppointments.map(apt => ({
            _id: apt._id,
            date: apt.date,
            slotDate: apt.slotDate,
            slotTime: apt.slotTime,
            doctor: apt.docData?.name || 'Unknown',
            doctorSpeciality: apt.docData?.speciality || '',
            status: apt.cancelled ? 'Cancelled' : apt.isCompleted ? 'Completed' : 'Active',
            fees: apt.amount,
            mode: apt.mode || 'In-person',
            symptoms: apt.selectedSymptoms || apt.actualPatient?.symptoms || [],
            tokenNumber: apt.tokenNumber,
            payment: apt.payment || false,
            cancelled: apt.cancelled || false,
            isCompleted: apt.isCompleted || false
        }));

        const formattedRecords = healthRecords.map(record => ({
            _id: record._id,
            appointmentId: record.appointmentId,
            recordType: record.recordType,
            title: record.title,
            description: record.description,
            doctorName: record.doctorName,
            date: record.date,
            files: record.files || [],
            tags: record.tags || [],
            isImportant: record.isImportant
        }));

        res.json({
            success: true,
            data: {
                patient: patientData,
                appointments: formattedAppointments,
                healthRecords: formattedRecords,
                currentAppointment: appointment
            }
        });

    } catch (error) {
        console.error('Error fetching patient by appointment:', error);
        res.json({
            success: false,
            message: error.message || 'Failed to fetch patient data'
        });
    }
};

