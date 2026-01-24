import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user',
        required: true 
    },
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'doctor',
        required: true 
    },
    type: { 
        type: String, 
        enum: ['video', 'audio'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
        default: 'scheduled' 
    },
    meetingLink: { 
        type: String, 
        default: null 
    },
    meetingId: { 
        type: String, 
        default: null 
    },
    meetingProvider: { 
        type: String, 
        enum: ['google-meet', 'zoom', 'webrtc'], 
        default: 'google-meet' 
    },
    scheduledAt: { 
        type: Date, 
        default: Date.now 
    },
    startedAt: { 
        type: Date, 
        default: null 
    },
    endedAt: { 
        type: Date, 
        default: null 
    },
    duration: { 
        type: Number, 
        default: 0 // Duration in minutes
    },
    prescription: { 
        type: String, 
        default: null 
    },
    notes: { 
        type: String, 
        default: null 
    },
    prescriptionFile: { 
        type: String, 
        default: null // PDF file URL
    }
}, {
    timestamps: true
});

const consultationModel = mongoose.models.consultation || mongoose.model("consultation", consultationSchema);
export default consultationModel;

