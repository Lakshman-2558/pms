// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Geocode an address using backend proxy (no CORS issues)
export const geocodeAddress = async (address, backendUrl) => {
  try {
    if (!backendUrl) {
      throw new Error('Backend URL is required')
    }

    const response = await fetch(
      `${backendUrl}/api/location/geocode?address=${encodeURIComponent(address)}`
    )

    if (!response.ok) {
      throw new Error('Geocoding failed')
    }

    const data = await response.json()

    if (data.success && data.coordinates) {
      return {
        lat: data.coordinates.lat,
        lon: data.coordinates.lon
      }
    }

    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

// Find nearby hospitals using backend API (real hospitals from OpenStreetMap)
export const findNearbyHospitals = async (lat, lon, radius = 10, backendUrl) => {
  try {
    if (!backendUrl) {
      throw new Error('Backend URL is required')
    }

    const response = await fetch(
      `${backendUrl}/api/location/nearby-hospitals?lat=${lat}&lon=${lon}&radius=${radius}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch nearby hospitals')
    }

    const data = await response.json()

    if (data.success && data.hospitals) {
      return data.hospitals
    }

    return []
  } catch (error) {
    console.error('Error finding nearby hospitals:', error)
    return []
  }
}

// Get user's current location
// Get user's current location with improved error handling and fallback
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    // First try with high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        // If high accuracy times out (code 3), try again with low accuracy
        if (error.code === 3) { // 3 is TIMEOUT
          console.log('High accuracy location timed out, trying low accuracy...')
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude
              })
            },
            (error2) => {
              reject(error2)
            },
            {
              enableHighAccuracy: false,
              timeout: 20000, // 20 seconds for fallback
              maximumAge: 30000 // Accept positions up to 30 seconds old
            }
          )
        } else {
          // Other errors (permission denied, position unavailable)
          reject(error)
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds for high accuracy attempt
        maximumAge: 5000 // Accept positions up to 5 seconds old
      }
    )
  })
}

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

