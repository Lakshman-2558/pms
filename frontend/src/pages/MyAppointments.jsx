import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import BackButton from '../components/BackButton'
import BackArrow from '../components/BackArrow'
import LoadingSpinner, { SkeletonAppointment, ButtonSpinner } from '../components/LoadingSpinner'
import QueueTracker from '../components/QueueTracker'
import QRCode from 'react-qr-code'

const MyAppointments = () => {

    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [cancellingId, setCancellingId] = useState(null)
    const [appointmentFilter, setAppointmentFilter] = useState('All') // 'All', 'Pending Payment', 'Payment Completed', 'Cancelled'
    const [expandedAppointments, setExpandedAppointments] = useState({}) // Track which appointments have details expanded
    const [expandedQueueStatus, setExpandedQueueStatus] = useState({}) // Track which queue status sections are expanded

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }

    // Generate QR code data for appointment
    const generateQRData = (item) => {
        return JSON.stringify({
            type: 'appointment',
            appointmentId: item._id,
            tokenNumber: item.tokenNumber,
            doctorName: item.docData?.name,
            patientName: item.userData?.name,
            date: item.slotDate,
            time: item.slotTime,
            amount: item.amount
        })
    }

    // Download receipt
    const handleDownloadReceipt = (item) => {
        const receiptText = `
MediChain Healthcare
Appointment Receipt
=====================================

Appointment ID: ${item._id}
Token Number: ${item.tokenNumber || 'N/A'}
Date: ${slotDateFormat(item.slotDate)} at ${item.slotTime}

APPOINTMENT DETAILS
-------------------
Patient Name: ${item.userData?.name || 'N/A'}
Doctor: ${item.docData?.name || 'N/A'}
Specialty: ${item.docData?.speciality || 'N/A'}
${item.docData?.address ? `Address: ${item.docData.address.line1}${item.docData.address.line2 ? ', ' + item.docData.address.line2 : ''}` : ''}

PAYMENT DETAILS
---------------
Amount: ₹${item.amount || 0}
Payment Status: ${item.payment ? 'Paid' : 'Pending'}
Payment Method: ${item.paymentMethod || 'Online'}

=====================================
Thank you for choosing MediChain Healthcare!
        `.trim()

        const blob = new Blob([receiptText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `appointment_receipt_${item._id}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Receipt downloaded successfully')
    }

    // Download OP Form (Out Patient Form) - PDF Format with CSS
    const handleDownloadOPForm = (item) => {
        const isPaid = item.payment === true || item.payment === "true" || item.payment === 1
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OP Form - ${item._id}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #0ea5e9;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .header h1 {
            color: #0ea5e9;
            font-size: 28px;
            margin: 0;
            font-weight: bold;
        }
        .header h2 {
            color: #64748b;
            font-size: 20px;
            margin: 5px 0 0 0;
            font-weight: normal;
        }
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section-title {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: white;
            padding: 10px 15px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            border-radius: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #475569;
            width: 40%;
        }
        .info-value {
            color: #1e293b;
            width: 60%;
            text-align: right;
        }
        .payment-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 14px;
        }
        .payment-paid {
            background-color: #d1fae5;
            color: #065f46;
        }
        .payment-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .instructions {
            background: #f8fafc;
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            margin-top: 15px;
            border-radius: 5px;
        }
        .instructions h3 {
            color: #0ea5e9;
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .instructions ol {
            margin: 0;
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 8px;
            color: #475569;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        .qr-placeholder {
            text-align: center;
            padding: 20px;
            background: #f1f5f9;
            border-radius: 5px;
            margin-top: 10px;
            color: #64748b;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MediChain Healthcare</h1>
        <h2>Out Patient (OP) Form</h2>
    </div>

    <div class="section">
        <div class="section-title">Appointment Information</div>
        <div class="info-row">
            <span class="info-label">Appointment ID:</span>
            <span class="info-value">${item._id}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Token Number:</span>
            <span class="info-value">${item.tokenNumber || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${slotDateFormat(item.slotDate)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Time:</span>
            <span class="info-value">${item.slotTime}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Patient Details</div>
        <div class="info-row">
            <span class="info-label">Patient Name:</span>
            <span class="info-value">${item.userData?.name || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Age:</span>
            <span class="info-value">${item.userData?.age || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Gender:</span>
            <span class="info-value">${item.userData?.gender || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${item.userData?.phone || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${item.userData?.email || 'N/A'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Doctor Details</div>
        <div class="info-row">
            <span class="info-label">Doctor Name:</span>
            <span class="info-value">${item.docData?.name || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Specialty:</span>
            <span class="info-value">${item.docData?.speciality || 'N/A'}</span>
        </div>
        ${item.docData?.address ? `
        <div class="info-row">
            <span class="info-label">Clinic Address:</span>
            <span class="info-value" style="text-align: right; word-wrap: break-word;">${item.docData.address.line1}${item.docData.address.line2 ? ', ' + item.docData.address.line2 : ''}</span>
        </div>
        ` : ''}
    </div>

    <div class="section">
        <div class="section-title">Payment Information</div>
        <div class="info-row">
            <span class="info-label">Consultation Fee:</span>
            <span class="info-value">₹${item.amount || 0}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Payment Status:</span>
            <span class="info-value">
                <span class="payment-status ${isPaid ? 'payment-paid' : 'payment-pending'}">
                    ${isPaid ? 'Payment Completed' : 'Pending Payment'}
                </span>
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${item.paymentMethod === 'onlinePayment' || item.paymentMethod === 'Online' ? 'Online Payment' : (item.paymentMethod || (isPaid ? 'Online Payment' : 'Pay on Visit'))}</span>
        </div>
    </div>

    <div class="instructions">
        <h3>Important Instructions</h3>
        <ol>
            <li>Please arrive 15 minutes before your appointment time</li>
            <li>Bring this OP Form and a valid ID proof</li>
            <li>Bring any previous medical reports or prescriptions</li>
            <li>${isPaid ? 'Payment is confirmed. Please carry the payment receipt.' : 'Payment is pending. Please pay at the clinic during your visit.'}</li>
        </ol>
    </div>

    <div class="footer">
        <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p>Thank you for choosing MediChain Healthcare!</p>
    </div>
</body>
</html>
        `.trim()

        // Create blob with HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `OP_Form_${item._id}.html`
        
        // Open in new window for printing/saving as PDF
        const printWindow = window.open(url, '_blank')
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print()
                // Fallback download after a delay
                setTimeout(() => {
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                }, 1000)
            }
        } else {
            // Fallback if popup is blocked
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
        
        toast.success('OP Form opened for printing/saving as PDF')
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        setIsLoading(true)
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            setAppointments(data.appointments.reverse())
        } catch (error) {
            console.error('Error fetching appointments:', error)
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load appointments'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {
        setCancellingId(appointmentId)
        try {
            const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error)
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to cancel appointment'
            toast.error(errorMessage)
        } finally {
            setCancellingId(null)
        }
    }


    useEffect(() => {
        if (token) {
            getUserAppointments()
        }
    }, [token])

    // Refresh appointments when component mounts or when coming from payment page
    useEffect(() => {
        // Check if we're coming from a payment success redirect
        const urlParams = new URLSearchParams(window.location.search)
        const paymentSuccess = urlParams.get('paymentSuccess')
        
        if (paymentSuccess === 'true' && token) {
            // Small delay to ensure backend has updated
            setTimeout(() => {
                getUserAppointments()
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname)
            }, 1000)
        }
    }, [token])

    // Get status badge
    const getStatusBadge = (item) => {
        if (item.isCompleted) {
            return <span className="badge badge-success">Completed</span>
        }
        if (item.cancelled) {
            return <span className="badge badge-error">Cancelled</span>
        }
        // Check payment status - payment can be true, "true", or 1
        const isPaid = item.payment === true || item.payment === "true" || item.payment === 1
        if (isPaid) {
            return <span className="badge badge-success">Payment Completed</span>
        }
        return <span className="badge badge-warning">Pending Payment</span>
    }

    // Filter appointments based on selected filter
    const filteredAppointments = appointments.filter(item => {
        if (appointmentFilter === 'All') return true;
        if (appointmentFilter === 'Pending Payment') {
            return !item.cancelled && !item.isCompleted && !(item.payment === true || item.payment === "true" || item.payment === 1);
        }
        if (appointmentFilter === 'Payment Completed') {
            return !item.cancelled && (item.payment === true || item.payment === "true" || item.payment === 1);
        }
        if (appointmentFilter === 'Cancelled') {
            return item.cancelled;
        }
        return true;
    })

    return (
        <div className="page-container fade-in">
            {/* Back Arrow Button */}
            <div className="mb-6 flex items-center gap-4">
                <BackArrow />
                <BackButton to="/" label="Back to Home" />
            </div>

            {/* Page Header */}
            <div className="section-header">
                <h1 className="section-title">My Appointments</h1>
                <p className="section-subtitle">Manage and track all your medical appointments</p>
            </div>

            {/* Filter Component */}
            {!isLoading && appointments.length > 0 && (
                <div className="mb-6">
                    <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-1">
                        <button
                            onClick={() => setAppointmentFilter('All')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                appointmentFilter === 'All'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setAppointmentFilter('Pending Payment')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                appointmentFilter === 'Pending Payment'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Pending Payment
                        </button>
                        <button
                            onClick={() => setAppointmentFilter('Payment Completed')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                appointmentFilter === 'Payment Completed'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Payment Completed
                        </button>
                        <button
                            onClick={() => setAppointmentFilter('Cancelled')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                appointmentFilter === 'Cancelled'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Cancelled
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <SkeletonAppointment key={i} />
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                /* Empty State */
                <div className="empty-state card">
                    <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="empty-state-title">No Appointments Yet</h3>
                    <p className="empty-state-text mb-4">
                        You haven't booked any appointments. Browse our doctors and schedule your first visit.
                    </p>
                    <button 
                        onClick={() => navigate('/doctors')}
                        className="btn btn-primary"
                    >
                        Find a Doctor
                    </button>
                </div>
            ) : filteredAppointments.length === 0 ? (
                /* Empty State for Filter */
                <div className="empty-state card">
                    <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="empty-state-title">No Appointments Found</h3>
                    <p className="empty-state-text mb-4">
                        No appointments match the selected filter. Try selecting a different filter option.
                    </p>
                    <button 
                        onClick={() => setAppointmentFilter('All')}
                        className="btn btn-primary"
                    >
                        Show All Appointments
                    </button>
                </div>
            ) : (
                /* Appointments Grid */
                <div className="space-y-4 sm:space-y-5">
                    {filteredAppointments.map((item, index) => {
                        const isPaid = item.payment === true || item.payment === "true" || item.payment === 1
                        return (
                        <div 
                            key={index} 
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        >
                            {/* Top Section - Doctor Info & Payment Status */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        {/* Doctor Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-md">
                                                {item.docData?.name ? item.docData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DR'}
                                            </div>
                                        </div>
                                        
                                        {/* Doctor Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-1 truncate">{item.docData.name}</h3>
                                            <p className="text-blue-600 font-medium text-sm mb-1">{item.docData.speciality}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate max-w-[150px]">{item.docData.address?.line1 || 'Address not available'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Payment Status Badge - Top Right */}
                                    <div className="flex-shrink-0">
                                        {getStatusBadge(item)}
                                    </div>
                                </div>
                                
                                {/* Date, Time & Token */}
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-blue-200/50">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-medium">{slotDateFormat(item.slotDate)} at {item.slotTime}</span>
                                    </div>
                                    {item.tokenNumber && (
                                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                            Token #{item.tokenNumber}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Content Section */}
                            <div className="p-4 sm:p-6">
                                {/* Payment Success Details - QR Code, Token, Details - Collapsible when paid */}
                                {!item.cancelled && isPaid && !item.isCompleted && (
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 mb-4 overflow-hidden">
                                        {/* Header with Token Number and Toggle Button */}
                                        <div className="flex justify-between items-center p-4 sm:p-5 pb-3">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1 font-medium">Token Number</p>
                                                <p className="text-2xl sm:text-3xl font-bold text-blue-500">#{item.tokenNumber}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setExpandedAppointments(prev => ({
                                                        ...prev,
                                                        [item._id]: !prev[item._id]
                                                    }))
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-colors"
                                            >
                                                <span>{expandedAppointments[item._id] ? 'Hide' : 'Show'} Details</span>
                                                <svg 
                                                    className={`w-4 h-4 transition-transform duration-200 ${expandedAppointments[item._id] ? 'rotate-180' : ''}`}
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Collapsible QR Code and Details Grid */}
                                        {expandedAppointments[item._id] && (
                                            <div className="px-4 sm:p-5 pt-0 pb-4 sm:pb-5 border-t border-green-200/50">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    {/* QR Code */}
                                                    <div className="flex flex-col items-center sm:items-start">
                                                        <p className="text-xs text-gray-600 mb-3 font-semibold">Appointment QR Code</p>
                                                        <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-gray-200">
                                                            <QRCode 
                                                                value={generateQRData(item)} 
                                                                size={140} 
                                                                level="H"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Appointment Details */}
                                                    <div className="space-y-3 text-sm">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Patient Name</p>
                                                            <p className="font-bold text-gray-900 text-base">{item.userData?.name || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Appointment Date & Time</p>
                                                            <p className="font-bold text-gray-900">
                                                                {slotDateFormat(item.slotDate)} at {item.slotTime}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
                                                            <p className="font-bold text-green-600 text-lg">₹{item.amount || 0}</p>
                                                        </div>
                                                        {item.docData?.address && (
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Location</p>
                                                                <p className="font-bold text-gray-900 text-sm">
                                                                    {item.docData.address.line1}
                                                                    {item.docData.address.line2 && `, ${item.docData.address.line2}`}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Queue Tracker - Show for upcoming appointments */}
                                {!item.cancelled && !item.isCompleted && isPaid && (
                                    <div className="mb-4">
                                        <QueueTracker
                                            appointmentId={item._id}
                                            docId={item.docId}
                                            slotDate={item.slotDate}
                                            slotTime={item.slotTime}
                                            isExpanded={expandedQueueStatus[item._id] || false}
                                            onToggle={() => {
                                                setExpandedQueueStatus(prev => ({
                                                    ...prev,
                                                    [item._id]: !prev[item._id]
                                                }))
                                            }}
                                            onTokenAlert={(tokenNumber) => {
                                                toast.success(`🎯 Token #${tokenNumber} - Your turn is next!`, {
                                                    autoClose: 10000,
                                                    position: "top-center"
                                                })
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                    {/* Completed Status */}
                                    {item.isCompleted && (
                                        <button className="btn btn-success w-full" disabled>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Completed
                                        </button>
                                    )}

                                    {/* Cancelled Status */}
                                    {item.cancelled && !item.isCompleted && (
                                        <button className="btn btn-danger w-full" disabled>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancelled
                                        </button>
                                    )}

                                    {/* Payment Options - Pay Online/Pay on Visit Button (Show for unpaid appointments only) */}
                                    {!item.cancelled && !isPaid && !item.isCompleted && (
                                        <>
                                            <button 
                                                onClick={() => navigate('/payment', { 
                                                    state: { 
                                                        appointmentId: item._id,
                                                        appointmentData: item
                                                    } 
                                                })} 
                                                className="btn btn-primary flex-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                {item.paymentMethod === 'payOnVisit' || item.paymentMethod === 'Pay on Visit' ? 'Pay Now' : 'Pay Online'}
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadOPForm(item)}
                                                className="btn btn-secondary flex-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                OP Form
                                            </button>
                                            <button 
                                                onClick={() => cancelAppointment(item._id)}
                                                disabled={cancellingId === item._id}
                                                className="btn btn-outline-danger flex-1"
                                            >
                                                {cancellingId === item._id ? (
                                                    <ButtonSpinner />
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Cancel
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}

                                    {/* Paid Status - Show OP Form and Cancel (Receipt removed) */}
                                    {!item.cancelled && isPaid && !item.isCompleted && (
                                        <>
                                            <button 
                                                onClick={() => handleDownloadOPForm(item)}
                                                className="btn btn-secondary flex-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                OP Form
                                            </button>
                                            <button 
                                                onClick={() => cancelAppointment(item._id)}
                                                disabled={cancellingId === item._id}
                                                className="btn btn-outline-danger flex-1"
                                            >
                                                {cancellingId === item._id ? (
                                                    <ButtonSpinner />
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Cancel
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default MyAppointments

