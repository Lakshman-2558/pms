import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  // Handle navigation with scroll to top
  const handleNavClick = (path) => {
    navigate(path)
    window.scrollTo(0, 0)
  }

  // Handle newsletter submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      alert('Thank you for subscribing!')
      setEmail('')
    }
  }

  return (
    <footer className='bg-white text-gray-800 w-full relative overflow-hidden'>
      {/* Top Section with Hexagons */}
      <div className='relative bg-gradient-to-b from-gray-50 to-white pt-8 pb-24 px-4'>
        {/* Large Hexagon Pattern - Left Side */}
        <div className='absolute left-8 sm:left-16 lg:left-24 top-12 opacity-15'>
          <svg width="350" height="350" viewBox="0 0 350 350" className="text-blue-300">
            <polygon points="50,25 85,5 120,25 120,65 85,85 50,65" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="120,25 155,5 190,25 190,65 155,85 120,65" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="190,25 225,5 260,25 260,65 225,85 190,65" fill="none" stroke="currentColor" strokeWidth="4" />

            <polygon points="15,85 50,65 85,85 85,125 50,145 15,125" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="85,85 120,65 155,85 155,125 120,145 85,125" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="155,85 190,65 225,85 225,125 190,145 155,125" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="225,85 260,65 295,85 295,125 260,145 225,125" fill="none" stroke="currentColor" strokeWidth="4" />

            <polygon points="50,145 85,125 120,145 120,185 85,205 50,185" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="120,145 155,125 190,145 190,185 155,205 120,185" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="190,145 225,125 260,145 260,185 225,205 190,185" fill="none" stroke="currentColor" strokeWidth="4" />

            <polygon points="15,205 50,185 85,205 85,245 50,265 15,245" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="85,205 120,185 155,205 155,245 120,265 85,245" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="155,205 190,185 225,205 225,245 190,265 155,245" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>

        {/* Large Hexagon Pattern - Right Side */}
        <div className='absolute right-8 sm:right-16 lg:right-24 top-12 opacity-15'>
          <svg width="350" height="350" viewBox="0 0 350 350" className="text-blue-300">
            <polygon points="50,25 85,5 120,25 120,65 85,85 50,65" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="120,25 155,5 190,25 190,65 155,85 120,65" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="190,25 225,5 260,25 260,65 225,85 190,65" fill="none" stroke="currentColor" strokeWidth="4" />

            <polygon points="15,85 50,65 85,85 85,125 50,145 15,125" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="85,85 120,65 155,85 155,125 120,145 85,125" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="155,85 190,65 225,85 225,125 190,145 155,125" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="225,85 260,65 295,85 295,125 260,145 225,125" fill="none" stroke="currentColor" strokeWidth="4" />

            <polygon points="50,145 85,125 120,145 120,185 85,205 50,185" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="120,145 155,125 190,145 190,185 155,205 120,185" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="190,145 225,125 260,145 260,185 225,205 190,185" fill="none" stroke="currentColor" strokeWidth="4" />

            <polygon points="15,205 50,185 85,205 85,245 50,265 15,245" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="85,205 120,185 155,205 155,245 120,265 85,245" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon points="155,205 190,185 225,205 225,245 190,265 155,245" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>
      </div>

      {/* Upward ^ Shape with Shield Logo in the Middle */}
      <div className='relative -mt-24 mb-0 pointer-events-none'>
        {/* Upward pointing ^ shape - connects to shield */}
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none" style={{ height: '120px' }}>
          {/* ^ shape pointing upward - connects to shield bottom */}
          <path
            fill="#BFDBFE"
            d="M0,120 L720,20 L1440,120 L1440,120 L0,120 Z"
          />
        </svg>

        {/* Shield Logo - Positioned at the peak of ^ shape, centered between the two sections */}
        <div className='absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto'>
          <div className='relative'>
            {/* Shield SVG */}
            <svg width="200" height="220" viewBox="0 0 220 240" className="drop-shadow-2xl">
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Shield shape */}
              <path
                d="M110,15 L190,45 L190,120 Q190,180 110,225 Q30,180 30,120 L30,45 Z"
                fill="url(#shieldGradient)"
                stroke="white"
                strokeWidth="5"
              />
            </svg>

            {/* Shield Content - Medical Icon and Text */}
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              {/* Medical Shield Icon */}
              <div className='w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center mb-3'>
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className='text-white font-bold text-xl tracking-wide'>medchain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className='w-full px-4 sm:px-6 lg:px-12 py-12 lg:py-16 bg-gradient-to-b from-blue-200 to-blue-300'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-7xl mx-auto'>

          {/* Company Info Section */}
          <div className='space-y-5'>
            {/* Logo */}
            <div className='flex items-center gap-2 mb-4'>
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-cyan-500">
                <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.2" />
                <path d="M20 8 L28 12 L28 22 Q28 28 20 32 Q12 28 12 22 L12 12 Z" fill="currentColor" />
                <path d="M20 15 L20 25 M15 20 L25 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className='text-2xl font-bold text-gray-800'>MediChain</span>
            </div>

            <p className='text-sm text-gray-700 leading-relaxed'>
              MediChain is a secure, transparent, and modern healthcare management system. We connect patients with trusted doctors, ensuring seamless appointments, secure medical records, and comprehensive healthcare solutions.
            </p>

            {/* Social Media Icons */}
            <div className='flex gap-3 mt-4'>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className='w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all duration-200 transform hover:scale-110'
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className='w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center transition-all duration-200 transform hover:scale-110'
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 flex items-center justify-center transition-all duration-200 transform hover:scale-110'
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className='w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center transition-all duration-200 transform hover:scale-110'
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* About Us Section */}
          <div className='space-y-4'>
            <h3 className='text-base font-semibold text-gray-800'>
              About Us
            </h3>
            <ul className='space-y-2.5'>
              <li>
                <button
                  onClick={() => handleNavClick('/')}
                  className='text-gray-700 hover:text-cyan-600 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2'
                >
                  <span className='text-gray-400'>›</span> Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/all-doctors')}
                  className='text-gray-700 hover:text-cyan-600 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2'
                >
                  <span className='text-gray-400'>›</span> All Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/about')}
                  className='text-gray-700 hover:text-cyan-600 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2'
                >
                  <span className='text-gray-400'>›</span> About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/my-appointments')}
                  className='text-gray-700 hover:text-cyan-600 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2'
                >
                  <span className='text-gray-400'>›</span> My Appointments
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/my-profile')}
                  className='text-gray-700 hover:text-cyan-600 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2'
                >
                  <span className='text-gray-400'>›</span> My Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className='space-y-4'>
            <h3 className='text-base font-semibold text-gray-800'>
              Resources
            </h3>
            <ul className='space-y-2.5'>
              <li>
                <button
                  onClick={() => handleNavClick('/contact')}
                  className='text-gray-700 hover:text-cyan-600 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2'
                >
                  <span className='text-gray-400'>›</span> Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/privacy-policy')}
                  className='text-gray-700 hover:text-cyan-600 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2'
                >
                  <span className='text-gray-400'>›</span> Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/data-security')}
                  className='text-gray-700 hover:text-cyan-600 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2'
                >
                  <span className='text-gray-400'>›</span> Data Security
                </button>
              </li>
            </ul>
          </div>

          {/* Get In Touch Section */}
          <div className='space-y-4'>
            <h3 className='text-base font-semibold text-gray-800'>
              GET IN TOUCH
            </h3>
            <div className='space-y-4'>
              {/* Phone */}
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0'>
                  <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <p className='text-xs text-gray-600 uppercase tracking-wide mb-1'>PHONE</p>
                  <a
                    href="tel:+916309497466"
                    className='text-sm text-gray-800 hover:text-cyan-600 transition-colors duration-200 font-medium'
                  >
                    +91 6309497466
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0'>
                  <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className='text-xs text-gray-600 uppercase tracking-wide mb-1'>EMAIL</p>
                  <a
                    href="mailto:medichain123@gmail.com"
                    className='text-sm text-gray-800 hover:text-cyan-600 transition-colors duration-200 font-medium break-words'
                  >
                    medichain123@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className='bg-blue-300/70 w-full py-4 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-gray-700 text-sm'>
            Copyright © 2025 medchain. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer