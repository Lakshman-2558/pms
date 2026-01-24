import express from "express"
import cors from 'cors'
import connectDB from "../config/mongodb.js"
import connectCloudinary from "../config/cloudinary.js"
import userRouter from "../routes/userRoute.js"
import doctorRouter from "../routes/doctorRoute.js"
import adminRouter from "../routes/adminRoute.js"
import jobApplicationRouter from "../routes/jobApplicationRoute.js"
import hospitalRouter from "../routes/hospitalRoute.js"
import hospitalTieUpRouter from "../routes/hospitalTieUpRoute.js"

const app = express()

// Connect to MongoDB and Cloudinary
connectDB()
connectCloudinary()

// Middlewares
app.use(express.json())
app.use(cors())

// API endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/jobs", jobApplicationRouter)
app.use("/api/hospital", hospitalRouter)
app.use("/api/hospital-tieup", hospitalTieUpRouter)

app.get("/", (req, res) => {
  res.json({ message: "API Working" })
})

// Export as serverless function for Vercel
export default app

