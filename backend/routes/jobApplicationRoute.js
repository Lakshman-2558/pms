import express from "express";
import resumeUpload from "../middleware/resumeUpload.js";
import authAdmin from "../middleware/authAdmin.js";
import { applyForJob, listJobApplications, downloadResume, deleteJobApplication, approveJobApplication, rejectJobApplication } from "../controllers/jobApplicationController.js";

const jobRouter = express.Router();

// Public endpoint to submit job application
jobRouter.post("/apply", resumeUpload.single("resume"), applyForJob);

// Admin-only endpoints
jobRouter.get("/admin/list", authAdmin, listJobApplications);
jobRouter.get("/admin/:id/resume", authAdmin, downloadResume);
jobRouter.delete("/admin/:id", authAdmin, deleteJobApplication);
jobRouter.post("/admin/:id/approve", authAdmin, approveJobApplication);
jobRouter.post("/admin/:id/reject", authAdmin, rejectJobApplication);

export default jobRouter;


