import express from "express"
import http from "http"
import { WebSocketServer } from "ws"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import jobApplicationRouter from "./routes/jobApplicationRoute.js"
import emergencyRouter from "./routes/emergencyRoute.js"
import aiRouter from "./routes/aiRoute.js"
import specialtyRouter from "./routes/specialtyRoute.js"
import otpRouter from "./routes/otpRoute.js"
import hospitalTieUpRouter from "./routes/hospitalTieUpRoute.js"
import locationRouter from "./routes/locationRoute.js"
import paymentRouter from "./routes/paymentRoute.js"

// app config
const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// ========================================
// WebSocket Server for Real-time Payment Updates
// ========================================
const wss = new WebSocketServer({ server, path: '/payment-updates' })

// Store active WebSocket connections by appointmentId
const paymentConnections = new Map()

wss.on('connection', (ws, req) => {
    try {
        // Parse query parameters from URL
        const url = new URL(req.url, `http://${req.headers.host}`)
        const appointmentId = url.searchParams.get('appointmentId')
        const token = url.searchParams.get('token')

        if (!appointmentId) {
            console.log('❌ WebSocket connection rejected: Missing appointmentId')
            ws.close()
            return
        }

        console.log(`✅ WebSocket connected for appointment: ${appointmentId}`)

        // Store connection
        if (!paymentConnections.has(appointmentId)) {
            paymentConnections.set(appointmentId, [])
        }
        paymentConnections.get(appointmentId).push(ws)

        // Handle connection close
        ws.on('close', () => {
            console.log(`🔌 WebSocket disconnected for appointment: ${appointmentId}`)
            const connections = paymentConnections.get(appointmentId)
            if (connections) {
                const index = connections.indexOf(ws)
                if (index > -1) connections.splice(index, 1)
                if (connections.length === 0) {
                    paymentConnections.delete(appointmentId)
                }
            }
        })

        // Handle errors
        ws.on('error', (error) => {
            console.error(`❌ WebSocket error for appointment ${appointmentId}:`, error)
        })

        // Send connection confirmation
        ws.send(JSON.stringify({
            type: 'CONNECTED',
            appointmentId: appointmentId,
            message: 'WebSocket connection established'
        }))
    } catch (error) {
        console.error('❌ WebSocket connection error:', error)
        ws.close()
    }
})

// Function to notify payment success to all connected clients
function notifyPaymentSuccess(appointmentId) {
    const connections = paymentConnections.get(appointmentId)
    if (connections && connections.length > 0) {
        console.log(`📤 Sending payment notification to ${connections.length} client(s) for appointment: ${appointmentId}`)
        const message = JSON.stringify({
            type: 'PAYMENT_SUCCESS',
            appointmentId: appointmentId,
            timestamp: new Date().toISOString()
        })

        connections.forEach(ws => {
            if (ws.readyState === 1) { // WebSocket.OPEN = 1
                try {
                    ws.send(message)
                } catch (error) {
                    console.error('Error sending WebSocket message:', error)
                }
            }
        })
    } else {
        console.log(`⚠️ No active connections for appointment: ${appointmentId}`)
    }
}

// Export for use in routes
global.notifyPaymentSuccess = notifyPaymentSuccess

// ========================================
// Express Middlewares
// ========================================
app.use(express.json())
app.use(cors())

// ========================================
// API Endpoints
// ========================================
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/jobs", jobApplicationRouter)
app.use("/api/emergency", emergencyRouter)
app.use("/api/ai", aiRouter)
app.use("/api/specialty", specialtyRouter)
app.use("/api", otpRouter) // OTP routes: /api/send-otp, /api/verify-otp
app.use("/api/hospital-tieup", hospitalTieUpRouter)
app.use("/api/location", locationRouter) // Location routes: /api/location/geocode, /api/location/nearby-hospitals
app.use("/api/payment", paymentRouter) // Payment routes: /api/payment/webhook/upi-payment, etc.

app.get("/", (req, res) => {
  res.send("API Working")
})

// ========================================
// Start Server (HTTP + WebSocket)
// ========================================
server.listen(port, () => {
  console.log(`✅ Server started on PORT: ${port}`)
  console.log(`✅ WebSocket server active at ws://localhost:${port}/payment-updates`)
})