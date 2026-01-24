import React from 'react'

const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/20 backdrop-blur-xl 
        border border-white/30 
        rounded-2xl 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        ${hover ? 'hover:shadow-[0_8px_36px_0_rgba(31,38,135,0.42)] transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default GlassCard

