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
      <div className='relative -mt-24 mb-0'>
        {/* Upward pointing ^ shape - connects to shield */}
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none" style={{ height: '120px' }}>
          {/* ^ shape pointing upward - connects to shield bottom */}
          <path
            fill="#BFDBFE"
            d="M0,120 L720,20 L1440,120 L1440,120 L0,120 Z"
          />
        </svg>

        {/* Shield Logo - Positioned at the peak of ^ shape, centered between the two sections */}
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20'>
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
            <h3 className='text-base font-semibold text-gray-700 mb-4'>
              medchain Medical &<br />Healthcare Center
            </h3>

            <div className='space-y-3 text-sm text-gray-700'>
              <div className='flex items-start gap-3'>
                <div className='w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <a 
                  href="https://www.google.com/maps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className='leading-relaxed text-gray-700 hover:text-blue-700 transition-colors duration-200 cursor-pointer'
                >
                  123 Anywhere St., Any City 12345
                </a>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0'>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <a 
                  href="tel:+1234567890" 
                  className='text-gray-700 hover:text-blue-700 transition-colors duration-200 cursor-pointer'
                >
                  123-456-7890
                </a>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0'>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <a 
                  href="mailto:contact@medchain.com" 
                  className='text-gray-700 hover:text-blue-700 transition-colors duration-200 cursor-pointer'
                >
                  contact@medchain.com
                </a>
              </div>
            </div>
          </div>

          {/* About Us Section */}
          <div className='space-y-4'>
            <h3 className='text-base font-semibold text-gray-700'>
              About Us
            </h3>
            <ul className='space-y-2.5'>
              <li>
                <button
                  onClick={() => handleNavClick('/collaborated-hospitals')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  Departments
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/doctors')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/my-appointments')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  Timetable
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/doctors')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/about')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  Testimonials
                </button>
              </li>
            </ul>
          </div>

          {/* Blog Section */}
          <div className='space-y-4'>
            <h3 className='text-base font-semibold text-gray-700'>
              Blog
            </h3>
            <ul className='space-y-2.5'>
              <li>
                <button
                  onClick={() => handleNavClick('/contact')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/contact')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/privacy-policy')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/data-security')}
                  className='text-gray-700 hover:text-blue-700 text-sm transition-colors duration-200 cursor-pointer'
                >
                  Terms and Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className='space-y-4'>
            <h3 className='text-xl font-bold text-gray-800'>
              Be Our Subscribers
            </h3>
            <p className='text-sm text-gray-700 leading-relaxed'>
              to get the latest news about health from our experts
            </p>

            <form onSubmit={handleSubmit} className='mt-4'>
              <div className='flex gap-2'>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className='flex-1 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border-none text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  required
                />
                <button
                  type="submit"
                  className='px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 shadow-md'
                >
                  Submit
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
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