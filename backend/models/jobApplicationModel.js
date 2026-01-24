import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  qualification: { type: String, required: true, trim: true },
  experience: { type: String, required: true, trim: true },
  role_applied: { type: String, required: true, trim: true },
  skills: { type: String, required: true, trim: true },
  coverLetter: { type: String, trim: true },
  resume_file_path: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  created_at: { type: Date, default: Date.now }
})

const JobApplication = mongoose.models.JobApplication || mongoose.model("JobApplication", jobApplicationSchema)

export default JobApplication;


