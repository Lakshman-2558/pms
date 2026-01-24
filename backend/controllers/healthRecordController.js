import healthRecordModel from '../models/healthRecordModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Create health record (patient uploads before appointment)
export const createHealthRecord = async (req, res) => {
    try {
        // Get userId from req.body (set by authUser middleware or from FormData)
        const userId = req.body.userId;
        const {
            recordType,
            title,
            description,
            doctorName,
            docId,
            appointmentId,
            date,
            tags,
            isImportant
        } = req.body;

        if (!userId) {
            return res.json({ success: false, message: 'User ID is required. Please login again.' });
        }

        if (!recordType || !title || !date || !docId) {
            return res.json({ success: false, message: 'Missing required fields (recordType, title, date, docId)' });
        }

        // Parse tags
        const tagsArray = tags ? JSON.parse(tags) : [];

        // Upload files to Cloudinary
        const uploadedFiles = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    // Upload to Cloudinary
                    const uploadResult = await cloudinary.uploader.upload(file.path, {
                        resource_type: 'auto',
                        folder: `health-records/${userId}`,
                        use_filename: true,
                        unique_filename: false
                    });

                    uploadedFiles.push({
                        url: uploadResult.secure_url,
                        fileName: file.originalname,
                        fileType: file.mimetype.split('/')[1] || 'unknown',
                        fileSize: file.size,
                        cloudinaryPublicId: uploadResult.public_id
                    });

                    // Delete temp file
                    fs.unlinkSync(file.path);
                } catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    // Continue with other files even if one fails
                }
            }
        }

        const newRecord = new healthRecordModel({
            userId,
            appointmentId: appointmentId || null,
            docId,
            recordType,
            title,
            description: description || '',
            doctorName: doctorName || '',
            date: new Date(date),
            files: uploadedFiles,
            tags: tagsArray,
            isImportant: isImportant === 'true' || isImportant === true,
            uploadedBeforeAppointment: !!appointmentId
        });

        await newRecord.save();

        res.json({
            success: true,
            message: 'Health record uploaded successfully',
            record: newRecord
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all health records for patient
export const getHealthRecords = async (req, res) => {
    try {
        const { userId } = req.body;
        const {
            recordType,
            docId,
            appointmentId,
            startDate,
            endDate,
            search
        } = req.query;

        // Build query
        const query = { userId };

        if (recordType) {
            query.recordType = recordType;
        }

        if (docId) {
            query.docId = docId;
        }

        if (appointmentId) {
            query.appointmentId = appointmentId;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { doctorName: { $regex: search, $options: 'i' } }
            ];
        }

        const records = await healthRecordModel
            .find(query)
            .sort({ date: -1 });

        res.json({
            success: true,
            records
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single health record
export const getHealthRecord = async (req, res) => {
    try {
        const { userId } = req.body;
        const { recordId } = req.params;

        const record = await healthRecordModel.findOne({
            _id: recordId,
            userId
        });

        if (!record) {
            return res.json({ success: false, message: 'Record not found' });
        }

        res.json({ success: true, record });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete health record
export const deleteHealthRecord = async (req, res) => {
    try {
        const { userId } = req.body;
        const { recordId } = req.params;

        const record = await healthRecordModel.findOne({
            _id: recordId,
            userId
        });

        if (!record) {
            return res.json({ success: false, message: 'Record not found' });
        }

        // Delete files from Cloudinary
        for (const file of record.files) {
            if (file.cloudinaryPublicId) {
                try {
                    await cloudinary.uploader.destroy(file.cloudinaryPublicId);
                } catch (cloudinaryError) {
                    console.error('Cloudinary delete error:', cloudinaryError);
                }
            }
        }

        await healthRecordModel.findByIdAndDelete(recordId);

        res.json({ success: true, message: 'Record deleted successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get patient records for doctor (by appointment)
export const getPatientRecordsForDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const { appointmentId } = req.params;

        if (!appointmentId) {
            return res.json({ success: false, message: 'Appointment ID required' });
        }

        // Get appointment to find userId
        const appointmentModel = (await import('../models/appointmentModel.js')).default;
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Get ALL records for this patient and doctor, regardless of appointmentId
        // This includes records uploaded before booking (appointmentId: null) 
        // and records linked to this specific appointment
        const records = await healthRecordModel.find({
            userId: appointment.userId,
            docId: docId
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            records
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Mark record as viewed by doctor
export const markRecordAsViewed = async (req, res) => {
    try {
        const { docId } = req.body;
        const { recordId } = req.params;

        const record = await healthRecordModel.findOne({
            _id: recordId,
            docId
        });

        if (!record) {
            return res.json({ success: false, message: 'Record not found' });
        }

        record.viewedByDoctor = true;
        record.viewedAt = new Date();
        await record.save();

        res.json({ success: true, message: 'Record marked as viewed' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

