import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Pagination from '../components/Pagination'
import { getUserLocation, geocodeAddress, calculateDistance, formatDistance, findNearbyHospitals } from '../utils/locationUtils'
import { toast } from 'react-toastify'
import BackButton from '../components/BackButton'

const CollaboratedHospitals = () => {
    const { backendUrl } = useContext(AppContext)
    const [hospitals, setHospitals] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [viewMode, setViewMode] = useState('all') // 'all' or 'nearby'
    const [userLocation, setUserLocation] = useState(null)
    const [hospitalsWithDistance, setHospitalsWithDistance] = useState([])
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [hospitalTypeFilter, setHospitalTypeFilter] = useState('All')
    const itemsPerPage = 12
    const navigate = useNavigate()

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/hospital-tieup/public')
                if (data.success) {
                    setHospitals(data.hospitals)
                }
            } catch (error) {
                console.error("Error fetching hospitals:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchHospitals()
    }, [backendUrl])

    // Get user location and find REAL nearby hospitals from OpenStreetMap
    useEffect(() => {
        const fetchRealNearbyHospitals = async () => {
            if (viewMode !== 'nearby') {
                setHospitalsWithDistance([])
                return
            }

            setIsLoadingLocation(true)
            console.log('Starting to find nearby hospitals...')
            
            try {
                // Get user location
                const location = await getUserLocation()
                setUserLocation(location)

                // Find REAL nearby hospitals using backend API (from OpenStreetMap)
                const nearbyHospitals = await findNearbyHospitals(
                    location.lat, 
                    location.lon, 
                    3, // 3km radius
                    backendUrl
                )

                if (nearbyHospitals && nearbyHospitals.length > 0) {
                    // Transform the data to match our hospital card format
                    const formattedHospitals = nearbyHospitals.map(hospital => ({
                        _id: `osm_${hospital.latitude}_${hospital.longitude}`, // Generate unique ID
                        name: hospital.name,
                        address: hospital.address,
                        contact: hospital.phone,
                        type: hospital.type,
                        specialization: hospital.specialization,
                        distance: hospital.distance,
                        coordinates: {
                            lat: hospital.latitude,
                            lon: hospital.longitude
                        },
                        website: hospital.website,
                        openingHours: hospital.openingHours,
                        isRealHospital: true // Flag to indicate this is from OSM, not database
                    }))

                    setHospitalsWithDistance(formattedHospitals)
                } else {
                    toast.info('No hospitals found nearby. Showing all hospitals instead.', {
                        position: "top-center",
                        autoClose: 4000,
                    })
                    setViewMode('all')
                }
            } catch (error) {
                console.error('Error getting location or nearby hospitals:', error)
                if (error.message.includes('denied') || error.code === 1) {
                    toast.error('Location access denied. Please enable location permissions to use nearby hospitals.', {
                        position: "top-center",
                        autoClose: 4000,
                    })
                } else if (error.message.includes('timeout') || error.code === 3) {
                    toast.error('Location request timed out. Please try again.', {
                        position: "top-center",
                        autoClose: 3000,
                    })
                } else {
                    toast.error('Unable to find nearby hospitals. Please try again later.', {
                        position: "top-center",
                        autoClose: 3000,
                    })
                }
                setViewMode('all') // Fallback to all hospitals
            } finally {
                setIsLoadingLocation(false)
            }
        }

        fetchRealNearbyHospitals()
    }, [viewMode, backendUrl])

    // Get hospitals based on view mode
    const hospitalsToFilter = viewMode === 'nearby' ? hospitalsWithDistance : hospitals

    // Filter hospitals by search query and type
    const filteredHospitals = hospitalsToFilter.filter(hospital => {
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = 
                hospital.name?.toLowerCase().includes(query) ||
                hospital.address?.toLowerCase().includes(query) ||
                hospital.specialization?.toLowerCase().includes(query) ||
                hospital.contact?.includes(query);
            if (!matchesSearch) return false;
        }

        // Filter by hospital type
        if (hospitalTypeFilter !== 'All') {
            if (hospitalTypeFilter === 'Teaching Hospital' && hospital.type !== 'Teaching Hospital') return false;
            if (hospitalTypeFilter === 'Super Specialty' && hospital.type !== 'Super Specialty') return false;
            if (hospitalTypeFilter === 'General' && hospital.type !== 'General') return false;
        }

        return true;
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [viewMode, searchQuery, hospitalTypeFilter])

    // Calculate pagination
    const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedHospitals = filteredHospitals.slice(startIndex, endIndex)

    return (
        <div className='min-h-screen bg-slate-50 relative overflow-hidden pb-24'>
            {/* Mesh Gradient Backgrounds */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/10 blur-[100px] rounded-full"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10">
                {/* Back Button - Mobile Responsive */}
                <div className="mb-4 sm:mb-6 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm sm:hidden"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    <BackButton to="/" label="Back to Home" className="hidden sm:flex" />
                </div>
                {/* Header Section */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">Hospital Network</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Collaborated <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold">Medical</span> Institutions
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium leading-relaxed mb-8">
                        Precision healthcare delivery through our premium institutional network.
                    </p>

                    {/* View Mode Toggle */}
                    {!loading && (
                        <div className='flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8'>
                            <label className='text-xs sm:text-sm font-medium text-slate-700'>View:</label>
                            <div className='flex items-center gap-1 sm:gap-2 bg-white/60 backdrop-blur-md rounded-lg p-1 border border-white/40 w-full sm:w-auto'>
                                <button
                                    onClick={() => setViewMode('all')}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all flex-1 sm:flex-initial ${
                                        viewMode === 'all'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setViewMode('nearby')}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-initial ${
                                        viewMode === 'nearby'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Nearby
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search and Filters Section */}
                {!loading && (
                    <div className='mb-8 space-y-4'>
                        {/* Search Bar */}
                        <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                <svg className='h-5 w-5 text-slate-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type='text'
                                placeholder='Search hospitals...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full pl-12 pr-10 sm:pr-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md transition-all'
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className='absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600'
                                >
                                    <svg className='h-5 w-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filters Row */}
                        <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4'>
                            {/* Hospital Type Filter */}
                            <div className='flex items-center gap-2 w-full sm:w-auto'>
                                <label className='text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap'>Type:</label>
                                <div className='relative flex-1 sm:flex-initial'>
                                    <select
                                        value={hospitalTypeFilter}
                                        onChange={(e) => setHospitalTypeFilter(e.target.value)}
                                        className='w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-7 sm:pr-8 shadow-sm'
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Teaching Hospital">Teaching Hospital</option>
                                        <option value="Super Specialty">Super Specialty</option>
                                        <option value="General">General</option>
                                    </select>
                                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                                        <svg className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State - Initial Load */}
                {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 animate-pulse h-[400px] flex flex-col gap-4">
                                <div className="w-16 h-16 bg-white/60 rounded-2xl"></div>
                                <div className="h-6 bg-white/60 w-3/4 rounded-lg"></div>
                                <div className="h-4 bg-white/60 w-full rounded-md mt-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : isLoadingLocation ? (
                    // Loading State - Finding Nearby Hospitals (Centered on Page)
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-50/95 backdrop-blur-sm">
                        <div className="flex flex-col items-center justify-center w-full max-w-md px-4">
                            <div className="relative mb-8">
                                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Finding Nearby Hospitals</h3>
                            <p className="text-gray-600 text-center max-w-md mb-6">
                                Please wait while we locate hospitals near you. This may take a few seconds...
                            </p>
                            <div className="flex gap-2 justify-center">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                ) : filteredHospitals.length === 0 ? (
                    <div className="text-center py-24 bg-white/30 backdrop-blur-lg rounded-[2rem] border border-white/40 shadow-xl max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                            {viewMode === 'nearby' ? 'No Nearby Hospitals Found' : 'No Data Available'}
                        </h3>
                        <p className="text-slate-600 font-medium mb-4">
                            {viewMode === 'nearby' 
                                ? 'Unable to find hospitals near your location. Please enable location access or switch to "All Hospitals" view.'
                                : 'Please check back later.'}
                        </p>
                        {viewMode === 'nearby' && (
                            <button
                                onClick={() => setViewMode('all')}
                                className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors'
                            >
                                View All Hospitals
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8'>
                            {paginatedHospitals.map((hospital, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    // If it's a real hospital from OSM (not in our database), show info instead
                                    if (hospital.isRealHospital) {
                                        toast.info(`${hospital.name} - ${hospital.address}. Phone: ${hospital.contact}`, {
                                            position: "top-center",
                                            autoClose: 5000,
                                        })
                                        // Optionally, open maps or external link
                                        if (hospital.website) {
                                            window.open(hospital.website, '_blank')
                                        } else {
                                            // Open in Google Maps
                                            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hospital.coordinates.lat},${hospital.coordinates.lon}`
                                            window.open(mapsUrl, '_blank')
                                        }
                                    } else {
                                        // Regular hospital from database - navigate to details page
                                        navigate(`/hospital/${hospital._id}`)
                                    }
                                }}
                                className='group relative bg-white rounded-3xl p-6 lg:p-8 border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full min-h-[420px] hover:-translate-y-3 hover:scale-[1.02]'
                            >
                                {/* Animated gradient background overlay */}
                                <div className='absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-indigo-50/50 transition-all duration-700 -z-0'></div>
                                
                                {/* Decorative corner accent */}
                                <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                
                                {/* Header Section */}
                                <div className='relative z-10 flex items-start justify-between mb-5 lg:mb-6'>
                                    <div className='relative'>
                                        <div className='w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_10px_30px_rgba(59,130,246,0.5)] transition-all duration-500 shadow-[0_6px_20px_rgba(59,130,246,0.3)]'>
                                            <svg className="w-7 h-7 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        {/* Pulsing dot indicator */}
                                        <div className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse'></div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg transform group-hover:scale-105 transition-transform duration-300 ${
                                            hospital.type === 'Teaching Hospital'
                                                ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-purple-500/40'
                                                : hospital.type === 'Super Specialty'
                                                    ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-blue-500/40'
                                                    : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-blue-500/40'
                                        }`}>
                                            {hospital.type || 'GENERAL'}
                                        </div>
                                        {viewMode === 'nearby' && hospital.distance && (
                                            <span className='text-xs font-bold text-blue-700 flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shadow-sm'>
                                                <svg className='w-3.5 h-3.5 text-blue-600' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {formatDistance(hospital.distance)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="relative z-10 flex-1 flex flex-col">
                                    <h3 className='text-lg lg:text-xl font-black text-gray-900 mb-5 lg:mb-6 leading-tight group-hover:text-blue-700 transition-colors duration-300 line-clamp-2' title={hospital.name}>
                                        {hospital.name}
                                    </h3>

                                    <div className='space-y-4 flex-1 mb-5'>
                                        {/* Location */}
                                        <div className='flex items-start gap-3 group/item'>
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border-2 border-blue-200/60 group-hover/item:from-blue-100 group-hover/item:to-blue-200 group-hover/item:scale-110 group-hover/item:border-blue-300 transition-all duration-300 shadow-sm">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className='flex-1 pt-1'>
                                                <span className='text-sm text-gray-700 leading-relaxed line-clamp-2 font-medium'>{hospital.address}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Specialization */}
                                        {hospital.specialization && (
                                            <div className='flex items-start gap-3 group/item'>
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center shrink-0 border-2 border-purple-200/60 group-hover/item:from-purple-100 group-hover/item:to-purple-200 group-hover/item:scale-110 group-hover/item:border-purple-300 transition-all duration-300 shadow-sm">
                                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className='flex-1 pt-1'>
                                                    <span className='text-sm text-gray-800 leading-relaxed font-bold'>{hospital.specialization}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Contact */}
                                        <div className='flex items-center gap-3 group/item'>
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shrink-0 border-2 border-emerald-200/60 group-hover/item:from-emerald-100 group-hover/item:to-emerald-200 group-hover/item:scale-110 group-hover/item:border-emerald-300 transition-all duration-300 shadow-sm">
                                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 pt-1">{hospital.contact}</span>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <div className='mt-auto pt-5 border-t-2 border-gray-100 group-hover:border-blue-200 transition-colors duration-300'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-2 transition-all duration-300'>
                                                View Details
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                            <div className='w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-300'>
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        {/* Pagination */}
                        {filteredHospitals.length > itemsPerPage && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => {
                                    setCurrentPage(page)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                itemsPerPage={itemsPerPage}
                                totalItems={filteredHospitals.length}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default CollaboratedHospitals
