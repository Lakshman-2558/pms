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
// Dynamic imports to avoid Vite pre-bundling issues

const MyAppointments = () => {

    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [cancellingId, setCancellingId] = useState(null)
    const [downloadingOPForm, setDownloadingOPForm] = useState(null) // Track which OP form is being downloaded (appointment ID)
    const [opFormProgress, setOpFormProgress] = useState({}) // Track progress percentage for each OP form { appointmentId: percentage }
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

    // Download OP Form (Out Patient Form) - PDF Format
    const handleDownloadOPForm = async (item) => {
        setDownloadingOPForm(item._id)
        setOpFormProgress(prev => ({ ...prev, [item._id]: 1 }))
        try {
            const isPaid = item.payment === true || item.payment === "true" || item.payment === 1
            const hospitalName = item.hospitalData?.name || item.docData?.hospitalName || 'MediChain Healthcare'
        
        // Convert logo to base64 for PDF
        const logoToBase64 = (src) => {
            return new Promise((resolve) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0)
                    resolve(canvas.toDataURL('image/png'))
                }
                img.onerror = () => resolve('')
                img.src = assets.logo
            })
        }
        
        setOpFormProgress(prev => ({ ...prev, [item._id]: 10 }))
        const logoBase64 = await logoToBase64(assets.logo)
        setOpFormProgress(prev => ({ ...prev, [item._id]: 20 }))
        
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
            margin: 12mm 15mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', 'Helvetica', 'Segoe UI', sans-serif;
            color: #1a1a1a;
            line-height: 1.5;
            background: #ffffff;
            padding: 0;
            font-size: 13px;
        }
        .header-container {
            display: flex;
            align-items: flex-start;
            gap: 25px;
            border-bottom: 3px solid #0ea5e9;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .logo-section {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            flex: 1;
        }
        .logo-img {
            width: 90px;
            height: 90px;
            object-fit: contain;
            flex-shrink: 0;
            padding: 5px;
        }
        .header-text {
            flex: 1;
            padding-top: 5px;
        }
        .hospital-name {
            font-size: 30px;
            font-weight: 800;
            color: #0c4a6e;
            margin: 0 0 6px 0;
            line-height: 1.2;
            letter-spacing: -0.5px;
        }
        .form-title {
            font-size: 18px;
            color: #475569;
            margin: 0;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .form-id {
            text-align: right;
            font-size: 10px;
            color: #94a3b8;
            margin-top: 8px;
            font-weight: 500;
        }
        .section {
            margin-bottom: 22px;
            page-break-inside: avoid;
        }
        .payment-section {
            margin-bottom: 0;
            page-break-after: always;
            break-after: page;
        }
        .section-title {
            background: #0ea5e9;
            color: white;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 12px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
            min-height: 32px;
        }
        .info-row:last-child {
            border-bottom: 2px solid #d1d5db;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
            width: 38%;
            font-size: 13px;
            line-height: 1.5;
        }
        .info-value {
            color: #111827;
            width: 62%;
            text-align: right;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.5;
            word-break: break-word;
        }
        .info-value strong {
            font-weight: 700;
            color: #0c4a6e;
        }
        .payment-status {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .payment-paid {
            background-color: #10b981;
            color: white;
        }
        .payment-pending {
            background-color: #f59e0b;
            color: white;
        }
        .page-break {
            page-break-before: always;
            break-before: page;
            margin-top: 0;
            padding-top: 0;
            height: 0;
        }
        .second-page-header {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px 0 18px 0;
            border-bottom: 3px solid #0ea5e9;
        }
        .second-page-logo {
            width: 100px;
            height: 100px;
            object-fit: contain;
            flex-shrink: 0;
            padding: 5px;
        }
        .second-page-logo-text {
            font-size: 28px;
            font-weight: 800;
            color: #0c4a6e;
            letter-spacing: -0.3px;
            line-height: 1.2;
        }
        .qr-section {
            text-align: center;
            padding: 30px 20px;
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 25px;
            min-height: 250px;
            page-break-inside: avoid;
            display: block !important;
        }
        .qr-title {
            font-weight: 700;
            margin-bottom: 20px;
            color: #0c4a6e;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .qr-code {
            margin: 15px auto;
            display: inline-block !important;
            min-width: 120px;
            min-height: 120px;
        }
        .qr-instruction {
            font-size: 13px;
            color: #374151;
            margin-top: 15px;
            font-weight: 600;
        }
        .qr-details {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: left;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }
        .qr-details p {
            margin: 6px 0;
        }
        .instructions {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #0ea5e9;
            padding: 20px;
            margin-top: 25px;
            border-radius: 4px;
        }
        .instructions h3 {
            color: #0c4a6e;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .instructions ol {
            margin: 0;
            padding-left: 25px;
        }
        .instructions li {
            margin-bottom: 10px;
            color: #374151;
            font-size: 13px;
            line-height: 1.7;
        }
        .instructions li strong {
            color: #0c4a6e;
            font-weight: 700;
        }
        .footer {
            margin-top: 35px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 11px;
        }
        .footer p {
            margin: 5px 0;
            line-height: 1.5;
        }
        .signature-section {
            margin-top: 35px;
            display: flex;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
        }
        .signature-box {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            border-top: 1.5px solid #1f2937;
            margin-top: 45px;
            padding-top: 6px;
            font-size: 11px;
            color: #6b7280;
            font-weight: 500;
        }
        .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 20px 0;
        }
        .highlight-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 12px 16px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .highlight-box strong {
            color: #0c4a6e;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="header-container">
        <div class="logo-section">
            ${logoBase64 ? `<img src="${logoBase64}" alt="MediChain Logo" class="logo-img" style="min-width: 90px; min-height: 90px;" />` : '<div class="logo-img" style="background: #0ea5e9; border-radius: 8px; min-width: 90px; min-height: 90px;"></div>'}
            <div class="header-text">
                <h1 class="hospital-name">${hospitalName}</h1>
                <h2 class="form-title">Out Patient (OP) Form</h2>
            </div>
        </div>
        <div class="form-id">Form ID: ${item._id.substring(0, 20)}</div>
    </div>

    <div class="section">
        <div class="section-title">Appointment Information</div>
        <div class="info-row">
            <span class="info-label">Appointment ID:</span>
            <span class="info-value">${item._id.substring(0, 20)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Token Number:</span>
            <span class="info-value"><strong>${item.tokenNumber || 'N/A'}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Appointment Date:</span>
            <span class="info-value"><strong>${slotDateFormat(item.slotDate)}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Appointment Time:</span>
            <span class="info-value"><strong>${item.slotTime}</strong></span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Patient Details</div>
        <div class="info-row">
            <span class="info-label">Patient Name:</span>
            <span class="info-value"><strong>${item.userData?.name || item.actualPatient?.name || 'N/A'}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Age:</span>
            <span class="info-value">${item.userData?.age || item.actualPatient?.age || 'N/A'} years</span>
        </div>
        <div class="info-row">
            <span class="info-label">Gender:</span>
            <span class="info-value">${item.userData?.gender || item.actualPatient?.gender || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Phone Number:</span>
            <span class="info-value">${item.userData?.phone || item.actualPatient?.phone || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email Address:</span>
            <span class="info-value">${item.userData?.email || 'N/A'}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Doctor Details</div>
        <div class="info-row">
            <span class="info-label">Doctor Name:</span>
            <span class="info-value"><strong>${item.docData?.name || 'N/A'}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Specialty:</span>
            <span class="info-value">${item.docData?.speciality || item.docData?.specialization || 'N/A'}</span>
        </div>
        ${item.docData?.address ? `
        <div class="info-row">
            <span class="info-label">Clinic Address:</span>
            <span class="info-value" style="text-align: right; word-wrap: break-word;">${item.docData.address.line1 || ''}${item.docData.address.line2 ? ', ' + item.docData.address.line2 : ''}${item.docData.address.city ? ', ' + item.docData.address.city : ''}${item.docData.address.state ? ', ' + item.docData.address.state : ''}${item.docData.address.pincode ? ' - ' + item.docData.address.pincode : ''}</span>
        </div>
        ` : ''}
    </div>

    <div class="section payment-section">
        <div class="section-title">Payment Information</div>
        <div class="info-row">
            <span class="info-label">Consultation Fee:</span>
            <span class="info-value"><strong>₹${item.amount || 0}</strong></span>
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

    <div class="page-break"></div>

    <!-- QR CODE SECTION - COMPULSORY ON 2ND PAGE -->
    <div class="qr-section">
        <div class="qr-title">QR Code for Check-in</div>
        <div class="qr-code" id="qr-code-container-${item._id}"></div>
        <div class="qr-instruction">Scan this QR code at the reception counter for quick check-in</div>
        <div class="qr-details">
            <p><strong>Appointment ID:</strong> ${item._id.substring(0, 20)}</p>
            <p><strong>Token Number:</strong> ${item.tokenNumber || 'N/A'}</p>
            <p><strong>Patient Name:</strong> ${item.userData?.name || item.actualPatient?.name || 'N/A'}</p>
            <p><strong>Date:</strong> ${slotDateFormat(item.slotDate)} at ${item.slotTime}</p>
        </div>
    </div>

    <div class="instructions">
        <h3>Important Instructions</h3>
        <ol>
            <li>Please arrive <strong>15 minutes before</strong> your scheduled appointment time to complete registration and documentation</li>
            <li>Bring this OP Form (printed or digital) and a <strong>valid government-issued ID proof</strong> (Aadhaar Card, PAN Card, Driving License, or Passport)</li>
            <li>Carry any <strong>previous medical reports, prescriptions, or test results</strong> related to your current medical condition</li>
            <li>${isPaid ? '<strong>Payment is confirmed.</strong> Please carry the payment receipt or transaction ID for reference. No additional payment is required at the clinic.' : '<strong>Payment is pending.</strong> Please pay the consultation fee at the clinic reception counter during your visit. Cash and card payments are accepted.'}</li>
            <li>In case of any delay or cancellation, please inform the clinic at least <strong>2 hours in advance</strong> to avoid cancellation charges</li>
            <li>Wear a <strong>face mask</strong> and maintain social distancing while at the clinic premises</li>
            <li>If you are experiencing <strong>fever, cough, or any COVID-19 symptoms</strong>, please inform the clinic before your visit</li>
            <li>Keep your <strong>mobile phone charged</strong> and ensure it is switched on for any emergency communications</li>
            <li>For any queries or assistance, contact the clinic reception at the provided contact number</li>
            <li>Please note that <strong>late arrivals may result in rescheduling</strong> of your appointment based on doctor availability</li>
        </ol>
    </div>

    <div class="footer">
        <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p>This is a computer-generated document. No signature is required.</p>
        <p style="margin-top: 6px; font-weight: 600; color: #0c4a6e;">Thank you for choosing ${hospitalName}!</p>
    </div>
</body>
</html>
        `.trim()

        // Create a temporary div to hold the HTML content
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        tempDiv.style.position = 'absolute'
        tempDiv.style.left = '-9999px'
        tempDiv.style.width = '210mm'
        tempDiv.style.padding = '20px'
        tempDiv.style.backgroundColor = '#fff'
        document.body.appendChild(tempDiv)

        // Generate QR code and insert it (COMPULSORY on 2nd page)
        setOpFormProgress(prev => ({ ...prev, [item._id]: 30 }))
        const qrContainer = tempDiv.querySelector(`#qr-code-container-${item._id}`)
        if (!qrContainer) {
            console.error('QR code container not found! This should not happen.')
            toast.error('Error: QR code container missing. Please try again.', {
                hideProgressBar: true
            })
            setDownloadingOPForm(null)
            setOpFormProgress(prev => {
                const newProgress = { ...prev }
                delete newProgress[item._id]
                return newProgress
            })
            return
        }
        // Always generate QR code - it's compulsory on 2nd page
        const qrData = generateQRCodeSVG(item._id)
        qrContainer.innerHTML = qrData

        // Wait for images to load, then generate PDF using dynamic imports
        setTimeout(async () => {
            try {
                setOpFormProgress(prev => ({ ...prev, [item._id]: 40 }))
                // Dynamically import html2canvas and jsPDF
                const html2canvas = (await import('html2canvas')).default
                const jsPDF = (await import('jspdf')).default
                
                setOpFormProgress(prev => ({ ...prev, [item._id]: 50 }))
                const canvas = await html2canvas(tempDiv, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: tempDiv.scrollWidth,
                    height: tempDiv.scrollHeight,
                    onclone: (clonedDoc) => {
                        setOpFormProgress(prev => ({ ...prev, [item._id]: 70 }))
                    }
                })
                
                setOpFormProgress(prev => ({ ...prev, [item._id]: 80 }))
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF('p', 'mm', 'a4')
                const imgWidth = 210
                const pageHeight = 297
                const imgHeight = (canvas.height * imgWidth) / canvas.width
                let heightLeft = imgHeight
                let position = 0

                setOpFormProgress(prev => ({ ...prev, [item._id]: 85 }))
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight

                setOpFormProgress(prev => ({ ...prev, [item._id]: 90 }))
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight
                    pdf.addPage()
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                    heightLeft -= pageHeight
                }

                setOpFormProgress(prev => ({ ...prev, [item._id]: 95 }))
                pdf.save(`OP_Form_${item._id.substring(0, 12)}.pdf`)
                document.body.removeChild(tempDiv)
                setOpFormProgress(prev => ({ ...prev, [item._id]: 100 }))
                
                // Hide toast progress bar
                toast.success('OP Form downloaded as PDF successfully!', {
                    hideProgressBar: true
                })
            } catch (error) {
                console.error('Error generating PDF:', error)
                if (tempDiv.parentNode) {
                    document.body.removeChild(tempDiv)
                }
                toast.error('Failed to generate PDF. Please try again.', {
                    hideProgressBar: true
                })
                setDownloadingOPForm(null)
                setOpFormProgress(prev => {
                    const newProgress = { ...prev }
                    delete newProgress[item._id]
                    return newProgress
                })
            } finally {
                setTimeout(() => {
                    setDownloadingOPForm(null)
                    setOpFormProgress(prev => {
                        const newProgress = { ...prev }
                        delete newProgress[item._id]
                        return newProgress
                    })
                }, 500)
            }
        }, 1000)
        } catch (error) {
            console.error('Error in handleDownloadOPForm:', error)
            toast.error('Failed to generate OP Form. Please try again.', {
                hideProgressBar: true
            })
            setDownloadingOPForm(null)
            setOpFormProgress(prev => {
                const newProgress = { ...prev }
                delete newProgress[item._id]
                return newProgress
            })
        }
    }

    // Helper function to generate QR code SVG (simplified representation)
    // This QR code is COMPULSORY and must always be generated for the 2nd page
    const generateQRCodeSVG = (text) => {
        try {
            const qrData = `OP-${text ? text.substring(0, 12) : 'DEFAULT'}`
            // Create a more realistic QR code pattern
            const pattern = []
            for (let i = 0; i < 25; i++) {
                for (let j = 0; j < 25; j++) {
                    // Create a pattern that looks like a QR code
                    const shouldFill = (i + j) % 3 === 0 || (i * j) % 7 === 0 || i === 0 || j === 0 || i === 24 || j === 24
                    if (shouldFill) {
                        pattern.push(`<rect x="${j * 4 + 10}" y="${i * 4 + 10}" width="4" height="4" fill="#0c4a6e"/>`)
                    }
                }
            }
            return `
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                    <rect width="120" height="120" fill="white" stroke="#0ea5e9" stroke-width="2" rx="4"/>
                    <!-- QR Code Pattern -->
                    ${pattern.join('')}
                    <!-- Corner markers -->
                    <rect x="10" y="10" width="30" height="30" fill="#0c4a6e" rx="2"/>
                    <rect x="15" y="15" width="20" height="20" fill="white" rx="1"/>
                    <rect x="17" y="17" width="16" height="16" fill="#0c4a6e"/>
                    <rect x="80" y="10" width="30" height="30" fill="#0c4a6e" rx="2"/>
                    <rect x="85" y="15" width="20" height="20" fill="white" rx="1"/>
                    <rect x="87" y="17" width="16" height="16" fill="#0c4a6e"/>
                    <rect x="10" y="80" width="30" height="30" fill="#0c4a6e" rx="2"/>
                    <rect x="15" y="85" width="20" height="20" fill="white" rx="1"/>
                    <rect x="17" y="87" width="16" height="16" fill="#0c4a6e"/>
                </svg>
            `
        } catch (error) {
            console.error('Error generating QR code:', error)
            // Return a fallback QR code even if generation fails
            return `
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                    <rect width="120" height="120" fill="white" stroke="#0ea5e9" stroke-width="2" rx="4"/>
                    <rect x="10" y="10" width="30" height="30" fill="#0c4a6e" rx="2"/>
                    <rect x="15" y="15" width="20" height="20" fill="white" rx="1"/>
                    <rect x="17" y="17" width="16" height="16" fill="#0c4a6e"/>
                    <rect x="80" y="10" width="30" height="30" fill="#0c4a6e" rx="2"/>
                    <rect x="85" y="15" width="20" height="20" fill="white" rx="1"/>
                    <rect x="87" y="17" width="16" height="16" fill="#0c4a6e"/>
                    <rect x="10" y="80" width="30" height="30" fill="#0c4a6e" rx="2"/>
                    <rect x="15" y="85" width="20" height="20" fill="white" rx="1"/>
                    <rect x="17" y="87" width="16" height="16" fill="#0c4a6e"/>
                </svg>
            `
        }
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        setIsLoading(true)
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            // Sort by creation date (latest booked first)
            // Use createdAt if available, otherwise use _id (MongoDB ObjectId contains timestamp)
            const sortedAppointments = data.appointments.sort((a, b) => {
                // Try createdAt first
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt) - new Date(a.createdAt)
                }
                // Fallback to _id (MongoDB ObjectId contains creation timestamp)
                if (a._id && b._id) {
                    return b._id.localeCompare(a._id)
                }
                // Last resort: use slotDate + slotTime
                if (a.slotDate && b.slotDate) {
                    const dateCompare = b.slotDate.localeCompare(a.slotDate)
                    if (dateCompare !== 0) return dateCompare
                    if (a.slotTime && b.slotTime) {
                        return b.slotTime.localeCompare(a.slotTime)
                    }
                }
                return 0
            })
            setAppointments(sortedAppointments)
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
                                                disabled={downloadingOPForm === item._id}
                                                className="btn btn-secondary flex-1"
                                            >
                                                {downloadingOPForm === item._id ? (
                                                    <span className="font-semibold">
                                                        {opFormProgress[item._id] || 1}%
                                                    </span>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        OP Form
                                                    </>
                                                )}
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
                                                disabled={downloadingOPForm === item._id}
                                                className="btn btn-secondary flex-1"
                                            >
                                                {downloadingOPForm === item._id ? (
                                                    <span className="font-semibold">
                                                        {opFormProgress[item._id] || 1}%
                                                    </span>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        OP Form
                                                    </>
                                                )}
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

