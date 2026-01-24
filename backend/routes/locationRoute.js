import express from 'express'
import { geocodeAddress, findNearbyHospitals } from '../controllers/locationController.js'

const locationRouter = express.Router()

// Geocode an address (convert address to coordinates)
locationRouter.get('/geocode', geocodeAddress)

// Find nearby hospitals using user's location
locationRouter.get('/nearby-hospitals', findNearbyHospitals)

export default locationRouter

