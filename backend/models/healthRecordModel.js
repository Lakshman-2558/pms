import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true }, // 'pdf', 'image', 'document'
    fileSize: { type: Number, required: true }, // in bytes
    uploadedAt: { type: Date, default: Date.now },
    cloudinaryPublicId: { type: String } // for deletion
}, { _id: true });

const healthRecordSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    appointmentId: {
        type: String,
        default: null
    },
    docId: {
        type: String,
        required: true,
        index: true
    },
    recordType: {
        type: String,
        required: true,
        enum: ['prescription', 'lab_report', 'xray', 'scan', 'vaccination', 'medical_note', 'other'],
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    doctorName: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    files: [fileSchema],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    isImportant: {
        type: Boolean,
        default: false
    },
    uploadedBeforeAppointment: {
        type: Boolean,
        default: false
    },
    viewedByDoctor: {
        type: Boolean,
        default: false
    },
    viewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
healthRecordSchema.index({ userId: 1, date: -1 });
healthRecordSchema.index({ docId: 1, appointmentId: 1 });
healthRecordSchema.index({ appointmentId: 1 });
healthRecordSchema.index({ userId: 1, docId: 1 });
healthRecordSchema.index({ userId: 1, recordType: 1 });

const healthRecordModel = mongoose.models.healthRecord || mongoose.model("healthRecord", healthRecordSchema);
export default healthRecordModel;
