# 🚀 Real-time Payment System with WebSocket - Connection Guide

## 📋 Overview

This guide explains how the WebSocket-based real-time payment system connects the frontend PaymentPage to the backend server.

## 🏗️ Architecture Flow

```
┌─────────────────┐
│  PaymentPage.jsx │ (Frontend)
└────────┬────────┘
         │
         │ 1. Establishes WebSocket connection
         │    ws://localhost:4000/payment-updates?appointmentId=xxx&token=xxx
         ▼
┌─────────────────────────────────────┐
│         server.js                   │
│  ┌───────────────────────────────┐ │
│  │  WebSocket Server              │ │
│  │  Path: /payment-updates        │ │
│  │  Stores connections by         │ │
│  │  appointmentId                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Express Routes               │ │
│  │  /api/payment/*               │ │
│  └───────────────────────────────┘ │
└─────────────┬───────────────────────┘
              │
              │ 2. Payment provider calls webhook
              │    POST /api/payment/webhook/upi-payment
              ▼
┌─────────────────────────────────────┐
│    paymentRoute.js                   │
│  ┌───────────────────────────────┐ │
│  │  Webhook Handler              │ │
│  │  - Updates appointment        │ │
│  │  - Calls notifyPaymentSuccess │ │
│  └───────────────────────────────┘ │
└─────────────┬───────────────────────┘
              │
              │ 3. Notifies WebSocket clients
              │    global.notifyPaymentSuccess(appointmentId)
              ▼
┌─────────────────────────────────────┐
│  WebSocket sends message to clients │
│  { type: 'PAYMENT_SUCCESS', ... }   │
└─────────────┬───────────────────────┘
              │
              │ 4. Frontend receives notification
              ▼
┌─────────────────┐
│  PaymentPage.jsx │
│  - Shows success │
│  - Redirects    │
└─────────────────┘
```

## 📁 File Structure

```
backend/
├── server.js                    # ✅ Updated - WebSocket server setup
├── routes/
│   └── paymentRoute.js          # ✅ New - Payment webhook & endpoints
└── models/
    └── appointmentModel.js     # ✅ Updated - Added payment fields
```

## 🔌 How WebSocket Connects

### 1. Frontend Connection (PaymentPage.jsx)

**Location:** `frontend/src/pages/PaymentPage.jsx` (lines 48-106)

```javascript
// WebSocket connection is established when:
// - UPI payment mode is selected
// - Merchant UPI is loaded
// - Payment status is 'pending'

const connectWebSocket = useCallback(() => {
    const appointmentId = appointmentData.appointmentId || appointmentData._id
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws'
    const wsUrl = backendUrl.replace(/^https?:/, wsProtocol)
    
    // Connects to: ws://localhost:4000/payment-updates?appointmentId=xxx&token=xxx
    const ws = new WebSocket(`${wsUrl}/payment-updates?appointmentId=${appointmentId}&token=${token}`)
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'PAYMENT_SUCCESS') {
            handlePaymentSuccess() // Shows success modal & redirects
        }
    }
}, [appointmentData, token, backendUrl])
```

### 2. Backend WebSocket Server (server.js)

**Location:** `backend/server.js` (lines 18-99)

```javascript
// WebSocket server created on same HTTP server
const wss = new WebSocketServer({ server, path: '/payment-updates' })

// Stores connections by appointmentId
const paymentConnections = new Map()

wss.on('connection', (ws, req) => {
    const appointmentId = url.searchParams.get('appointmentId')
    
    // Store connection
    paymentConnections.get(appointmentId).push(ws)
    
    // When payment succeeds, notify all clients
    global.notifyPaymentSuccess(appointmentId)
})
```

### 3. Payment Webhook (paymentRoute.js)

**Location:** `backend/routes/paymentRoute.js` (lines 11-75)

```javascript
// Payment provider calls this when payment completes
router.post('/webhook/upi-payment', async (req, res) => {
    const { appointmentId, status, transactionId, amount } = req.body
    
    if (status === 'SUCCESS') {
        // Update appointment in database
        appointment.payment = true
        appointment.paymentStatus = 'paid'
        await appointment.save()
        
        // Notify WebSocket clients
        global.notifyPaymentSuccess(appointmentId)
    }
})
```

## 🔄 Complete Payment Flow

### Step-by-Step Process:

1. **User Opens Payment Page**
   - PaymentPage.jsx loads
   - Fetches merchant UPI: `GET /api/user/payment/merchant-upi`
   - Generates QR code with UPI deep link

2. **WebSocket Connection Established**
   - When UPI mode selected and QR displayed
   - Connects to: `ws://localhost:4000/payment-updates?appointmentId=xxx&token=xxx`
   - Server stores connection in `paymentConnections` Map

3. **User Scans QR & Pays**
   - Opens UPI app (Paytm, PhonePe, etc.)
   - Completes payment

4. **Payment Provider Processes Payment**
   - Payment provider (e.g., Razorpay, PayU) processes payment
   - Calls webhook: `POST /api/payment/webhook/upi-payment`

5. **Backend Updates Database**
   - Updates `appointment.payment = true`
   - Updates `appointment.paymentStatus = 'paid'`
   - Saves transaction details

6. **WebSocket Notification Sent**
   - `global.notifyPaymentSuccess(appointmentId)` is called
   - Server sends message to all connected clients for that appointment
   - Message: `{ type: 'PAYMENT_SUCCESS', appointmentId, timestamp }`

7. **Frontend Receives Notification**
   - PaymentPage.jsx receives WebSocket message
   - Calls `handlePaymentSuccess()`
   - Shows success modal
   - Redirects to `/my-appointments`

## 📡 API Endpoints

### Webhook (Called by Payment Provider)
```
POST /api/payment/webhook/upi-payment
Body: {
    appointmentId: "65a1b2c3d4e5f678901234",
    transactionId: "TXN123456789",
    amount: "500.00",
    status: "SUCCESS",
    upiTxnId: "UPI987654321",
    payerVPA: "user@paytm",
    timestamp: "2024-01-25T10:30:00Z"
}
```

### Get Merchant UPI (Already exists)
```
GET /api/user/payment/merchant-upi
Headers: { token: "..." }
Response: { success: true, merchantUPI: "824771300@ybl" }
```

### Simulate Payment (Testing Only)
```
POST /api/payment/simulate-upi-payment
Headers: { token: "..." }
Body: { appointmentId: "...", amount: 500 }
```

### Manual Verification
```
POST /api/payment/verify-manual
Headers: { token: "..." }
Body: { appointmentId: "...", transactionId: "..." }
```

## 🗄️ Database Schema Updates

**File:** `backend/models/appointmentModel.js`

Added fields:
```javascript
paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending' 
},
transactionId: { type: String },
upiTransactionId: { type: String },
payerVPA: { type: String },
paymentTimestamp: { type: Date }
```

## 🔧 Configuration

### Environment Variables

Add to `.env`:
```env
PORT=4000
MERCHANT_UPI_ID=824771300@ybl
WEBHOOK_SECRET=your_webhook_secret_here  # For production webhook verification
```

### WebSocket URL

- **Development:** `ws://localhost:4000/payment-updates`
- **Production:** `wss://yourdomain.com/payment-updates` (use `wss://` for HTTPS)

## 🧪 Testing

### Test WebSocket Connection

1. Open PaymentPage
2. Select UPI payment
3. Check browser console for: `✅ WebSocket Connected`
4. Check server console for: `✅ WebSocket connected for appointment: xxx`

### Test Payment Simulation

```bash
# Using the simulate endpoint
curl -X POST http://localhost:4000/api/payment/simulate-upi-payment \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{"appointmentId": "YOUR_APPOINTMENT_ID", "amount": 500}'
```

### Test Webhook Directly

```bash
curl -X POST http://localhost:4000/api/payment/webhook/upi-payment \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "YOUR_APPOINTMENT_ID",
    "transactionId": "TXN123456",
    "amount": "500.00",
    "status": "SUCCESS",
    "upiTxnId": "UPI987654",
    "payerVPA": "user@paytm",
    "timestamp": "2024-01-25T10:30:00Z"
  }'
```

## 🐛 Troubleshooting

### WebSocket Not Connecting?

1. **Check server is running:** `Server started on PORT: 4000`
2. **Check WebSocket path:** Must be `/payment-updates`
3. **Check URL format:** `ws://localhost:4000/payment-updates?appointmentId=xxx&token=xxx`
4. **Check browser console:** Look for connection errors
5. **Check server console:** Look for connection logs

### Payment Not Detected?

1. **Check webhook is being called:** Look for `📥 UPI Payment Webhook Received` in server logs
2. **Check database update:** Verify `appointment.payment === true`
3. **Check WebSocket notification:** Look for `📤 Sending payment notification` in server logs
4. **Check frontend connection:** Verify WebSocket is connected in browser console

### Timer Expiry Issues?

- Timer is handled in PaymentPage.jsx (lines 256-282)
- After 3 minutes (180 seconds), QR code expires
- `qrExpired` state blocks further payments
- Auto-redirects after expiry

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Server console shows: `✅ WebSocket connected for appointment: xxx`
2. ✅ Browser console shows: `✅ WebSocket Connected - Real-time payment detection active`
3. ✅ Green pulse animation appears on "Waiting for payment" message
4. ✅ Payment detected within 2-4 seconds of completion
5. ✅ Success modal with checkmark appears
6. ✅ Auto-redirects to appointments page

## 🔒 Production Considerations

1. **Webhook Security:** Implement signature verification
2. **SSL/TLS:** Use `wss://` instead of `ws://`
3. **Rate Limiting:** Add rate limits to webhook endpoint
4. **Error Handling:** Add comprehensive error handling
5. **Logging:** Add detailed logging for debugging
6. **Monitoring:** Set up monitoring for WebSocket connections

## 📝 Notes

- WebSocket connections are stored in memory (Map)
- If server restarts, connections are lost (clients will reconnect)
- Multiple clients can connect for same appointment (e.g., multiple tabs)
- Polling fallback is available if WebSocket fails (PaymentPage.jsx lines 109-156)

