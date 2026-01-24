import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import QRCode from 'react-qr-code'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

const PaymentPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { backendUrl, token, currencySymbol, userData } = useContext(AppContext)

    const [appointmentData, setAppointmentData] = useState(null)
    const [paymentStatus, setPaymentStatus] = useState('pending')
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('upi')
    const [transactionId, setTransactionId] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(180)
    const [merchantUPI, setMerchantUPI] = useState('')
    const [qrExpired, setQrExpired] = useState(false)

    // Card Fields
    const [cardNumber, setCardNumber] = useState('')
    const [cardName, setCardName] = useState('')
    const [cardExpiry, setCardExpiry] = useState('')
    const [cardCVV, setCardCVV] = useState('')

    // Net Banking
    const [selectedBank, setSelectedBank] = useState('')

    // Billing
    const [billingPhone, setBillingPhone] = useState('')
    const [billingEmail, setBillingEmail] = useState('')

    // Refs for intervals
    const paymentTimerRef = useRef(null)
    const pollingIntervalRef = useRef(null)
    const wsRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)

    const banks = [
        'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
        'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
        'Canara Bank', 'Union Bank of India', 'Indian Bank'
    ]

    // WEBSOCKET CONNECTION FOR REAL-TIME PAYMENT UPDATES
    const connectWebSocket = useCallback(() => {
        if (!appointmentData || !token) return

        const appointmentId = appointmentData.appointmentId || appointmentData._id || appointmentData.id
        if (!appointmentId) return

        // Close existing connection
        if (wsRef.current) {
            wsRef.current.close()
        }

        try {
            // Convert http/https to ws/wss
            const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws'
            const wsUrl = backendUrl.replace(/^https?:/, wsProtocol)
            const ws = new WebSocket(`${wsUrl}/payment-updates?appointmentId=${appointmentId}&token=${token}`)

            ws.onopen = () => {
                console.log('✅ WebSocket Connected - Real-time payment detection active')
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log('📨 WebSocket Message:', data)

                    if (data.type === 'PAYMENT_SUCCESS' && data.appointmentId === appointmentId) {
                        console.log('✅ Real-time payment detected via WebSocket!')
                        handlePaymentSuccess()
                    }
                } catch (error) {
                    console.error('WebSocket message parse error:', error)
                }
            }

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error)
            }

            ws.onclose = () => {
                console.log('🔌 WebSocket disconnected')
                // Auto-reconnect after 3 seconds if payment not completed
                if (paymentStatus === 'processing' && !qrExpired) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('🔄 Reconnecting WebSocket...')
                        connectWebSocket()
                    }, 3000)
                }
            }

            wsRef.current = ws
        } catch (error) {
            console.error('Failed to create WebSocket:', error)
            // Fallback to polling if WebSocket fails
            console.log('⚠️ WebSocket failed, using polling fallback')
            startPolling()
        }
    }, [appointmentData, token, backendUrl, paymentStatus, qrExpired])

    // POLLING FALLBACK (if WebSocket not available)
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
        }

        const appointmentId = appointmentData?.appointmentId || appointmentData?._id || appointmentData?.id
        if (!appointmentId || !token) return

        console.log('🔄 Starting payment polling (fallback)...')

        const pollPayment = async () => {
            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/user/appointment/${appointmentId}`,
                    { headers: { token }, timeout: 8000 }
                )

                if (data.success && data.appointment) {
                    const isPaid = data.appointment.payment === true ||
                        data.appointment.paymentStatus === 'paid' ||
                        data.appointment.paymentStatus === 'success'

                    if (isPaid) {
                        console.log('✅ Payment detected via polling!')
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current)
                            pollingIntervalRef.current = null
                        }
                        handlePaymentSuccess()
                    }
                }
            } catch (error) {
                console.error('Polling error:', error.message)
            }
        }

        // Poll immediately, then every 2 seconds
        pollPayment()
        pollingIntervalRef.current = setInterval(pollPayment, 2000)

        // Stop polling after 5 minutes
        setTimeout(() => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
            }
        }, 300000)
    }, [appointmentData, token, backendUrl])

    // Handle payment success
    const handlePaymentSuccess = useCallback(() => {
        // Clear all intervals and connections
        if (paymentTimerRef.current) {
            clearInterval(paymentTimerRef.current)
            paymentTimerRef.current = null
        }
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        setPaymentStatus('success')
        setIsProcessing(false)

        toast.success('Payment Successful! Redirecting...', {
            position: "top-center",
            autoClose: 2000,
        })

        setTimeout(() => {
            navigate('/my-appointments?paymentSuccess=true', { replace: true })
        }, 1500)
    }, [navigate])

    // Handle payment timeout
    const handlePaymentTimeout = useCallback(() => {
        if (paymentTimerRef.current) {
            clearInterval(paymentTimerRef.current)
            paymentTimerRef.current = null
        }
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        setQrExpired(true)
        setPaymentStatus('expired')
        setIsProcessing(false)

        toast.error('Payment session expired. QR code is no longer valid.', {
            position: "top-center",
            autoClose: 5000,
        })

        setTimeout(() => {
            navigate('/my-appointments')
        }, 3000)
    }, [navigate])

    // Handle cancel
    const handleCancelPayment = useCallback(() => {
        if (paymentTimerRef.current) {
            clearInterval(paymentTimerRef.current)
            paymentTimerRef.current = null
        }
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        setPaymentStatus('pending')
        setIsProcessing(false)

        toast.info('Payment cancelled. Redirecting...', {
            position: "top-center",
            autoClose: 2000,
        })

        setTimeout(() => {
            navigate('/my-appointments', { replace: true })
        }, 1500)
    }, [navigate])

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Payment timer
    useEffect(() => {
        if (appointmentData && paymentStatus !== 'success' && paymentStatus !== 'expired' && timeRemaining > 0) {
            if (paymentTimerRef.current) {
                clearInterval(paymentTimerRef.current)
            }

            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setTimeout(() => handlePaymentTimeout(), 0)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            paymentTimerRef.current = timer

            return () => {
                if (paymentTimerRef.current) {
                    clearInterval(paymentTimerRef.current)
                    paymentTimerRef.current = null
                }
            }
        }
    }, [appointmentData, paymentStatus, handlePaymentTimeout])

    // Start WebSocket/Polling when UPI is selected
    useEffect(() => {
        if (selectedPaymentMode === 'upi' &&
            appointmentData &&
            merchantUPI &&
            paymentStatus === 'pending' &&
            !qrExpired) {

            console.log('🚀 Starting UPI payment monitoring...')
            setPaymentStatus('processing')

            // Try WebSocket first, fallback to polling
            setTimeout(() => {
                connectWebSocket()
            }, 500)
        }

        return () => {
            if (selectedPaymentMode !== 'upi') {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current)
                    pollingIntervalRef.current = null
                }
                if (wsRef.current) {
                    wsRef.current.close()
                    wsRef.current = null
                }
            }
        }
    }, [selectedPaymentMode, appointmentData, merchantUPI, paymentStatus, qrExpired, connectWebSocket])

    // Page visibility handler
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('📱 Page visible - checking connection')
                if (selectedPaymentMode === 'upi' &&
                    paymentStatus === 'processing' &&
                    !qrExpired &&
                    (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
                    console.log('🔄 Reconnecting...')
                    connectWebSocket()
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [selectedPaymentMode, paymentStatus, qrExpired, connectWebSocket])

    // Load appointment data
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const paymentStatusParam = urlParams.get('status')
        const txnid = urlParams.get('txnid')
        const appointmentIdParam = urlParams.get('appointmentId')

        if (paymentStatusParam === 'success' || paymentStatusParam === 'SUCCESS') {
            const verifyPayUPayment = async () => {
                try {
                    const appointmentId = appointmentIdParam || appointmentData?.appointmentId || appointmentData?._id
                    if (!appointmentId) {
                        toast.error('Appointment ID not found')
                        return
                    }

                    const { data } = await axios.post(
                        backendUrl + '/api/user/payment-payu/verify',
                        { appointmentId: appointmentId.toString(), txnid, status: paymentStatusParam },
                        { headers: { token } }
                    )

                    if (data.success) {
                        toast.success('Payment verified successfully!')
                        setTimeout(() => handlePaymentSuccess(), 500)
                    } else {
                        toast.error(data.message || 'Payment verification failed')
                        setPaymentStatus('failed')
                    }
                } catch (error) {
                    console.error('Error verifying PayU payment:', error)
                    toast.error('Payment verification error')
                    setPaymentStatus('failed')
                }
            }

            verifyPayUPayment()
            return
        }

        if (appointmentData) return

        let data = null
        if (location.state?.appointmentData) {
            data = location.state.appointmentData
        } else {
            const storedData = sessionStorage.getItem('paymentAppointmentData')
            if (storedData) {
                try {
                    data = JSON.parse(storedData)
                    sessionStorage.removeItem('paymentAppointmentData')
                } catch (e) {
                    console.error('Error parsing stored payment data:', e)
                }
            }
        }

        if (data) {
            if (location.state?.appointmentId && !data.appointmentId && !data._id) {
                data.appointmentId = location.state.appointmentId
            }
            setAppointmentData(data)
            const txId = txnid || `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            setTransactionId(txId)

            if (userData) {
                setBillingPhone(userData.phone || '')
                setBillingEmail(userData.email || '')
                setCardName(userData.name || '')
            }
        } else {
            toast.error('No appointment data found')
            setTimeout(() => navigate('/'), 2000)
        }
    }, [])

    // Generate UPI URL
    const generateUPIUrl = (amount, vpa, merchantName, transactionId) => {
        try {
            const amountNum = parseFloat(amount)
            if (isNaN(amountNum) || amountNum <= 0) return ''

            const amountStr = amountNum.toFixed(2)
            const cleanUPI = (vpa || merchantUPI || '').trim().toLowerCase()

            if (!cleanUPI.includes('@')) return ''

            const payeeName = (merchantName || 'MediChain').substring(0, 25)
            const transactionNote = `Payment-${transactionId.substring(0, 30)}`

            const upiDeepLink = `upi://pay?pa=${encodeURIComponent(cleanUPI)}&pn=${encodeURIComponent(payeeName)}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(transactionNote)}`

            console.log('🔗 UPI QR Generated:', { upi: cleanUPI, amount: amountStr })
            return upiDeepLink
        } catch (error) {
            console.error('Error generating UPI URL:', error)
            return ''
        }
    }

    // Fetch merchant UPI
    useEffect(() => {
        const fetchMerchantUPI = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/user/payment/merchant-upi', { headers: { token } })
                if (data.success && data.merchantUPI) {
                    const upiId = data.merchantUPI.trim()
                    if (upiId.includes('@') && upiId.length > 5) {
                        setMerchantUPI(upiId.toLowerCase())
                        console.log('✅ Merchant UPI loaded:', upiId.toLowerCase())
                    } else {
                        toast.error('Invalid merchant UPI configuration')
                    }
                } else {
                    toast.error('Failed to load payment information')
                }
            } catch (error) {
                console.error('Error fetching merchant UPI:', error)
                toast.error('Failed to load payment information')
            }
        }

        if (token) fetchMerchantUPI()
    }, [token, backendUrl])

    // Format helpers
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const parts = []
        for (let i = 0; i < Math.min(v.length, 16); i += 4) {
            parts.push(v.substring(i, i + 4))
        }
        return parts.join(' ')
    }

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4)
        return v
    }

    // Handle Payment
    const handlePayment = async (e) => {
        e.preventDefault()

        if (qrExpired) {
            toast.error('Payment session expired. Please try again.')
            return
        }

        if (selectedPaymentMode === 'upi') {
            if (paymentStatus !== 'processing') {
                setPaymentStatus('processing')
                connectWebSocket()
                toast.info('Scan QR code. Payment will be detected automatically.', { autoClose: 5000 })
            }
            return
        } else if (selectedPaymentMode === 'debit') {
            if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
                toast.error('Please enter valid card number')
                return
            }
            if (!cardName || !cardExpiry || cardExpiry.length < 5 || !cardCVV || cardCVV.length < 3) {
                toast.error('Please fill all card details')
                return
            }
        } else if (selectedPaymentMode === 'netbanking') {
            if (!selectedBank) {
                toast.error('Please select a bank')
                return
            }
        }

        if (!billingPhone || !billingEmail) {
            toast.error('Please fill billing details')
            return
        }

        setIsProcessing(true)
        setPaymentStatus('processing')

        try {
            if (selectedPaymentMode !== 'upi') {
                handlePayUSubmit()
            }
        } catch (error) {
            console.error('Payment error:', error)
            toast.error('Payment processing failed')
            setPaymentStatus('failed')
        } finally {
            setIsProcessing(false)
        }
    }

    // Verify Payment Manually
    const verifyPayment = async () => {
        if (!appointmentData || qrExpired) {
            toast.error(qrExpired ? 'QR code expired' : 'Appointment data not found')
            return
        }

        setIsProcessing(true)

        try {
            const appointmentId = appointmentData.appointmentId || appointmentData._id
            if (!appointmentId) {
                toast.error('Appointment ID not found')
                setIsProcessing(false)
                return
            }

            console.log('🔍 Manually verifying payment...')

            // Use the payment verification endpoint
            const { data } = await axios.post(
                `${backendUrl}/api/user/payment-payu/verify`,
                {
                    appointmentId: appointmentId.toString(),
                    txnid: transactionId || `TXN${Date.now()}`,
                    status: 'success'
                },
                { headers: { token } }
            )

            console.log('Payment verification response:', data)

            if (data.success) {
                toast.success('Payment verified successfully!', {
                    position: "top-center",
                    autoClose: 2000
                })
                // Clear stored payment data
                sessionStorage.removeItem('paymentAppointmentData')
                setTimeout(() => {
                    handlePaymentSuccess()
                }, 1000)
            } else {
                toast.error(data.message || 'Payment verification failed')
                setPaymentStatus('failed')
                setIsProcessing(false)
            }
        } catch (error) {
            console.error('Verification error:', error)
            toast.error('Payment verification failed. Please try again.')
            setPaymentStatus('failed')
            setIsProcessing(false)
        }
    }

    // PayU Submit
    const handlePayUSubmit = async () => {
        try {
            setIsProcessing(true)
            const amount = appointmentData.price || appointmentData.costBreakdown?.total || 0
            const productinfo = `Appointment with ${appointmentData.doctorName}`
            const firstname = cardName || appointmentData.patientName?.split(' ')[0] || 'Patient'
            const email = billingEmail || 'test@example.com'
            const phone = billingPhone || '9999999999'

            let pg = 'CC'
            if (selectedPaymentMode === 'netbanking') pg = 'NB'
            else if (selectedPaymentMode === 'debit') pg = 'DC'

            let appointmentId = location.state?.appointmentId || appointmentData.appointmentId || appointmentData._id

            if (!appointmentId) {
                toast.error('Appointment ID not found')
                setIsProcessing(false)
                return
            }

            const { data } = await axios.post(
                backendUrl + '/api/user/payment-payu/init',
                {
                    appointmentId, amount, productinfo, firstname, email, phone, pg,
                    bankcode: selectedPaymentMode === 'netbanking' && selectedBank ?
                        selectedBank.toLowerCase().replace(/\s+/g, '') : undefined
                },
                { headers: { token } }
            )

            if (!data.success) {
                toast.error(data.message || 'Failed to initialize payment')
                setIsProcessing(false)
                return
            }

            const payuForm = document.createElement('form')
            payuForm.method = 'POST'
            payuForm.action = data.paymentData.payuUrl

            Object.keys(data.paymentData).forEach(key => {
                if (key !== 'payuUrl') {
                    const input = document.createElement('input')
                    input.type = 'hidden'
                    input.name = key
                    input.value = data.paymentData[key]
                    payuForm.appendChild(input)
                }
            })

            document.body.appendChild(payuForm)
            toast.info('Redirecting to payment gateway...', { autoClose: 2000 })
            setTimeout(() => payuForm.submit(), 500)
        } catch (error) {
            console.error('PayU error:', error)
            toast.error(error?.response?.data?.message || 'Failed to initialize payment')
            setIsProcessing(false)
        }
    }

    const amount = appointmentData ? (appointmentData.price || appointmentData.costBreakdown?.total || 0) : 0
    const upiUrl = useMemo(() => {
        if (!merchantUPI || !transactionId || !amount || amount === 0 || qrExpired) return ''
        return generateUPIUrl(amount, merchantUPI, 'MediChain', transactionId)
    }, [amount, merchantUPI, transactionId, qrExpired])

    // Cleanup
    useEffect(() => {
        return () => {
            if (paymentTimerRef.current) clearInterval(paymentTimerRef.current)
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
            if (wsRef.current) wsRef.current.close()
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
        }
    }, [])

    if (!appointmentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment details...</p>
                </div>
            </div>
        )
    }

    const paymentModes = [
        { id: 'upi', label: 'UPI Payment', icon: '📱' },
        { id: 'netbanking', label: 'Net Banking', icon: '🌐' },
        { id: 'debit', label: 'Debit Card', icon: '💳' }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold">MediChain Payment</h1>
                    </div>
                    {!qrExpired && paymentStatus !== 'success' && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining <= 60 ? 'bg-red-50 border border-red-300' :
                                timeRemaining <= 120 ? 'bg-yellow-50 border border-yellow-300' :
                                    'bg-blue-50 border border-blue-200'
                            }`}>
                            <svg className={`w-5 h-5 ${timeRemaining <= 60 ? 'text-red-600' :
                                    timeRemaining <= 120 ? 'text-yellow-600' : 'text-blue-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={`text-sm font-bold ${timeRemaining <= 60 ? 'text-red-600' :
                                    timeRemaining <= 120 ? 'text-yellow-600' : 'text-blue-600'
                                }`}>{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Payment Modes */}
                    <div className="w-full lg:w-80">
                        <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white shadow-xl">
                            <h2 className="text-sm font-bold mb-6 uppercase tracking-wider text-green-300">Payment Mode</h2>
                            <div className="space-y-3">
                                {paymentModes.map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setSelectedPaymentMode(mode.id)}
                                        disabled={qrExpired && mode.id === 'upi'}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-left ${selectedPaymentMode === mode.id
                                                ? 'bg-blue-600 shadow-lg scale-[1.02]'
                                                : 'bg-blue-700/60 hover:bg-blue-700/80'
                                            } ${qrExpired && mode.id === 'upi' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="text-3xl">{mode.icon}</span>
                                        <span className="font-semibold flex-1">{mode.label}</span>
                                        {selectedPaymentMode === mode.id && (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {paymentModes.find(m => m.id === selectedPaymentMode)?.label}
                            </h2>

                            <form onSubmit={handlePayment} className="space-y-6">
                                {/* UPI */}
                                {selectedPaymentMode === 'upi' && (
                                    <>
                                        {qrExpired ? (
                                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                                                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-xl font-bold text-red-900 mb-2">QR Code Expired</h3>
                                                <p className="text-red-700 mb-4">This QR code is no longer valid. Payment cannot be processed.</p>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/my-appointments')}
                                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                                                >
                                                    Back to Appointments
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg border-2 border-blue-200">
                                                    <div className="text-center mb-4">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Scan QR Code to Pay</h3>
                                                        <p className="text-sm text-gray-600">Open any UPI app and scan this code</p>
                                                    </div>
                                                    <div className="flex justify-center mb-4">
                                                        <div className="bg-white p-6 rounded-xl shadow-lg border-4 border-white">
                                                            {upiUrl && merchantUPI ? (
                                                                <div className="w-[300px] h-[300px]">
                                                                    <QRCode
                                                                        value={upiUrl}
                                                                        size={300}
                                                                        level="H"
                                                                        style={{ height: "auto", width: "100%" }}
                                                                        bgColor="#FFFFFF"
                                                                        fgColor="#000000"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100">
                                                                    <p className="text-sm text-gray-500">Generating QR...</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-500 mb-1">
                                                            Amount: <span className="font-bold text-gray-900">{currencySymbol}{amount}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Pay to: <span className="font-semibold text-blue-600">{merchantUPI}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold text-blue-900 mb-1">Real-time Payment Detection Active</p>
                                                            <p className="text-xs text-blue-700">
                                                                Once you complete payment in your UPI app, you'll be automatically redirected.
                                                                No need to click any button!
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Debit Card */}
                                {selectedPaymentMode === 'debit' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Card Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Cardholder Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                                placeholder="JOHN DOE"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Expiry Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                    placeholder="MM/YY"
                                                    maxLength="5"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    CVV <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cardCVV}
                                                    onChange={(e) => setCardCVV(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                                                    placeholder="123"
                                                    maxLength="3"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Net Banking */}
                                {selectedPaymentMode === 'netbanking' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Select Bank <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={selectedBank}
                                                onChange={(e) => setSelectedBank(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            >
                                                <option value="">-- Select Your Bank --</option>
                                                {banks.map((bank, index) => (
                                                    <option key={index} value={bank}>{bank}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-blue-800">
                                                You will be redirected to your bank's secure payment page.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Billing Details */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={billingPhone}
                                                onChange={(e) => setBillingPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                                                placeholder="9999999999"
                                                maxLength="10"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={billingEmail}
                                                onChange={(e) => setBillingEmail(e.target.value)}
                                                placeholder="email@example.com"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                {selectedPaymentMode !== 'upi' && !qrExpired && (
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/')}
                                            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processing...' : 'Pay Now'}
                                        </button>
                                    </div>
                                )}

                                {/* UPI Status */}
                                {selectedPaymentMode === 'upi' && paymentStatus === 'processing' && !qrExpired && (
                                    <div className="pt-4">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="relative">
                                                    <div className="w-5 h-5 bg-green-500 rounded-full animate-ping absolute"></div>
                                                    <div className="w-5 h-5 bg-green-600 rounded-full relative"></div>
                                                </div>
                                                <p className="text-sm font-bold text-green-900">Waiting for Payment...</p>
                                            </div>
                                            <p className="text-xs text-green-800">
                                                🔄 Real-time detection active. Complete payment in your UPI app and you'll be automatically redirected.
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={verifyPayment}
                                                disabled={isProcessing}
                                                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Checking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Check Payment Status
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelPayment}
                                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 text-center">
                                    By proceeding, you agree to our Terms & Conditions
                                </p>
                            </form>
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction Summary</h3>
                                <div className="space-y-4 mb-6">
                                    <div className="pb-4 border-b">
                                        <p className="text-sm text-gray-600 mb-2">Amount Payable</p>
                                        <p className="text-3xl font-bold text-blue-600">{currencySymbol}{amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">TRANSACTION ID</p>
                                        <p className="text-sm font-mono text-gray-900 break-all">{transactionId}</p>
                                    </div>
                                    {appointmentData && (
                                        <div className="pt-4 border-t">
                                            <p className="text-xs text-gray-500 mb-2">Appointment Details</p>
                                            <div className="space-y-1 text-sm">
                                                <p className="text-gray-700">
                                                    <span className="font-semibold">Patient:</span> {appointmentData.patientName}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-semibold">Doctor:</span> {appointmentData.doctorName}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-semibold">Date:</span> {appointmentData.date}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-semibold">Time:</span> {appointmentData.time}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-xs text-gray-500 mb-3 text-center">Secured by</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-xs text-gray-400">🔒 SSL</span>
                                        <span className="text-xs text-gray-400">🛡️ Secure</span>
                                        <span className="text-xs text-gray-400">✓ Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {paymentStatus === 'success' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
                        <p className="text-gray-600 mb-6">Your appointment has been confirmed.</p>
                        {transactionId && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                                <p className="text-sm font-mono text-gray-900 break-all">{transactionId}</p>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <p className="text-sm font-medium">Redirecting to appointments...</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Failed */}
            {paymentStatus === 'failed' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 right-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 shadow-lg max-w-sm z-50"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-red-900">Payment Failed</p>
                            <p className="text-sm text-red-700">Please try again</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default PaymentPage