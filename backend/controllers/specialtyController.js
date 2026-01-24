import specialtyModel from '../models/specialtyModel.js';
import doctorModel from '../models/doctorModel.js';

// Get all specialties with helpline numbers
export const getAllSpecialties = async (req, res) => {
    try {
        const specialties = await specialtyModel.find().sort({ specialtyName: 1 });
        res.json({ success: true, data: specialties });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get single specialty by name
export const getSpecialtyByName = async (req, res) => {
    try {
        const { specialtyName } = req.params;
        const specialty = await specialtyModel.findOne({ 
            specialtyName: { $regex: new RegExp(specialtyName, 'i') } 
        });
        
        if (!specialty) {
            return res.json({ success: false, message: 'Specialty not found' });
        }
        
        res.json({ success: true, data: specialty });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create new specialty with helpline
export const createSpecialty = async (req, res) => {
    try {
        const { specialtyName, helplineNumber, availability, status } = req.body;
        
        // Validate phone number format (basic validation)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(helplineNumber)) {
            return res.json({ success: false, message: 'Invalid phone number format' });
        }
        
        // Check if specialty already exists
        const existing = await specialtyModel.findOne({ 
            specialtyName: { $regex: new RegExp(`^${specialtyName}$`, 'i') } 
        });
        
        if (existing) {
            return res.json({ success: false, message: 'Specialty already exists' });
        }
        
        const specialty = new specialtyModel({
            specialtyName,
            helplineNumber,
            availability: availability || '24x7',
            status: status || 'Active',
            updatedBy: req.adminId || null
        });
        
        await specialty.save();
        res.json({ success: true, message: 'Specialty helpline created successfully', data: specialty });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update specialty helpline
export const updateSpecialty = async (req, res) => {
    try {
        const { id } = req.params;
        const { helplineNumber, availability, status } = req.body;
        
        // Validate phone number if provided
        if (helplineNumber) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(helplineNumber)) {
                return res.json({ success: false, message: 'Invalid phone number format' });
            }
        }
        
        const updateData = {
            lastUpdated: new Date(),
            updatedBy: req.adminId || null
        };
        
        if (helplineNumber) updateData.helplineNumber = helplineNumber;
        if (availability) updateData.availability = availability;
        if (status) updateData.status = status;
        
        const specialty = await specialtyModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!specialty) {
            return res.json({ success: false, message: 'Specialty not found' });
        }
        
        res.json({ success: true, message: 'Specialty helpline updated successfully', data: specialty });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete specialty
export const deleteSpecialty = async (req, res) => {
    try {
        const { id } = req.params;
        
        const specialty = await specialtyModel.findByIdAndDelete(id);
        
        if (!specialty) {
            return res.json({ success: false, message: 'Specialty not found' });
        }
        
        res.json({ success: true, message: 'Specialty helpline deleted successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get helpline for appointment (by doctor specialty)
export const getHelplineForAppointment = async (req, res) => {
    try {
        const { docId } = req.params;
        
        // Get doctor's specialty
        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }
        
        // Find specialty helpline
        const specialty = await specialtyModel.findOne({ 
            specialtyName: { $regex: new RegExp(doctor.speciality, 'i') },
            status: 'Active'
        });
        
        if (!specialty) {
            return res.json({ success: false, message: 'Helpline not available for this specialty' });
        }
        
        res.json({ success: true, data: specialty });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

