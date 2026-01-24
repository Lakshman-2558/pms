import React, { useState, useEffect } from 'react'

const ScrollToTop = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-5 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-500 ease-in-out hover:scale-110 ${
        showScrollTop 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ zIndex: 999998 }}
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <svg 
        className="w-4 h-4 transition-transform duration-500 ease-in-out hover:-translate-y-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )
}

export default ScrollToTop

