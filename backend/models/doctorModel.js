import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    // Queue System Fields
    status: { type: String, enum: ['in-clinic', 'in-consult', 'on-break', 'unavailable', 'online'], default: 'in-clinic' },
    currentAppointmentId: { type: String, default: null }, // Currently consulting patient
    averageConsultationTime: { type: Number, default: 15 }, // Average consultation time in minutes
    breakStartTime: { type: Number, default: null },
    breakDuration: { type: Number, default: 15 }, // Break duration in minutes
    // Video Consultation Fields
    videoConsult: { type: Boolean, default: false }, // Enable video consultation
    location: { 
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    },
    hospital: { type: String, default: '' }, // Hospital/Clinic name (kept for backward compatibility)
    hospitalId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'hospital',
        default: null 
    }, // Foreign key reference to Hospital model
    // Password reset fields
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpiry: { type: Date },
    // Removed: Age-based symptom fields (no longer needed - symptoms now based on specialization)
}, { minimize: false })

// Explicitly set collection name to 'doctors'
const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema, "doctors");
export default doctorModel;