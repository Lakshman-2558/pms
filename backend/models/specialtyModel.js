import mongoose from "mongoose";

const specialtySchema = new mongoose.Schema({
    specialtyName: { 
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    helplineNumber: { 
        type: String, 
        required: true,
        trim: true
    },
    availability: { 
        type: String, 
        enum: ['24x7', 'Working Hours'],
        default: '24x7'
    },
    status: { 
        type: String, 
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now
    },
    updatedBy: {
        type: String, // Admin ID who updated
        default: null
    }
}, {
    timestamps: true
});

const specialtyModel = mongoose.models.specialty || mongoose.model("specialty", specialtySchema);
export default specialtyModel;

