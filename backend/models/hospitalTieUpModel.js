import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    // Optional image URL for doctor avatar (used in frontend cards)
    image: { type: String, default: '' },
    available: { type: Boolean, default: true },
    showOnHospitalPage: { type: Boolean, default: true }
});

const hospitalTieUpSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    specialization: { type: String, required: true }, // Main hospital specialization
    type: { type: String, required: true, default: "General" }, // General, Super Specialty, Teaching
    showOnHome: { type: Boolean, default: false },
    doctors: [doctorSchema]
});

const HospitalTieUp = mongoose.models.HospitalTieUp || mongoose.model("HospitalTieUp", hospitalTieUpSchema);
export default HospitalTieUp;
