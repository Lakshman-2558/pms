import React from 'react'
import { useNavigate } from 'react-router-dom'
import Banner from './Banner'

const ContactLocation = () => {
    const navigate = useNavigate()
    
    // Vignan University coordinates (Vadlamudi, Guntur)
    const latitude = 16.4244
    const longitude = 80.6214
    
    // Google Maps embed URL - Vignan University
    // Using place search for Vignan University
    const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.5!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35eff9482d944b%3A0x939b7e84ab4d026c!2sVignan%27s%20Foundation%20for%20Science%2C%20Technology%20%26%20Research!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin`
    
    // Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=Vignan+University+Vadlamudi+Guntur`

    return (
        <section className='w-full bg-transparent py-2 sm:py-4 md:py-6 lg:py-8'>
            <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8'>
                {/* Section Header */}
                <div className='text-center mb-6 sm:mb-8 md:mb-12'>
                    <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3'>
                        Health Begins with
                    </h2>
                    <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-600 mb-3 sm:mb-4'>
                        MediChain+
                    </h2>
                    <p className='text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2'>
                        Visit us at our location or get in touch with us
                    </p>
                </div>

                {/* Map and Contact Info Container */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl'>
                    {/* Map Section */}
                    <div className='w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] relative bg-gray-100 rounded-t-xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden order-1 lg:order-1'>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.5!2d80.6214!3d16.4244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35eff9482d944b%3A0x939b7e84ab4d026c!2sVignan%27s%20Foundation%20for%20Science%2C%20Technology%20%26%20Research!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className='w-full h-full'
                            title="MediChain+ Location - Vignan University"
                        ></iframe>
                        {/* Map Overlay Marker */}
                        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10'>
                            <div className='bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-xl font-semibold text-sm whitespace-nowrap'>
                                MediChain+
                            </div>
                            <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-600'></div>
                        </div>
                    </div>

                    {/* Contact Information Panel */}
                    <div className='bg-white p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between order-2 lg:order-2 rounded-b-xl sm:rounded-r-2xl sm:rounded-bl-none'>
                        <div>
                            {/* Contact Details */}
                            <div className='space-y-4 sm:space-y-5 md:space-y-6 mb-6 sm:mb-8'>
                                {/* Phone Numbers */}
                                <div className='flex items-start gap-3 sm:gap-4'>
                                    <div className='w-9 h-9 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1'>
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-gray-500 text-xs sm:text-sm mb-1'>Phone</p>
                                        <a href="tel:+916309497466" className='text-gray-900 font-semibold text-base sm:text-lg hover:text-red-600 transition-colors block break-words'>
                                            +91 6309497466
                                        </a>
                                        <p className='text-gray-600 text-xs sm:text-sm mt-1.5 sm:mt-2'>
                                            For Emergency - <a href="tel:+916309497466" className='text-red-600 font-semibold hover:underline break-words'>+91 6309497466</a>
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className='flex items-start gap-3 sm:gap-4'>
                                    <div className='w-9 h-9 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1'>
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-gray-500 text-xs sm:text-sm mb-1'>Email</p>
                                        <a href="mailto:medichain123@gmail.com" className='text-gray-900 font-semibold text-base sm:text-lg hover:text-red-600 transition-colors break-all block'>
                                            medichain123@gmail.com
                                        </a>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className='flex items-start gap-3 sm:gap-4'>
                                    <div className='w-9 h-9 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1'>
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-gray-500 text-xs sm:text-sm mb-1'>Address</p>
                                        <div className='text-gray-900 font-medium leading-relaxed text-sm sm:text-base'>
                                            <p className='font-semibold mb-0.5 sm:mb-1'>MediChain+ Healthcare</p>
                                            <p>Vignan University Campus</p>
                                            <p>Vadlamudi, Guntur District</p>
                                            <p>Andhra Pradesh - 522 213, India</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action Buttons */}
                        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200'>
                            <button
                                onClick={() => navigate('/doctors')}
                                className='w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base'
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Make Appointment</span>
                            </button>
                            <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='w-full sm:flex-1 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base'
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <span>Get Directions</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Banner Section - After Map */}
                <div className='mt-4 sm:mt-6 md:mt-8 lg:mt-10'>
                    <Banner />
                </div>
            </div>
        </section>
    )
}

export default ContactLocation

