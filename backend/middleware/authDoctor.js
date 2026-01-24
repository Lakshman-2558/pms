import jwt from 'jsonwebtoken'

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    const { dtoken } = req.headers
    if (!dtoken) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }
    try {
        const token_decode = jwt.verify(dtoken, process.env.DOCTOR_JWT_SECRET || process.env.JWT_SECRET)
        // Store docId in both req.body and req.doctorId to handle multer FormData cases
        req.body.docId = token_decode.id
        req.doctorId = token_decode.id
        next()
    } catch (error) {
        console.log("JWT Error (Doctor):", error.message)
        res.json({ success: false, message: 'Invalid Session. Please login again.' })
    }
}

export default authDoctor;