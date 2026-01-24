import axios from 'axios'
import React, { useContext, useState, useMemo } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Generate stable random values for background particles (only once)
  const adminParticles = useMemo(() => 
    [...Array(15)].map(() => ({
      width: Math.random() * 100 + 20,
      height: Math.random() * 100 + 20,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5
    })), []
  )

  const doctorBubbles = useMemo(() => 
    [...Array(20)].map(() => ({
      width: Math.random() * 150 + 50,
      height: Math.random() * 150 + 50,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 8
    })), []
  )

  const doctorCrosses = useMemo(() => 
    [...Array(8)].map(() => ({
      fontSize: Math.random() * 40 + 30,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 25 + Math.random() * 10,
      delay: Math.random() * 10,
      rotation: Math.random() * 360
    })), []
  )

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const handleStateChange = (newState) => {
    if (newState === state) return
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setState(newState)
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!backendUrl) {
      toast.error('Backend URL not configured. Please check your environment variables.')
      return
    }

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
          toast.success('Login successful!')
          setTimeout(() => navigate('/admin-dashboard'), 500)
        } else {
          toast.error(data.message || 'Invalid credentials')
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
          toast.success('Login successful!')
          setTimeout(() => navigate('/doctor-dashboard'), 500)
        } else {
          toast.error(data.message || 'Invalid credentials')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check your backend URL and ensure the server is running.')
      } else {
        toast.error(error.response?.data?.message || error.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`h-screen h-dvh flex items-center justify-center relative overflow-hidden ${
      state === 'Admin' ? 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900' : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50'
    }`}>
      {/* ADMIN PANEL BACKGROUND - Animated Purple Theme */}
      {state === 'Admin' && (
        <>
          {/* Animated Gradient Background */}
          <div className='absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900'>
            <div className='absolute inset-0 bg-gradient-to-tr from-violet-900/50 via-transparent to-purple-800/50 animate-gradient-shift'></div>
          </div>

          {/* Animated Grid Pattern */}
          <div className='absolute inset-0 opacity-[0.05]' style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }} />

          {/* Floating Animated Particles */}
          {adminParticles.map((particle, i) => (
            <div
              key={i}
              className='absolute rounded-full bg-purple-400/20 blur-sm'
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `float-particle ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}

          {/* Rotating Geometric Shapes */}
          <div className='absolute top-0 right-0 w-96 h-96 opacity-10'>
            <div className='absolute top-20 right-20 w-64 h-64 border-2 border-purple-300/30 rounded-lg animate-rotate-slow' />
            <div className='absolute top-32 right-32 w-48 h-48 border-2 border-violet-300/20 rounded-lg animate-rotate-reverse' />
          </div>
          
          <div className='absolute bottom-0 left-0 w-96 h-96 opacity-10'>
            <div className='absolute bottom-20 left-20 w-64 h-64 border-2 border-purple-300/30 rounded-full animate-rotate-slow' />
            <div className='absolute bottom-32 left-32 w-48 h-48 border-2 border-violet-300/20 rounded-full animate-rotate-reverse' />
          </div>

          {/* Animated Light Rays */}
          <div className='absolute inset-0 opacity-15 overflow-hidden'>
            <div className='absolute top-1/4 left-1/4 w-px h-96 bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-pulse-slow' />
            <div className='absolute bottom-1/4 right-1/4 w-px h-96 bg-gradient-to-t from-transparent via-violet-400 to-transparent animate-pulse-slow' style={{ animationDelay: '1s' }} />
            <div className='absolute top-1/2 left-1/2 w-96 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse-slow' style={{ animationDelay: '2s' }} />
          </div>

          {/* Animated Wave Effect */}
          <div className='absolute bottom-0 left-0 right-0 h-1/3 opacity-20'>
            <svg className='absolute bottom-0 w-full h-full' viewBox='0 0 1200 400' preserveAspectRatio='none'>
              <path d='M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z' fill='url(#wave-gradient)' opacity='0.5'>
                <animate attributeName='d' dur='8s' repeatCount='indefinite' values='M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z;M0,200 Q300,300 600,200 T1200,200 L1200,400 L0,400 Z;M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z' />
              </path>
              <defs>
                <linearGradient id='wave-gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                  <stop offset='0%' stopColor='#a855f7' stopOpacity='0.8' />
                  <stop offset='100%' stopColor='#6366f1' stopOpacity='0.3' />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      )}

      {/* DOCTOR PANEL BACKGROUND - Animated Blue Theme */}
      {state === 'Doctor' && (
        <>
          {/* Animated Gradient Background */}
          <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50'>
            <div className='absolute inset-0 bg-gradient-to-tr from-blue-100/60 via-transparent to-cyan-100/60 animate-gradient-shift'></div>
          </div>

          {/* Animated Floating Bubbles */}
          {doctorBubbles.map((bubble, i) => (
            <div
              key={i}
              className='absolute rounded-full bg-blue-200/40 blur-xl'
              style={{
                width: `${bubble.width}px`,
                height: `${bubble.height}px`,
                left: `${bubble.left}%`,
                top: `${bubble.top}%`,
                animation: `float-bubble ${bubble.duration}s ease-in-out infinite`,
                animationDelay: `${bubble.delay}s`
              }}
            />
          ))}

          {/* Animated Wave Pattern */}
          <div className='absolute inset-0 opacity-30 overflow-hidden'>
            <svg className='absolute top-0 w-full h-full' viewBox='0 0 1200 800' preserveAspectRatio='none'>
              <path d='M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z' fill='url(#doctor-wave-gradient)' opacity='0.4'>
                <animate attributeName='d' dur='10s' repeatCount='indefinite' values='M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z;M0,400 Q300,500 600,400 T1200,400 L1200,800 L0,800 Z;M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z' />
              </path>
              <path d='M0,600 Q400,500 800,600 T1200,600 L1200,800 L0,800 Z' fill='url(#doctor-wave-gradient-2)' opacity='0.3'>
                <animate attributeName='d' dur='12s' repeatCount='indefinite' values='M0,600 Q400,500 800,600 T1200,600 L1200,800 L0,800 Z;M0,600 Q400,700 800,600 T1200,600 L1200,800 L0,800 Z;M0,600 Q400,500 800,600 T1200,600 L1200,800 L0,800 Z' />
              </path>
              <defs>
                <linearGradient id='doctor-wave-gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                  <stop offset='0%' stopColor='#3b82f6' stopOpacity='0.5' />
                  <stop offset='100%' stopColor='#06b6d4' stopOpacity='0.2' />
                </linearGradient>
                <linearGradient id='doctor-wave-gradient-2' x1='0%' y1='0%' x2='0%' y2='100%'>
                  <stop offset='0%' stopColor='#06b6d4' stopOpacity='0.4' />
                  <stop offset='100%' stopColor='#14b8a6' stopOpacity='0.1' />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Animated Medical Crosses */}
          {doctorCrosses.map((cross, i) => (
            <div
              key={i}
              className='absolute text-blue-300/20'
              style={{
                fontSize: `${cross.fontSize}px`,
                left: `${cross.left}%`,
                top: `${cross.top}%`,
                animation: `float-cross ${cross.duration}s ease-in-out infinite`,
                animationDelay: `${cross.delay}s`,
                transform: `rotate(${cross.rotation}deg)`
              }}
            >
              ✚
            </div>
          ))}

          {/* Animated Pulse Rings */}
          <div className='absolute top-1/4 right-1/4 w-64 h-64'>
            <div className='absolute inset-0 border-2 border-blue-300/30 rounded-full animate-pulse-ring'></div>
            <div className='absolute inset-0 border-2 border-cyan-300/20 rounded-full animate-pulse-ring' style={{ animationDelay: '1s' }}></div>
            <div className='absolute inset-0 border-2 border-teal-300/10 rounded-full animate-pulse-ring' style={{ animationDelay: '2s' }}></div>
          </div>

          <div className='absolute bottom-1/4 left-1/4 w-48 h-48'>
            <div className='absolute inset-0 border-2 border-cyan-300/30 rounded-full animate-pulse-ring'></div>
            <div className='absolute inset-0 border-2 border-teal-300/20 rounded-full animate-pulse-ring' style={{ animationDelay: '1.5s' }}></div>
          </div>
        </>
      )}

      {/* LOGIN FORM */}
      <form onSubmit={onSubmitHandler} className="relative w-full max-w-md p-4 sm:p-1 z-10">
        {state === 'Admin' ? (
          // ADMIN PANEL - Professional Design
          <>
            <div className='relative flex flex-col gap-5 items-start p-8 sm:p-10 bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl animate-fade-in'>
              <div className='w-full text-center mb-4'>
                <div className='mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white shadow-xl'>
                  <svg className='w-8 h-8' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                </div>
                <h2 className='text-3xl font-bold text-gray-800 mb-1'>Admin Login</h2>
                <p className='text-sm text-gray-500'>Hospital Management Portal</p>
              </div>

              <div className='w-full'>
                <label className='block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600'>Email</label>
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  disabled={isLoading}
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed' 
                  type="email" 
                  required 
                  placeholder="admin@hospital.com"
                />
              </div>

              <div className='w-full'>
                <label className='block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600'>Password</label>
                <div className='relative'>
                  <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password} 
                    disabled={isLoading}
                    className='w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed' 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors'
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <p className='w-full text-center text-sm text-gray-600'>
                Doctor Login?{' '}
                <span 
                  onClick={() => handleStateChange('Doctor')} 
                  className='text-purple-600 hover:text-violet-700 underline cursor-pointer transition-colors font-medium'
                >
                  Click here
                </span>
              </p>
            </div>
          </>
        ) : (
          // DOCTOR PANEL - Lifeline Symbol Theme
          <>
            <div className='absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 rounded-3xl blur-xl opacity-30'></div>
            <div className='relative flex flex-col gap-5 items-start p-8 sm:p-10 bg-white/95 backdrop-blur-xl rounded-3xl border border-blue-200/50 shadow-2xl animate-fade-in'>
              <div className='w-full text-center mb-4'>
                <div className='mx-auto mb-4 w-20 h-20 flex items-center justify-center'>
                  <svg className='w-20 h-20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    {/* Red Circle */}
                    <circle cx='12' cy='12' r='10' stroke='#dc2626' strokeWidth='2' fill='none'/>
                    {/* Red Cross */}
                    <rect x='10' y='6' width='4' height='12' rx='0.5' fill='#dc2626'/>
                    <rect x='6' y='10' width='12' height='4' rx='0.5' fill='#dc2626'/>
                  </svg>
                </div>
                <h2 className='text-3xl font-bold text-gray-800 mb-1'>Doctor Login</h2>
                <p className='text-sm text-gray-500'>Medical Professional Portal</p>
              </div>

              <div className='w-full'>
                <label className='block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600'>Email</label>
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  disabled={isLoading}
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed' 
                  type="email" 
                  required 
                  placeholder="doctor@hospital.com"
                />
              </div>

              <div className='w-full'>
                <div className='flex items-center justify-between mb-2'>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-gray-600'>Password</label>
                  {state === 'Doctor' && (
                    <button
                      type="button"
                      onClick={() => navigate('/doctor-forgot-password')}
                      className='text-xs text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline transition-colors'
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className='relative'>
                  <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password} 
                    disabled={isLoading}
                    className='w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed' 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors'
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <p className='w-full text-center text-sm text-gray-600'>
                Admin Login?{' '}
                <span 
                  onClick={() => handleStateChange('Admin')} 
                  className='text-blue-600 hover:text-cyan-700 underline cursor-pointer transition-colors font-medium'
                >
                  Click here
                </span>
              </p>
            </div>
          </>
        )}
      </form>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        /* Admin Panel Animations */
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translate(20px, -30px) scale(1.1);
            opacity: 0.4;
          }
          50% {
            transform: translate(-15px, -50px) scale(0.9);
            opacity: 0.3;
          }
          75% {
            transform: translate(30px, -20px) scale(1.05);
            opacity: 0.35;
          }
        }

        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }

        @keyframes rotate-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-rotate-reverse {
          animation: rotate-reverse 25s linear infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.15;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.25;
            transform: scaleY(1.2);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        /* Doctor Panel Animations */
        @keyframes float-bubble {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          33% {
            transform: translate(30px, -40px) scale(1.2);
            opacity: 0.6;
          }
          66% {
            transform: translate(-25px, -60px) scale(0.8);
            opacity: 0.3;
          }
        }

        @keyframes float-cross {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.2;
          }
          25% {
            transform: translate(15px, -20px) rotate(90deg);
            opacity: 0.3;
          }
          50% {
            transform: translate(-10px, -35px) rotate(180deg);
            opacity: 0.25;
          }
          75% {
            transform: translate(20px, -15px) rotate(270deg);
            opacity: 0.3;
          }
        }

        @keyframes float-medical-cross {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translate(25px, -30px) scale(1.1) rotate(15deg);
            opacity: 0.3;
          }
          50% {
            transform: translate(-20px, -50px) scale(0.9) rotate(-15deg);
            opacity: 0.25;
          }
          75% {
            transform: translate(30px, -25px) scale(1.05) rotate(10deg);
            opacity: 0.3;
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.8;
          }
        }

        .animate-pulse-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Login