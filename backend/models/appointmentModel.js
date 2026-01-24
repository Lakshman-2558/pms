import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true }, // Total amount
    consultationFee: { type: Number, default: 0 }, // Doctor consultation fee
    platformFee: { type: Number, default: 0 }, // Platform service fee
    gst: { type: Number, default: 0 }, // GST amount
    costBreakdown: {
        consultationFee: { type: Number, default: 0 },
        platformFee: { type: Number, default: 0 },
        gst: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending' 
    },
    transactionId: { type: String },
    upiTransactionId: { type: String },
    payerVPA: { type: String },
    paymentTimestamp: { type: Date },
    paymentMethod: { type: String, enum: ['payOnVisit', 'onlinePayment', 'Online', 'Pay on Visit'], default: 'payOnVisit' }, // Payment method selected
    isCompleted: { type: Boolean, default: false },
    // Queue System Fields
    tokenNumber: { type: Number, default: null },
    queuePosition: { type: Number, default: null },
    estimatedWaitTime: { type: Number, default: 0 }, // in minutes
    actualStartTime: { type: Number, default: null },
    actualEndTime: { type: Number, default: null },
    consultationDuration: { type: Number, default: null }, // in minutes
    status: { type: String, enum: ['pending', 'in-queue', 'in-consult', 'completed', 'no-show', 'cancelled'], default: 'pending' },
    isDelayed: { type: Boolean, default: false },
    delayReason: { type: String, default: '' },
    alerted: { type: Boolean, default: false }, // Whether patient has been alerted about their turn
    // Symptoms Field (based on doctor specialization, not age)
    selectedSymptoms: { type: [String], default: [] }, // Array of selected symptoms
    // Actual Patient Information (for booking for someone else)
    actualPatient: {
        name: { type: String, default: '' },
        age: { type: String, default: '' },
        gender: { type: String, default: '' },
        relationship: { type: String, default: '' },
        medicalHistory: { type: [String], default: [] },
        symptoms: { type: String, default: '' },
        phone: { type: String, default: '' },
        isSelf: { type: Boolean, default: true }
    },
    // Recent Prescription Upload
    recentPrescription: { type: String, default: '' }, // URL to uploaded prescription file
    // Consultation mode
    mode: { type: String, enum: ['In-person', 'Video'], default: 'In-person' }
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel