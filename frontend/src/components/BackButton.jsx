import React, { useContext, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const BackButton = ({ 
  to, 
  label = 'Back',
  className = '' 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { doctors } = useContext(AppContext)

  // Get route segments from path
  const getRouteSegments = (path) => {
    if (path === '/') return ['home']
    const segments = path.split('/').filter(Boolean)
    return ['home', ...segments]
  }

  // Check if a string looks like a MongoDB ObjectId (24 hex characters)
  const isObjectId = (str) => {
    return /^[0-9a-fA-F]{24}$/.test(str)
  }

  // Get doctor name from ID
  const getDoctorName = (docId) => {
    if (!doctors || !Array.isArray(doctors)) return null
    const doctor = doctors.find(doc => doc._id === docId)
    return doctor ? doctor.name : null
  }

  // Format route name for display (capitalize first letter of each word)
  const formatRouteName = (name, segmentIndex, allSegments) => {
    // Decode URL-encoded strings (e.g., %20 -> space)
    let decodedName = name
    try {
      decodedName = decodeURIComponent(name)
    } catch (e) {
      // If decoding fails, use original name
      decodedName = name
    }
    
    // Handle special cases - capitalize first letter
    const routeMap = {
      'home': 'Home',
      'my-appointments': 'My Appointments',
      'my-profile': 'My Profile',
      'privacy-policy': 'Privacy Policy',
      'forgot-password': 'Forgot Password',
      'appointment': 'Appointments',
      'appointments': 'Appointments',
      'doctors': 'Hospitals',
      'doctor': 'Doctor'
    }
    if (routeMap[decodedName]) return routeMap[decodedName]
    
    // If this segment is an ObjectId and we're on a doctor/appointment route, try to get doctor name
    if (isObjectId(decodedName)) {
      // Check if we're on a doctor or appointment route
      const isDoctorRoute = allSegments.includes('doctor') || 
                           allSegments.includes('appointment') || 
                           allSegments.includes('appointments')
      
      if (isDoctorRoute) {
        const doctorName = getDoctorName(decodedName)
        if (doctorName) {
          return doctorName // Doctor name is already capitalized
        }
      }
    }
    
    // Capitalize first letter of each word
    // Handle both hyphenated and space-separated names
    if (decodedName.includes(' ')) {
      // Already has spaces (e.g., "General physician")
      return decodedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    } else {
      // Hyphenated (e.g., "my-appointments")
      return decodedName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
  }

  const currentPath = location.pathname
  const segments = getRouteSegments(currentPath)

  // If custom 'to' prop is provided, use it for navigation
  const handleHomeClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate('/')
    }
  }

  const handleSegmentClick = (segment, index) => {
    if (index === 0) {
      handleHomeClick()
      return
    }
    
    // Decode the segment to check its actual value
    const decodedSegment = segment ? (() => {
      try {
        return decodeURIComponent(segment)
      } catch (e) {
        return segment
      }
    })() : segment
    
    // Special handling for "Hospitals" or "Doctor" segment - navigate to /doctors
    // This handles cases where "doctor" or "doctors" appears in displaySegments
    if (decodedSegment === 'doctor' || decodedSegment === 'doctors' || decodedSegment === 'Hospitals') {
      navigate('/doctors')
      return
    }
    
    // Check if we're clicking on a segment that was transformed in displaySegments
    // If the original segment at this index is "appointment" but display shows "doctor", navigate to /doctors
    const originalSegment = segments[index]
    if (originalSegment === 'appointment' && decodedSegment === 'doctor') {
      navigate('/doctors')
      return
    }
    
    // Build path up to clicked segment
    const pathSegments = segments.slice(0, index + 1)
    const targetPath = '/' + pathSegments.slice(1).join('/')
    navigate(targetPath)
  }

  // Don't show breadcrumb on home page
  if (segments.length === 1 && segments[0] === 'home') {
    return null
  }

  // For nested routes like /appointment/:id, show proper breadcrumb path
  const displaySegments = useMemo(() => {
    const result = [...segments]
    
    // Replace 'doctors' with a display-friendly name (it will show as 'Hospitals' via routeMap)
    if (segments.includes('doctors')) {
      const doctorsIndex = segments.indexOf('doctors')
      // Keep 'doctors' but it will display as 'Hospitals' via formatRouteName
    }
    
    // If we're on an appointment page with a doctor ID
    if (segments.includes('appointment')) {
      const appointmentIndex = segments.indexOf('appointment')
      
      // Check if there's an ID after 'appointment'
      if (appointmentIndex + 1 < segments.length) {
        const docId = segments[appointmentIndex + 1]
        
        // If it's a valid ObjectId, we'll show: home/doctor/[doctor name]
        if (isObjectId(docId)) {
          // Replace 'appointment' with 'doctor'
          result[appointmentIndex] = 'doctor'
          // Keep the docId - it will be replaced with doctor name in formatRouteName
        }
      }
    }
    
    return result
  }, [segments, doctors])

  // For appointment pages, always show full path without ellipsis
  const isAppointmentPage = displaySegments.includes('appointments') || displaySegments.includes('appointment')
  
  // Show ellipsis only if more than 4 segments AND not on appointment page
  const showEllipsis = !isAppointmentPage && displaySegments.length > 4
  const visibleSegments = showEllipsis 
    ? [displaySegments[0], displaySegments[displaySegments.length - 2], displaySegments[displaySegments.length - 1]]
    : displaySegments

  // Get intermediate segments for dropdown
  const intermediateSegments = showEllipsis 
    ? displaySegments.slice(1, -2)
    : []

  return (
    <Breadcrumb className={`w-full block ${className || ''}`}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <span
              onClick={() => handleSegmentClick('home', 0)}
              className="cursor-pointer hover:text-gray-900"
            >
              {formatRouteName('home', 0, displaySegments)}
            </span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        {showEllipsis && intermediateSegments.length > 0 && (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {intermediateSegments.map((segment, idx) => {
                    const actualIndex = displaySegments.indexOf(segment)
                    return (
                      <DropdownMenuItem
                        key={segment}
                        onClick={() => handleSegmentClick(segment, actualIndex)}
                      >
                        {formatRouteName(segment, actualIndex, displaySegments)}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {visibleSegments.slice(1, -1).map((segment, idx) => {
          const actualIndex = displaySegments.indexOf(segment)
          return (
            <React.Fragment key={segment}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <span
                    onClick={() => handleSegmentClick(segment, actualIndex)}
                    className="cursor-pointer hover:text-gray-900"
                  >
                    {formatRouteName(segment, actualIndex, displaySegments)}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          )
        })}

        <BreadcrumbItem>
          <BreadcrumbPage>
            {formatRouteName(displaySegments[displaySegments.length - 1], displaySegments.length - 1, displaySegments)}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BackButton
