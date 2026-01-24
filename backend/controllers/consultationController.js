import consultationModel from '../models/consultationModel.js';
import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
};

// Generate Google Meet link (simplified - in production, use Google Meet API)
const generateMeetingLink = () => {
    const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/${meetingId}`;
};

// Get doctors available for video consultation
export const getVideoConsultDoctors = async (req, res) => {
    try {
        const { lat, lng, distance } = req.query; // distance: '5km', '10km', 'all'

        // Build query
        let query = {
            videoConsult: true,
            available: true,
            $or: [
                { status: 'online' },
                { status: 'in-clinic' }
            ]
        };

        // Find doctors
        let doctors = await doctorModel.find(query).select('-password');

        // Filter by distance if location provided
        if (lat && lng && distance !== 'all') {
            const maxDistance = parseInt(distance.replace('km', ''));
            doctors = doctors.filter(doctor => {
                if (!doctor.location || !doctor.location.lat || !doctor.location.lng) {
                    return false; // Skip doctors without location
                }
                const dist = calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    doctor.location.lat,
                    doctor.location.lng
                );
                return dist <= maxDistance;
            });

            // Add distance to each doctor
            doctors = doctors.map(doctor => ({
                ...doctor.toObject(),
                distance: calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    doctor.location.lat,
                    doctor.location.lng
                )
            }));

            // Sort by distance
            doctors.sort((a, b) => a.distance - b.distance);
        }

        res.json({ 
            success: true, 
            doctors: doctors.map(doc => ({
                _id: doc._id,
                name: doc.name,
                image: doc.image,
                speciality: doc.speciality,
                degree: doc.degree,
                experience: doc.experience,
                fees: doc.fees,
                hospital: doc.hospital || '',
                status: doc.status,
                location: doc.location,
                distance: doc.distance || null
            }))
        });
    } catch (error) {
        console.error('Error fetching video consult doctors:', error);
        res.json({ success: false, message: error.message });
    }
};

// Create video consultation
export const createConsultation = async (req, res) => {
    try {
        const { doctorId, type = 'video' } = req.body;
        const userId = req.body.userId; // From authUser middleware

        // Verify doctor exists and is available for video consult
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        if (!doctor.videoConsult) {
            return res.json({ success: false, message: 'Doctor does not offer video consultation' });
        }

        if (doctor.status !== 'online' && doctor.status !== 'in-clinic') {
            return res.json({ success: false, message: 'Doctor is not available at the moment' });
        }

        // Generate meeting link
        const meetingLink = generateMeetingLink();
        const meetingId = meetingLink.split('/').pop();

        // Create consultation
        const consultation = new consultationModel({
            patientId: userId,
            doctorId: doctorId,
            type: type,
            status: 'scheduled',
            meetingLink: meetingLink,
            meetingId: meetingId,
            meetingProvider: 'google-meet',
            scheduledAt: new Date()
        });

        await consultation.save();

        // Update doctor status
        await doctorModel.findByIdAndUpdate(doctorId, {
            status: 'in-consult',
            currentAppointmentId: consultation._id.toString()
        });

        res.json({
            success: true,
            consultationId: consultation._id,
            meetingLink: meetingLink,
            message: 'Consultation created successfully'
        });
    } catch (error) {
        console.error('Error creating consultation:', error);
        res.json({ success: false, message: error.message });
    }
};

// Start consultation
export const startConsultation = async (req, res) => {
    try {
        const { consultationId } = req.body;

        const consultation = await consultationModel.findById(consultationId);
        if (!consultation) {
            return res.json({ success: false, message: 'Consultation not found' });
        }

        consultation.status = 'ongoing';
        consultation.startedAt = new Date();
        await consultation.save();

        res.json({ success: true, consultation });
    } catch (error) {
        console.error('Error starting consultation:', error);
        res.json({ success: false, message: error.message });
    }
};

// End consultation
export const endConsultation = async (req, res) => {
    try {
        const { consultationId, prescription, notes, prescriptionFile } = req.body;

        const consultation = await consultationModel.findById(consultationId);
        if (!consultation) {
            return res.json({ success: false, message: 'Consultation not found' });
        }

        const endedAt = new Date();
        const duration = consultation.startedAt 
            ? Math.round((endedAt - consultation.startedAt) / 60000) // Duration in minutes
            : 0;

        consultation.status = 'completed';
        consultation.endedAt = endedAt;
        consultation.duration = duration;
        consultation.prescription = prescription || null;
        consultation.notes = notes || null;
        consultation.prescriptionFile = prescriptionFile || null;

        await consultation.save();

        // Update doctor status
        await doctorModel.findByIdAndUpdate(consultation.doctorId, {
            status: 'online',
            currentAppointmentId: null
        });

        res.json({ success: true, consultation });
    } catch (error) {
        console.error('Error ending consultation:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get consultation details
export const getConsultation = async (req, res) => {
    try {
        const { consultationId } = req.params;

        const consultation = await consultationModel
            .findById(consultationId)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name speciality image');

        if (!consultation) {
            return res.json({ success: false, message: 'Consultation not found' });
        }

        res.json({ success: true, consultation });
    } catch (error) {
        console.error('Error fetching consultation:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's consultations
export const getUserConsultations = async (req, res) => {
    try {
        const userId = req.body.userId; // From authUser middleware

        const consultations = await consultationModel
            .find({ patientId: userId })
            .populate('doctorId', 'name speciality image')
            .sort({ createdAt: -1 });

        res.json({ success: true, consultations });
    } catch (error) {
        console.error('Error fetching user consultations:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get doctor's consultations
export const getDoctorConsultations = async (req, res) => {
    try {
        const docId = req.body.docId; // From authDoctor middleware

        const consultations = await consultationModel
            .find({ doctorId: docId })
            .populate('patientId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, consultations });
    } catch (error) {
        console.error('Error fetching doctor consultations:', error);
        res.json({ success: false, message: error.message });
    }
};

