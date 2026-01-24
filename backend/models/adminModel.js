import mongoose from "mongoose";

// Separate Admin Model - for admin accounts (stored in database)
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
}, { collection: 'admins' }) // Explicitly set collection name to 'admins'

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;

