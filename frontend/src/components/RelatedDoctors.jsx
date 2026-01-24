import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { getExperienceBadge } from '../utils/experienceBadge'

const RelatedDoctors = ({ speciality, docId }) => {
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)
    const [relDoc, setRelDoc] = useState([])

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            // Filter out null/undefined doctors and filter by specialty
            // Also ensure each doctor has required properties
            const doctorsData = doctors
                .filter((doc) => {
                    // Ensure doc exists and has required properties
                    if (!doc || !doc._id || !doc.name) return false
                    // Filter by specialty
                    if (doc.speciality !== speciality) return false
                    // Exclude current doctor
                    if (doc._id === docId) return false
                    // Ensure available property exists (set default if missing)
                    if (doc.available === undefined || doc.available === null) {
                        doc.available = true // Default to available for booking
                    }
                    return true
                })
            // Sort: Available doctors first, then unavailable
            doctorsData.sort((a, b) => {
                // Enhanced null safety check
                if (!a || !b) return 0
                // Safely access available property (already ensured to exist above)
                const aAvailable = a.available === true || a.available === 'true'
                const bAvailable = b.available === true || b.available === 'true'
                if (aAvailable === bAvailable) return 0
                return aAvailable ? -1 : 1
            })
            setRelDoc(doctorsData)
        } else {
            setRelDoc([])
        }
    }, [doctors, speciality, docId])

    if (relDoc.length === 0) {
        return null
    }

    return (
        <div className='py-12 mt-8 fade-in'>
            {/* Section Header */}
            <div className='text-center mb-8'>
                <h2 className='section-title'>Related Doctors</h2>
                <p className='section-subtitle max-w-xl mx-auto'>
                    Discover other trusted {speciality} specialists who can provide excellent care.
                </p>
            </div>

            {/* Doctor Cards Grid */}
            <div className='doctors-grid'>
                {relDoc.slice(0, 4).map((item, index) => {
                    // Skip rendering if item is null or missing required fields
                    if (!item || !item._id || !item.name) return null
                    
                    return (
                    <div 
                        onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0) }} 
                        className='doctor-card slide-in-up'
                        key={item._id || index}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {/* Image Container */}
                        <div className='relative overflow-hidden'>
                            <img 
                                className='doctor-card-image' 
                                src={item.image} 
                                alt={item.name} 
                            />
                            {/* Availability Badge */}
                            <div className='absolute top-2 right-2'>
                                {(() => {
                                    // Safely check availability with null safety
                                    const isAvailable = item && (item.available === true || item.available === 'true')
                                    return (
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                                            isAvailable 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                            {isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    )
                                })()}
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className='doctor-card-content'>
                            <h3 className='doctor-card-name'>
                                {item.name}
                            </h3>
                            <p className='doctor-card-specialty'>{item.speciality}</p>
                            
                            {/* Experience Badge */}
                            {item.experience && (() => {
                                const badge = getExperienceBadge(item.experience)
                                const experienceNum = parseInt(item.experience) || 0
                                return (
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${badge.bg} ${badge.border} ${badge.shadow} shadow-sm mt-2`}>
                                        <div className={`flex items-center justify-center w-3.5 h-3.5 rounded-full ${badge.iconBg}`}>
                                            <svg className='w-2 h-2 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className={`text-[10px] font-semibold ${badge.color}`}>
                                            {badge.label} • {experienceNum} {experienceNum !== 1 ? 'Yrs' : 'Yr'}
                                        </span>
                                    </div>
                                )
                            })()}
                            
                            {/* Book Appointment Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/appointment/${item._id}`);
                                    window.scrollTo(0, 0);
                                }}
                                className='w-full mt-3 py-2 px-3 bg-gradient-to-r from-[#007BFF] to-[#41D6C3] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5'
                            >
                                <svg className='w-3.5 h-3.5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Book Appointment
                            </button>
                        </div>
                    </div>
                    )
                })}
            </div>
        </div>
    )
}

export default RelatedDoctors
