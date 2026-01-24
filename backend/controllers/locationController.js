import axios from 'axios'

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

// Geocode an address using Nominatim (server-side, no CORS issues)
export const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      })
    }

    // Use Nominatim API (works from server-side, no CORS)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'MedChain Hospital Finder'
        }
      }
    )

    if (response.data && response.data.length > 0) {
      return res.json({
        success: true,
        coordinates: {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon)
        }
      })
    }

    return res.json({
      success: false,
      message: 'Address not found'
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error geocoding address',
      error: error.message
    })
  }
}

// Find nearby hospitals using Overpass API
export const findNearbyHospitals = async (req, res) => {
  try {
    const { lat, lon, radius = 3 } = req.query // radius in km, default 3km

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      })
    }

    const userLat = parseFloat(lat)
    const userLon = parseFloat(lon)
    const radiusMeters = parseFloat(radius) * 1000 // Convert km to meters

    // Overpass API query for hospitals and clinics with all tags
    // Using "out center tags;" to get all available tags for better data extraction
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"~"^(hospital|clinic|doctors|pharmacy)"](around:${radiusMeters},${userLat},${userLon});
        way["amenity"~"^(hospital|clinic|doctors|pharmacy)"](around:${radiusMeters},${userLat},${userLon});
        relation["amenity"~"^(hospital|clinic|doctors|pharmacy)"](around:${radiusMeters},${userLat},${userLon});
      );
      out center tags;
    `

    // Try multiple Overpass API endpoints for better reliability
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter'
    ]

    let response = null
    let lastError = null

    // Try each endpoint
    for (const endpoint of endpoints) {
      try {
        const result = await axios.post(
          endpoint,
          `data=${encodeURIComponent(overpassQuery)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 30000 // 30 second timeout
          }
        )

        if (result.status === 200 && result.data) {
          response = result
          break // Success, exit loop
        }
      } catch (error) {
        lastError = error
        // If rate limited, try next endpoint
        if (error.response?.status === 429) {
          console.log(`Rate limited on ${endpoint}, trying next...`)
          continue
        }
        console.log(`Error with ${endpoint}:`, error.message)
        continue
      }
    }

    if (!response || !response.data) {
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch nearby hospitals. Please try again later.',
        error: lastError?.message || 'All endpoints failed'
      })
    }

    const data = response.data
    const hospitals = []

    // Process results
    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach(element => {
        const tags = element.tags || {}
        const amenity = tags.amenity

        // Only process hospitals and clinics
        if (amenity !== 'hospital' && amenity !== 'clinic' && amenity !== 'doctors' && amenity !== 'pharmacy') {
          return
        }

        // Get coordinates
        let lat, lon
        if (element.type === 'node') {
          lat = element.lat
          lon = element.lon
        } else if (element.center) {
          lat = element.center.lat
          lon = element.center.lon
        } else if (element.lat && element.lon) {
          lat = element.lat
          lon = element.lon
        }

        if (!lat || !lon) return

        // Calculate distance
        const distance = calculateDistance(userLat, userLon, lat, lon)

        // Build comprehensive address string from all possible OSM address tags
        const addressParts = []
        
        // Try to build structured address
        if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber'])
        if (tags['addr:street']) addressParts.push(tags['addr:street'])
        if (tags['addr:road']) addressParts.push(tags['addr:road'])
        if (tags['addr:house']) addressParts.push(tags['addr:house'])
        if (tags['addr:locality']) addressParts.push(tags['addr:locality'])
        if (tags['addr:neighbourhood']) addressParts.push(tags['addr:neighbourhood'])
        if (tags['addr:suburb']) addressParts.push(tags['addr:suburb'])
        if (tags['addr:city']) addressParts.push(tags['addr:city'])
        if (tags['addr:district']) addressParts.push(tags['addr:district'])
        if (tags['addr:state']) addressParts.push(tags['addr:state'])
        if (tags['addr:postcode']) addressParts.push(tags['addr:postcode'])
        if (tags['addr:country']) addressParts.push(tags['addr:country'])
        
        // If we have structured parts, join them
        let address = addressParts.length > 0 ? addressParts.join(', ') : null
        
        // Fallback to full address if available
        if (!address || address.trim() === '') {
          address = tags['addr:full'] || tags.address || null
        }
        
        // If still no address, try to build from name + city/state
        if (!address || address.trim() === '') {
          const fallbackParts = []
          if (tags['addr:city']) fallbackParts.push(tags['addr:city'])
          if (tags['addr:state']) fallbackParts.push(tags['addr:state'])
          if (tags['addr:postcode']) fallbackParts.push(tags['addr:postcode'])
          if (fallbackParts.length > 0) {
            address = fallbackParts.join(', ')
          }
        }
        
        // Final fallback
        if (!address || address.trim() === '') {
          address = 'Address not available'
        }

        // Extract phone number from ALL possible OSM phone/contact tags
        // OSM uses many variations for phone numbers
        let phone = tags.phone || 
                   tags['contact:phone'] || 
                   tags['contact:mobile'] || 
                   tags['phone:mobile'] ||
                   tags['phone:1'] ||
                   tags['phone:2'] ||
                   tags['contact:phone:1'] ||
                   tags['contact:phone:2'] ||
                   tags['contact:mobile:1'] ||
                   tags['contact:mobile:2'] ||
                   tags['contact:fax'] ||
                   tags['phone:fax'] ||
                   tags['mobile'] ||
                   tags['tel'] ||
                   tags['contact:tel'] ||
                   tags['telephone'] ||
                   tags['contact:telephone'] ||
                   tags['phone_number'] ||
                   tags['contact:phone_number'] ||
                   tags['phone:emergency'] ||
                   tags['emergency:phone'] ||
                   tags['contact:emergency'] ||
                   tags['operator:phone'] ||
                   tags['owner:phone'] ||
                   null
        
        // Also check if phone is in other contact/description fields
        if (!phone) {
          // Sometimes phone is in a general contact field, description, or note
          const contactField = tags.contact || 
                              tags['contact:all'] || 
                              tags.description || 
                              tags.note || 
                              tags['note:en'] ||
                              tags['description:en'] ||
                              tags['contact:note'] ||
                              ''
          
          if (contactField) {
            // Try multiple patterns to extract phone from text
            const phonePatterns = [
              /(?:phone|tel|mobile|call)[\s:]*([+]?91[\s\-]?[\d\s\-]{8,})/i,
              /(?:phone|tel|mobile|call)[\s:]*([+]?[\d\s\-()]{10,})/i,
              /([+]?91[\s\-]?[6-9][\d\s\-]{9})/, // Indian mobile pattern
              /([+]?[\d]{10,15})/ // Any 10-15 digit number
            ]
            
            for (const pattern of phonePatterns) {
              const phoneMatch = contactField.match(pattern)
              if (phoneMatch && phoneMatch[1]) {
                const extracted = phoneMatch[1].trim()
                // Validate it looks like a phone number
                const digits = extracted.replace(/\D/g, '')
                if (digits.length >= 8 && digits.length <= 15) {
                  phone = extracted
                  break
                }
              }
            }
          }
        }
        
        // Clean phone number (remove spaces, dashes, etc.)
        if (phone) {
          phone = phone.trim()
          // Remove common prefixes if present
          phone = phone.replace(/^\+91[\s-]?/, '') // Remove +91 prefix
          phone = phone.replace(/^91[\s-]?/, '') // Remove 91 prefix
          phone = phone.replace(/[\s\-()]/g, '') // Remove spaces, dashes, parentheses
          
          // Validate phone number (should be 10 digits for Indian numbers)
          // If it's too short or too long, might be invalid
          const digitsOnly = phone.replace(/\D/g, '')
          if (digitsOnly.length < 8 || digitsOnly.length > 15) {
            phone = null // Invalid phone number
          } else {
            phone = digitsOnly
            // Format as Indian phone number if 10 digits
            if (digitsOnly.length === 10) {
              phone = `+91-${digitsOnly.substring(0, 5)}-${digitsOnly.substring(5)}`
            } else if (digitsOnly.length > 10) {
              // Keep as is if it includes country code
              phone = `+${digitsOnly}`
            }
          }
        }
        
        if (!phone || phone === '') {
          phone = 'Not available'
        }

        // Extract specialty from all possible specialty tags
        let specialization = tags['healthcare:speciality'] ||
                           tags['healthcare:speciality:en'] ||
                           tags.speciality ||
                           tags.specialty ||
                           tags['medical_facility:type'] ||
                           tags['healthcare'] ||
                           tags['amenity'] ||
                           null
        
        // If no specialty, try to infer from name
        if (!specialization || specialization === '') {
          const name = (tags.name || tags['name:en'] || '').toLowerCase()
          if (name.includes('cardiac') || name.includes('heart')) specialization = 'Cardiology'
          else if (name.includes('eye') || name.includes('ophthal')) specialization = 'Ophthalmology'
          else if (name.includes('dental') || name.includes('denti')) specialization = 'Dentistry'
          else if (name.includes('child') || name.includes('pediatric')) specialization = 'Pediatrics'
          else if (name.includes('women') || name.includes('maternity') || name.includes('gynec')) specialization = 'Gynecology'
          else if (name.includes('ortho')) specialization = 'Orthopedics'
          else if (name.includes('neuro')) specialization = 'Neurology'
          else if (name.includes('psych') || name.includes('mental')) specialization = 'Psychiatry'
          else if (name.includes('skin') || name.includes('derma')) specialization = 'Dermatology'
          else specialization = 'General'
        }

        // Extract website
        const website = tags.website || 
                       tags['contact:website'] || 
                       tags.url || 
                       tags['contact:url'] ||
                       null

        // Extract opening hours
        const openingHours = tags['opening_hours'] || 
                            tags.opening_hours || 
                            tags['opening:hours'] ||
                            null

        const hospital = {
          name: tags.name || tags['name:en'] || tags['name:hi'] || tags['name:local'] || 'Unnamed Hospital',
          address: address,
          phone: phone,
          latitude: lat,
          longitude: lon,
          distance: parseFloat(distance.toFixed(2)),
          type: amenity === 'hospital' ? 'Hospital' : 
                amenity === 'clinic' ? 'Clinic' : 
                amenity === 'doctors' ? 'Doctor\'s Office' : 
                amenity === 'pharmacy' ? 'Pharmacy' :
                'Medical Facility',
          specialization: specialization,
          website: website,
          openingHours: openingHours
        }

        hospitals.push(hospital)
      })
    }

    // Sort by distance
    hospitals.sort((a, b) => a.distance - b.distance)

    return res.json({
      success: true,
      hospitals: hospitals,
      count: hospitals.length,
      userLocation: {
        lat: userLat,
        lon: userLon
      },
      radius: radius
    })
  } catch (error) {
    console.error('Error finding nearby hospitals:', error)
    return res.status(500).json({
      success: false,
      message: 'Error finding nearby hospitals',
      error: error.message
    })
  }
}

