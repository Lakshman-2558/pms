import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import HospitalTieUp from "../models/hospitalTieUpModel.js";
import { sendAppointmentCancellationEmail, sendDoctorWelcomeEmail } from "../services/emailService.js";
import XLSX from "xlsx";
import fs from "fs";
import csv from "csv-parser";
import { createReadStream } from "fs";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body

        // Get appointment details before cancelling
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // Update appointment to cancelled
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, status: 'cancelled' })

        // Send cancellation email to patient
        try {
            const emailDetails = {
                patientName: appointmentData.userData.name,
                doctorName: appointmentData.docData.name,
                speciality: appointmentData.docData.speciality,
                date: appointmentData.slotDate,
                time: appointmentData.slotTime,
                cancelledBy: 'Hospital Administration'
            };

            await sendAppointmentCancellationEmail(appointmentData.userData.email, emailDetails);
            console.log('✅ Cancellation email sent to patient');
        } catch (emailError) {
            console.error('⚠️ Failed to send cancellation email:', emailError.message);
            // Continue even if email fails - appointment is still cancelled
        }

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel - combines doctors from all sources
const allDoctors = async (req, res) => {
    try {
        // 1. Get admin-added doctors from doctorModel
        const adminDoctors = await doctorModel.find({}).select('-password')
        
        // 2. Get doctors from Hospital Tie-Ups
        const hospitals = await HospitalTieUp.find({})
        const hospitalDoctors = []
        hospitals.forEach(hospital => {
            hospital.doctors.forEach(doc => {
                hospitalDoctors.push({
                    ...doc.toObject(),
                    _id: doc._id,
                    name: doc.name,
                    speciality: doc.specialization || doc.speciality,
                    degree: doc.qualification,
                    experience: doc.experience?.toString() || '0',
                    available: doc.available !== undefined ? doc.available : true,
                    fees: 0, // Hospital doctors might not have fees set
                    about: `${doc.qualification} - ${doc.specialization}`,
                    image: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doc.name) + '&background=667eea&color=fff',
                    address: { line1: hospital.address, line2: hospital.specialization },
                    date: Date.now(),
                    isHospitalDoctor: true,
                    hospitalId: hospital._id,
                    hospitalName: hospital.name
                })
            })
        })
        
        // 3. Get doctors from userModel (users with role='doctor')
        const userDoctors = await userModel.find({ role: 'doctor' }).select('-password')
        const formattedUserDoctors = userDoctors.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            speciality: 'General physician', // Default if not specified
            degree: 'MBBS', // Default if not specified
            experience: '1 Year', // Default if not specified
            available: true,
            fees: 0,
            about: 'Doctor from patient panel',
            image: user.image,
            address: user.address || { line1: '', line2: '' },
            date: Date.now(),
            isUserDoctor: true,
            phone: user.phone
        }))
        
        // Combine all doctors and remove duplicates based on email or name
        const allDoctorsList = [...adminDoctors]
        const existingEmails = new Set(adminDoctors.map(d => d.email?.toLowerCase()))
        const existingNames = new Set(adminDoctors.map(d => d.name?.toLowerCase()))
        
        // Add hospital doctors (avoid duplicates)
        hospitalDoctors.forEach(doc => {
            if (!existingNames.has(doc.name?.toLowerCase())) {
                allDoctorsList.push(doc)
                existingNames.add(doc.name?.toLowerCase())
            }
        })
        
        // Add user doctors (avoid duplicates)
        formattedUserDoctors.forEach(doc => {
            if (!existingEmails.has(doc.email?.toLowerCase()) && !existingNames.has(doc.name?.toLowerCase())) {
                allDoctorsList.push(doc)
                existingEmails.add(doc.email?.toLowerCase())
                existingNames.add(doc.name?.toLowerCase())
            }
        })
        
        res.json({ success: true, doctors: allDoctorsList })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor details (including image) for admin panel
const updateDoctor = async (req, res) => {
    try {
        const { docId, name, email, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" })
        }

        const doctor = await doctorModel.findById(docId)
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        const updateData = {}

        if (name) updateData.name = name
        if (email) {
            if (!validator.isEmail(email)) {
                return res.json({ success: false, message: "Please enter a valid email" })
            }
            updateData.email = email
        }
        if (speciality) updateData.speciality = speciality
        if (degree) updateData.degree = degree
        if (experience) updateData.experience = experience
        if (about) updateData.about = about
        if (fees) updateData.fees = Number(fees)
        if (address) updateData.address = JSON.parse(address)

        // Upload new image if provided
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            updateData.image = imageUpload.secure_url
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)
        res.json({ success: true, message: 'Doctor Updated Successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const allAppointments = await appointmentModel.find({})

        // Get today's date in DD_MM_YYYY format (matching slotDate format)
        const today = new Date()
        const day = String(today.getDate()).padStart(2, '0')
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const year = today.getFullYear()
        const todayStr = `${day}_${month}_${year}` // Format: DD_MM_YYYY

        // Get today's appointments (not cancelled)
        // Check appointments where slotDate matches today OR appointment was created today
        const todayAppointments = allAppointments.filter(apt => {
            if (apt.cancelled) return false

            // Check if slotDate matches today
            const appointmentDate = apt.slotDate
            if (appointmentDate === todayStr) return true

            // Also check if appointment was created today (for same-day bookings)
            const appointmentCreatedDate = new Date(apt.date)
            const createdDay = String(appointmentCreatedDate.getDate()).padStart(2, '0')
            const createdMonth = String(appointmentCreatedDate.getMonth() + 1).padStart(2, '0')
            const createdYear = appointmentCreatedDate.getFullYear()
            const createdDateStr = `${createdDay}_${createdMonth}_${createdYear}`

            return createdDateStr === todayStr
        })

        // Calculate today's unique patients (count unique userIds)
        const uniquePatientIds = new Set(todayAppointments.map(apt => apt.userId))
        const totalPatientsToday = uniquePatientIds.size

        // Calculate today's revenue (sum of amounts from non-cancelled appointments)
        const todayRevenue = todayAppointments.reduce((sum, apt) => {
            return sum + (apt.amount || 0)
        }, 0)

        // Calculate monthly revenue (appointments from current month, not cancelled)
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        const monthlyAppointments = allAppointments.filter(apt => {
            if (apt.cancelled) return false
            const aptDate = new Date(apt.date)
            return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
        })
        const monthlyRevenue = monthlyAppointments.reduce((sum, apt) => sum + (apt.amount || 0), 0)

        // Calculate total revenue (all non-cancelled appointments)
        const totalRevenue = allAppointments
            .filter(apt => !apt.cancelled)
            .reduce((sum, apt) => sum + (apt.amount || 0), 0)

        // Get active doctors (available)
        const activeDoctors = doctors.filter(doc => doc.available).length

        // Calculate hourly data for charts (last 24 hours)
        const now = new Date()

        // Initialize hourly arrays with zeros (24 hours)
        const hourlyPatients = new Array(24).fill(0)
        const hourlyRevenue = new Array(24).fill(0)
        const hourlyAppointments = new Array(24).fill(0)
        const hourLabels = []

        // Generate hour labels (last 24 hours, oldest to newest)
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now)
            hour.setHours(now.getHours() - (23 - i))
            hour.setMinutes(0)
            hour.setSeconds(0)
            hour.setMilliseconds(0)

            const label = hour.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
            hourLabels.push(label)
        }

        // Process all non-cancelled appointments from last 24 hours
        allAppointments
            .filter(apt => !apt.cancelled)
            .forEach(apt => {
                const aptDate = new Date(apt.date)
                const hoursDiff = (now - aptDate) / (1000 * 60 * 60) // Hours difference

                // Only include appointments from last 24 hours
                if (hoursDiff >= 0 && hoursDiff < 24) {
                    // Calculate which hour bucket this appointment belongs to
                    // hoursDiff = 0 means current hour, 23 means 23 hours ago
                    const hourIndex = Math.floor(hoursDiff)
                    const arrayIndex = 23 - hourIndex // arrayIndex 0 = 23 hours ago, 23 = current hour

                    if (arrayIndex >= 0 && arrayIndex < 24) {
                        hourlyAppointments[arrayIndex]++
                        hourlyRevenue[arrayIndex] += (apt.amount || 0)
                        hourlyPatients[arrayIndex]++ // Count patient visits per hour
                    }
                }
            })

        const dashData = {
            doctors: doctors.length,
            activeDoctors: activeDoctors,
            appointments: allAppointments.length,
            appointmentsToday: todayAppointments.length,
            patients: users.length,
            patientsToday: totalPatientsToday, // Unique patients who booked today
            revenueToday: todayRevenue,
            revenueMonthly: monthlyRevenue,
            revenueTotal: totalRevenue,
            latestAppointments: allAppointments.reverse().slice(0, 10), // Latest 10 appointments
            // Chart data (last 24 hours)
            chartData: {
                patientGrowth: {
                    labels: hourLabels,
                    values: hourlyPatients
                },
                revenue: {
                    labels: hourLabels,
                    values: hourlyRevenue
                },
                appointments: {
                    labels: hourLabels,
                    values: hourlyAppointments
                }
            }
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete all appointments
const deleteAllAppointments = async (req, res) => {
    try {
        // Get count before deletion
        const countBefore = await appointmentModel.countDocuments({})

        // Delete all appointments
        const result = await appointmentModel.deleteMany({})

        // Also clear all doctor slots
        const doctors = await doctorModel.find({})
        for (const doctor of doctors) {
            await doctorModel.findByIdAndUpdate(doctor._id, { slots_booked: {} })
        }

        console.log(`✅ Deleted ${result.deletedCount} appointments`)

        res.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} appointments`,
            deletedCount: result.deletedCount
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Helper function to generate password starting with "pms"
const generatePassword = () => {
    const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const randomPart = Array.from({ length: 5 }, () => 
        randomChars.charAt(Math.floor(Math.random() * randomChars.length))
    ).join('');
    return `pms${randomPart}`;
}

// Helper function to generate employee ID
const generateEmployeeId = () => {
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `PMS${randomNum}`;
}

// API for bulk doctor upload preview (parse file and return preview without saving)
const bulkAddDoctorsPreview = async (req, res) => {
    try {
        const file = req.file;
        
        if (!file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        let doctorsData = [];

        // Parse CSV file
        if (fileExtension === 'csv') {
            const results = [];
            const readStream = createReadStream(file.path);
            
            await new Promise((resolve, reject) => {
                readStream
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            doctorsData = results.map(row => ({
                name: row.name || row.Name || row.NAME || '',
                email: row.email || row.Email || row.EMAIL || '',
                speciality: row.speciality || row.Speciality || row.SPECIALITY || row.specialty || row.Specialty || 'General physician',
                degree: row.degree || row.Degree || row.DEGREE || 'MBBS',
                experience: row.experience || row.Experience || row.EXPERIENCE || '1 Year',
                about: row.about || row.About || row.ABOUT || `Experienced ${row.speciality || 'General physician'}`,
                fees: parseFloat(row.fees || row.Fees || row.FEES || row.fee || row.Fee || 500) || 500,
                addressLine1: row.addressLine1 || row.AddressLine1 || row.address || row.Address || row.address1 || row.Address1 || '',
                addressLine2: row.addressLine2 || row.AddressLine2 || row.city || row.City || row.CITY || row.address2 || row.Address2 || ''
            }));
        }
        // Parse Excel file
        else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            doctorsData = data.map(row => ({
                name: row.name || row.Name || row.NAME || '',
                email: row.email || row.Email || row.EMAIL || '',
                speciality: row.speciality || row.Speciality || row.SPECIALITY || row.specialty || row.Specialty || 'General physician',
                degree: row.degree || row.Degree || row.DEGREE || 'MBBS',
                experience: row.experience || row.Experience || row.EXPERIENCE || '1 Year',
                about: row.about || row.About || row.ABOUT || `Experienced ${row.speciality || 'General physician'}`,
                fees: parseFloat(row.fees || row.Fees || row.FEES || row.fee || row.Fee || 500) || 500,
                addressLine1: row.addressLine1 || row.AddressLine1 || row.address || row.Address || row.address1 || row.Address1 || '',
                addressLine2: row.addressLine2 || row.AddressLine2 || row.city || row.City || row.CITY || row.address2 || row.Address2 || ''
            }));
        } else {
            // Delete uploaded file
            fs.unlinkSync(file.path);
            return res.json({ success: false, message: "Unsupported file format. Please upload CSV or Excel file." });
        }

        if (doctorsData.length === 0) {
            fs.unlinkSync(file.path);
            return res.json({ success: false, message: "No data found in file" });
        }

        // Validate and prepare preview data
        const preview = [];
        const errors = [];

        for (let i = 0; i < doctorsData.length; i++) {
            const doctorData = doctorsData[i];
            const rowNum = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

            // Validate required fields
            if (!doctorData.name || !doctorData.email) {
                errors.push({
                    row: rowNum,
                    email: doctorData.email || 'N/A',
                    name: doctorData.name || 'N/A',
                    reason: 'Missing name or email'
                });
                continue;
            }

            // Validate email format
            if (!validator.isEmail(doctorData.email)) {
                errors.push({
                    row: rowNum,
                    email: doctorData.email,
                    name: doctorData.name,
                    reason: 'Invalid email format'
                });
                continue;
            }

            // Check if doctor already exists
            const existingDoctor = await doctorModel.findOne({ email: doctorData.email.toLowerCase() });
            if (existingDoctor) {
                errors.push({
                    row: rowNum,
                    email: doctorData.email,
                    name: doctorData.name,
                    reason: 'Email already exists'
                });
                continue;
            }

            // Generate password and employee ID for preview
            const password = generatePassword();
            const employeeId = generateEmployeeId();

            preview.push({
                row: rowNum,
                name: doctorData.name,
                email: doctorData.email.toLowerCase(),
                speciality: doctorData.speciality,
                degree: doctorData.degree,
                experience: doctorData.experience,
                about: doctorData.about,
                fees: doctorData.fees,
                address: {
                    line1: doctorData.addressLine1,
                    line2: doctorData.addressLine2
                },
                password: password, // Show in preview
                employeeId: employeeId // Show in preview
            });
        }

        // Store file path temporarily (in production, use a proper temp storage)
        // For now, we'll keep the file and use it in the confirm endpoint
        const tempFileId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // In production, you might want to store this in Redis or a database
        // For now, we'll return the preview and expect the client to send the data back

        res.json({
            success: true,
            preview: preview,
            errors: errors,
            summary: {
                total: doctorsData.length,
                valid: preview.length,
                invalid: errors.length
            },
            tempFileId: tempFileId // Client will send this back with confirm
        });

    } catch (error) {
        console.error('Error in bulkAddDoctorsPreview:', error);
        
        // Try to delete file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.json({ success: false, message: error.message || 'Failed to process file' });
    }
}

// API for bulk doctor upload confirmation (save to database)
const bulkAddDoctors = async (req, res) => {
    try {
        // Get preview data from request body (sent from frontend after preview)
        const { previewData } = req.body;
        
        if (!previewData || !Array.isArray(previewData) || previewData.length === 0) {
            return res.json({ success: false, message: "No doctor data provided" });
        }

        const results = {
            success: [],
            failed: []
        };

        // Process each doctor from preview
        for (const doctorData of previewData) {
            try {
                // Use password and employeeId from preview data
                const password = doctorData.password;
                const employeeId = doctorData.employeeId;
                
                if (!password || !employeeId) {
                    results.failed.push({
                        email: doctorData.email,
                        name: doctorData.name,
                        reason: 'Missing password or employee ID from preview'
                    });
                    continue;
                }

                // Double-check if doctor already exists (in case it was created between preview and confirm)
                const existingDoctor = await doctorModel.findOne({ email: doctorData.email.toLowerCase() });
                if (existingDoctor) {
                    results.failed.push({
                        email: doctorData.email,
                        name: doctorData.name,
                        reason: 'Email already exists'
                    });
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Generate default image URL (using UI Avatars)
                const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData.name)}&background=667eea&color=fff&size=200`;

                // Create doctor
                const newDoctor = new doctorModel({
                    name: doctorData.name,
                    email: doctorData.email.toLowerCase(),
                    password: hashedPassword,
                    image: imageUrl,
                    speciality: doctorData.speciality,
                    degree: doctorData.degree,
                    experience: doctorData.experience,
                    about: doctorData.about,
                    fees: doctorData.fees,
                    available: true, // Ensure doctors are available by default
                    address: doctorData.address || {
                        line1: doctorData.addressLine1 || '',
                        line2: doctorData.addressLine2 || ''
                    },
                    date: Date.now()
                });

                await newDoctor.save();

                // Send welcome email with credentials
                try {
                    await sendDoctorWelcomeEmail(doctorData.email, {
                        name: doctorData.name,
                        password: password,
                        employeeId: employeeId
                    });
                } catch (emailError) {
                    console.error(`⚠️ Failed to send welcome email to ${doctorData.email}:`, emailError.message);
                    // Continue even if email fails - doctor is still created
                }

                results.success.push({
                    email: doctorData.email,
                    name: doctorData.name,
                    password: password,
                    employeeId: employeeId
                });

            } catch (error) {
                console.error(`Error processing doctor ${doctorData.email}:`, error);
                results.failed.push({
                    email: doctorData.email || 'N/A',
                    name: doctorData.name || 'N/A',
                    reason: error.message || 'Unknown error'
                });
            }
        }

        res.json({
            success: true,
            message: `Processed ${previewData.length} doctors. ${results.success.length} created successfully, ${results.failed.length} failed.`,
            results: {
                total: previewData.length,
                successful: results.success.length,
                failed: results.failed.length,
                details: {
                    success: results.success,
                    failed: results.failed
                }
            }
        });

    } catch (error) {
        console.error('Error in bulkAddDoctors:', error);
        res.json({ success: false, message: error.message || 'Failed to process bulk upload' });
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard,
    deleteAllAppointments,
    updateDoctor,
    bulkAddDoctorsPreview,
    bulkAddDoctors
}