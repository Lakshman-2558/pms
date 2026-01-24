import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo'

const Navbar = () => {
  const { dToken, setDToken, profileData, getProfileData } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch doctor profile data if not already loaded
  useEffect(() => {
    if (dToken && !profileData) {
      getProfileData()
    }
  }, [dToken, profileData, getProfileData])

  // Handle scroll for blur effect - only apply to main content area, not window
  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.querySelector('.main-content-area')
      if (mainContent) {
        setScrolled(mainContent.scrollTop > 10)
      }
    }
    
    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const mainContent = document.querySelector('.main-content-area')
      if (mainContent) {
        mainContent.addEventListener('scroll', handleScroll)
      }
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
      const mainContent = document.querySelector('.main-content-area')
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  // Get doctor/admin name and photo
  const adminName = aToken ? 'Admin User' : (dToken && profileData) ? profileData.name : 'User'
  const adminPhoto = aToken 
    ? 'https://ui-avatars.com/api/?name=' + encodeURIComponent(adminName) + '&background=667eea&color=fff&size=128'
    : (dToken && profileData && profileData.image) 
      ? profileData.image 
      : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(adminName) + '&background=667eea&color=fff&size=128'

  return (
    <div 
      className={`sticky top-0 z-20 flex justify-between items-center px-4 sm:px-4 lg:px-8 py-2.5 border-b border-white/30 transition-all duration-300 header ${
        scrolled 
          ? 'bg-white/95 shadow-lg' 
          : 'bg-white/90 shadow-sm'
      }`}
      style={{
        WebkitBackdropFilter: scrolled ? 'blur(8px)' : 'blur(4px)',
        backdropFilter: scrolled ? 'blur(8px)' : 'blur(4px)',
        height: '64px',
        minHeight: '64px',
        maxHeight: '64px'
      }}
    >
      <div className='flex items-center gap-2 sm:gap-3'>
        {/* Official MediChain Logo only (status + profile moved to sidebar) */}
        <div className='flex items-center'>
          <BrandLogo 
            size="medium" 
            variant="header" 
            clickable={true}
            className="mr-1 sm:mr-2"
          />
        </div>
      </div>

      {/* Right side intentionally left minimal to keep focus on sidebar profile */}
      <div className='flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-500'>
        <span className='hidden sm:inline'>Welcome back,</span>
        <span className='font-semibold text-gray-700'>{adminName}</span>
      </div>
    </div>
  )
}

export default Navbar
