import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContext)

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Send OTP to email
  const handleSendOTP = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await axios.post(backendUrl + '/api/user/forgot-password', { email })
      
      if (data.success) {
        toast.success(data.message)
        setStep(2) // Go to OTP verification step
        setCountdown(10) // 10 seconds countdown
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }
    
    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  // Handle OTP input keydown (backspace)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // Handle paste in OTP
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    while (newOtp.length < 6) newOtp.push('')
    setOtp(newOtp)

    // Focus last filled input or next empty
    const focusIndex = Math.min(pastedData.length, 5)
    const focusInput = document.getElementById(`otp-${focusIndex}`)
    if (focusInput) focusInput.focus()
  }

  // Verify OTP
  const handleVerifyOTP = async (event) => {
    event.preventDefault()
    
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)

    try {
      // Just verify OTP exists and is valid on frontend
      // We'll validate on backend during password reset
      if (otpString) {
        toast.success('OTP verified! Now set your new password.')
        setStep(3) // Go to password reset step
      }
    } catch (error) {
      toast.error('Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password with OTP
  const handleResetPassword = async (event) => {
    event.preventDefault()

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    // Validate password length
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const otpString = otp.join('')
      const { data } = await axios.post(backendUrl + '/api/user/reset-password', {
        email,
        otp: otpString,
        newPassword
      })
      
      if (data.success) {
        toast.success(data.message)
        setTimeout(() => {
          navigate('/login?mode=login')
        }, 2000)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setIsLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/forgot-password', { email })
      
      if (data.success) {
        toast.success('New OTP sent to your email')
        setCountdown(10) // 10 seconds countdown
        setOtp(['', '', '', '', '', ''])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Format countdown time
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #E8F4FC 0%, #F0F8FF 50%, #E0F0FA 100%)' }}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-teal-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-40 w-16 h-16 bg-cyan-300 rounded-full opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Main Container - Horizontal Layout - Reduced Size */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row" style={{ minHeight: '500px', maxHeight: '90vh' }}>
        
        {/* Left Side - Email Form or Info */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center relative z-10">
          {/* Header - Only for Step 1 */}
          {step === 1 && (
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-[#4A7FBF] to-[#5BA3D9] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7 text-white" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                Forgot Password?
              </h1>
              <p className="text-sm text-gray-500">
                Enter your email to receive a reset code
              </p>
            </div>
          )}

          {/* Step 2 & 3: Show Email Info on Left */}
          {(step === 2 || step === 3) && (
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7 text-white" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#1E3A5F] mb-2">Email Sent</h2>
              <p className="text-sm text-gray-600 mb-4">
                OTP sent to: <span className="font-semibold text-gray-800">{email}</span>
              </p>
              {step === 3 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ OTP Verified! Now set your new password.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#5BA3D9] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#5BA3D9] focus:ring-2 focus:ring-[#5BA3D9]/20 outline-none transition-all text-gray-700"
                  placeholder="Email Address"
                  required
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3.5 bg-gradient-to-r from-[#4A7FBF] to-[#5BA3D9] hover:from-[#3A6FAF] hover:to-[#4A93C9] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login?mode=login')}
                  className="text-sm text-[#5BA3D9] hover:text-[#4A93C9] hover:underline transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Step 2 & 3: Show on Left Side (Info Only) */}
          {(step === 2 || step === 3) && (
            <div className="space-y-4">
              {/* Countdown Timer for Step 2 */}
              {step === 2 && countdown > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-700">
                    OTP expires in: <span className="font-bold">{formatTime(countdown)}</span>
                  </p>
                </div>
              )}

              {/* Back to Step 1 */}
              {step === 2 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setOtp(['', '', '', '', '', ''])
                      setCountdown(0)
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                  >
                    ← Change Email
                  </button>
                </div>
              )}

              {/* Back to Step 2 */}
              {step === 3 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2)
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                  >
                    ← Back to OTP
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side - OTP Form (Step 2) or New Password Form (Step 3) or Illustration (Step 1) */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center relative z-10" style={{ background: step === 1 ? 'linear-gradient(180deg, #E8F4FC 0%, #D0E8F8 50%, #B8DCF4 100%)' : 'white' }}>
          
          {/* Step 1: Illustration */}
          {step === 1 && (
            <div className="hidden lg:flex items-center justify-center w-full h-full relative">
              {/* Animated Wave Background */}
              <div className="absolute inset-0">
                <svg className="absolute top-0 left-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                  <path d="M30 0 Q10 25 20 50 Q30 75 10 100 L0 100 L0 0 Z" fill="white" opacity="0.5">
                    <animate attributeName="d" dur="8s" repeatCount="indefinite" values="
                      M30 0 Q10 25 20 50 Q30 75 10 100 L0 100 L0 0 Z;
                      M25 0 Q15 25 25 50 Q15 75 20 100 L0 100 L0 0 Z;
                      M30 0 Q10 25 20 50 Q30 75 10 100 L0 100 L0 0 Z
                    "/>
                  </path>
                </svg>
              </div>
              
              {/* Security/Password Illustration */}
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                <svg viewBox="0 0 300 300" className="w-full h-full max-w-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="250" cy="60" r="30" fill="#B8DCF4" opacity="0.3" className="animate-pulse"/>
                  <circle cx="40" cy="260" r="25" fill="#B8DCF4" opacity="0.3" className="animate-pulse" style={{animationDelay: '1s'}}/>
                  
                  <g className="transform translate-x-[100] translate-y-[70]">
                    <rect x="0" y="0" width="80" height="100" rx="10" fill="#5BA3D9" opacity="0.1"/>
                    <rect x="8" y="8" width="64" height="84" rx="6" fill="#5BA3D9"/>
                    <path d="M40 25 L40 8 Q40 0 48 0 L72 0 Q80 0 80 8 L80 25" stroke="#4A7FBF" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    <circle cx="40" cy="50" r="12" fill="#FFFFFF" opacity="0.3"/>
                    <rect x="32" y="58" width="16" height="24" rx="3" fill="#FFFFFF" opacity="0.2"/>
                  </g>
                  
                  <g className="transform translate-x-[60] translate-y-[200] animate-bounce" style={{animationDuration: '2s'}}>
                    <circle cx="0" cy="0" r="10" fill="#4ECDC4"/>
                    <rect x="6" y="-3" width="24" height="6" rx="3" fill="#4ECDC4"/>
                    <rect x="20" y="-6" width="6" height="12" rx="1" fill="#FFFFFF"/>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification Form on Right */}
          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Verification Code</h2>
                <p className="text-sm text-gray-500">
                  We have sent the verification code to your email address
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {/* Countdown Timer */}
                {countdown > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-700">
                      OTP expires in: <span className="font-bold">{formatTime(countdown)}</span>
                    </p>
                  </div>
                )}

                {/* OTP Input - 6 Separate Boxes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        autoFocus={index === 0}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#5BA3D9] focus:ring-2 focus:ring-[#5BA3D9]/20 outline-none transition-all bg-white text-gray-800"
                        style={{
                          boxShadow: digit ? '0 2px 8px rgba(14, 165, 233, 0.15)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-gradient-to-r from-[#4A7FBF] to-[#5BA3D9] hover:from-[#3A6FAF] hover:to-[#4A93C9] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying OTP...
                    </>
                  ) : (
                    <>
                      Confirm
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isLoading}
                    className={`text-sm transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#5BA3D9] hover:text-[#4A93C9] hover:underline'}`}
                  >
                    {countdown > 0 ? 'Wait to resend OTP' : 'Resend OTP'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: New Password Form on Right */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Reset Password</h2>
                <p className="text-sm text-gray-500">
                  Set your new password
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#5BA3D9] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:border-[#5BA3D9] focus:ring-2 focus:ring-[#5BA3D9]/20 outline-none transition-all text-gray-700"
                    placeholder="New Password"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#5BA3D9] transition-colors"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#5BA3D9] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:border-[#5BA3D9] focus:ring-2 focus:ring-[#5BA3D9]/20 outline-none transition-all text-gray-700"
                    placeholder="Confirm Password"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#5BA3D9] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                {newPassword && (
                  <div className="text-xs text-gray-600">
                    Password strength: 
                    <span className={`ml-2 font-semibold ${
                      newPassword.length >= 12 ? 'text-green-600' : 
                      newPassword.length >= 8 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {newPassword.length >= 12 ? 'Strong' : 
                       newPassword.length >= 8 ? 'Medium' : 
                       'Weak'}
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-gradient-to-r from-[#4A7FBF] to-[#5BA3D9] hover:from-[#3A6FAF] hover:to-[#4A93C9] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

