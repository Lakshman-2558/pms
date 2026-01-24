import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    hospitalName: { 
        type: String, 
        required: true,
        trim: true
    },
    location: { 
        type: String, 
        required: true,
        trim: true
    },
    contact: { 
        type: String, 
        required: true,
        trim: true
    },
    hospitalType: { 
        type: String, 
        enum: ['MAIN', 'PARTNER'], 
        required: true,
        default: 'PARTNER'
    },
    date: { 
        type: Number, 
        required: true,
        default: Date.now
    }
}, { 
    timestamps: true,
    minimize: false 
});

// Index for faster queries
hospitalSchema.index({ hospitalType: 1 });

const hospitalModel = mongoose.models.hospital || mongoose.model("hospital", hospitalSchema);
export default hospitalModel;
