import HospitalTieUp from "../models/hospitalTieUpModel.js";
import doctorModel from "../models/doctorModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import XLSX from "xlsx";
import fs from "fs";
import csv from "csv-parser";
import { createReadStream } from "fs";
import { sendDoctorWelcomeEmail } from "../services/emailService.js";

// Helper function to generate password
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

// Get all hospitals (for admin)
const getHospitals = async (req, res) => {
    try {
        const hospitals = await HospitalTieUp.find({});

        // Remove any hardcoded "Dr. Sample Doctor" entries from existing hospitals
        let cleanedCount = 0;
        for (const hospital of hospitals) {
            if (hospital.doctors && hospital.doctors.length > 0) {
                const originalLength = hospital.doctors.length;
                // Filter out hardcoded sample doctors
                hospital.doctors = hospital.doctors.filter(doc => 
                    !doc.name || !doc.name.includes('Sample Doctor')
                );
                if (hospital.doctors.length !== originalLength) {
                    await hospital.save();
                    cleanedCount++;
                }
            }
        }

        if (cleanedCount > 0) {
            console.log(`Removed hardcoded sample doctors from ${cleanedCount} hospitals`);
            // Re-fetch to get the updated data
            const updatedHospitals = await HospitalTieUp.find({});
            return res.json({ success: true, hospitals: updatedHospitals });
        }

        res.json({ success: true, hospitals });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add a new hospital
const addHospital = async (req, res) => {
    try {
        const { name, address, contact, specialization, type, showOnHome } = req.body;

        if (!name || !address || !contact || !specialization) {
            return res.json({ success: false, message: "Missing required details" });
        }

        const newHospital = new HospitalTieUp({
            name,
            address,
            contact,
            specialization,
            type: type || "General",
            showOnHome: showOnHome || false,
            doctors: [] // Initialize with empty doctors
        });

        await newHospital.save();
        res.json({ success: true, message: "Hospital Added Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update hospital details
const updateHospital = async (req, res) => {
    try {
        const { id, name, address, contact, specialization, type, showOnHome } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Hospital ID is required" });
        }

        await HospitalTieUp.findByIdAndUpdate(id, {
            name,
            address,
            contact,
            specialization,
            type,
            showOnHome
        });

        res.json({ success: true, message: "Hospital Updated Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete a hospital
const deleteHospital = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Hospital ID is required" });
        }

        await HospitalTieUp.findByIdAndDelete(id);
        res.json({ success: true, message: "Hospital Deleted Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get public hospitals (showOnHome: true)
const getPublicHospitals = async (req, res) => {
    try {
        const hospitals = await HospitalTieUp.find({ showOnHome: true }).select('-doctors'); // Don't send doctors list for home page summary
        res.json({ success: true, hospitals });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all public hospitals with doctors (for frontend hospital listing page)
const getAllPublicHospitalsWithDoctors = async (req, res) => {
    try {
        const hospitals = await HospitalTieUp.find({});
        
        // Get all real doctors from doctorModel that have hospitalId set
        const realDoctors = await doctorModel.find({ 
            hospitalId: { $exists: true, $ne: null },
            available: true 
        });

        // Filter visible doctors and return hospitals with their doctors
        const hospitalsWithDoctors = hospitals.map(hospital => {
            const hospitalData = hospital.toObject();
            
            // Get real doctors assigned to this hospital
            const assignedRealDoctors = realDoctors
                .filter(doc => doc.hospitalId?.toString() === hospital._id.toString())
                .map(doc => {
                    // Extract experience number from string
                    let experienceNum = 0;
                    if (doc.experience) {
                        const match = doc.experience.toString().match(/(\d+)/);
                        experienceNum = match ? parseInt(match[1]) : 0;
                    }

                    return {
                        _id: doc._id,
                        name: doc.name,
                        qualification: doc.degree || 'MBBS',
                        specialization: doc.speciality || hospital.specialization,
                        experience: experienceNum,
                        image: doc.image || '',
                        available: doc.available !== undefined ? doc.available : true,
                        showOnHospitalPage: true
                    };
                });

            // Filter embedded doctors that are NOT "Sample Doctor" entries
            // Also exclude embedded doctors that already exist in doctors collection (to avoid duplicates)
            const realDoctorNames = new Set(assignedRealDoctors.map(doc => doc.name.toLowerCase()));
            const realDoctorEmails = new Set(assignedRealDoctors.map(doc => {
                // Find matching embedded doctor to get email
                const embeddedMatch = hospital.doctors.find(ed => 
                    ed.name && ed.name.toLowerCase() === doc.name.toLowerCase()
                );
                return embeddedMatch?.email?.toLowerCase();
            }).filter(Boolean));

            const embeddedDoctors = (hospital.doctors || [])
                .filter(doc => {
                    // Skip if name matches a real doctor (to avoid duplicates)
                    if (doc.name && realDoctorNames.has(doc.name.toLowerCase())) {
                        return false;
                    }
                    // Skip if email matches a real doctor (to avoid duplicates)
                    if (doc.email && realDoctorEmails.has(doc.email.toLowerCase())) {
                        return false;
                    }
                    // Standard filters
                    return doc.showOnHospitalPage && 
                        doc.name && 
                        !doc.name.includes('Sample Doctor');
                });

            // Combine real doctors and valid embedded doctors (no duplicates)
            hospitalData.doctors = [...assignedRealDoctors, ...embeddedDoctors];
            return hospitalData;
        });

        res.json({ success: true, hospitals: hospitalsWithDoctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get specific hospital details (public)
const getHospitalDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await HospitalTieUp.findById(id);

        if (!hospital) {
            return res.json({ success: false, message: "Hospital not found" });
        }

        // Get real doctors assigned to this hospital
        const realDoctors = await doctorModel.find({ 
            hospitalId: hospital._id,
            available: true 
        });

        const assignedRealDoctors = realDoctors.map(doc => {
            // Extract experience number from string
            let experienceNum = 0;
            if (doc.experience) {
                const match = doc.experience.toString().match(/(\d+)/);
                experienceNum = match ? parseInt(match[1]) : 0;
            }

            return {
                _id: doc._id,
                name: doc.name,
                qualification: doc.degree || 'MBBS',
                specialization: doc.speciality || hospital.specialization,
                experience: experienceNum,
                image: doc.image || '',
                available: doc.available !== undefined ? doc.available : true,
                showOnHospitalPage: true
            };
        });

        // Filter embedded doctors that are visible and NOT "Sample Doctor" entries
        // Also exclude embedded doctors that already exist in doctors collection (to avoid duplicates)
        const embeddedDoctorsEmails = new Set(assignedRealDoctors.map(doc => {
            // Try to find email from embedded array that matches this real doctor
            const embeddedMatch = hospital.doctors.find(ed => 
                ed.name && ed.name.toLowerCase() === doc.name.toLowerCase()
            );
            return embeddedMatch?.email?.toLowerCase();
        }).filter(Boolean));

        const embeddedDoctors = (hospital.doctors || [])
            .filter(doc => {
                // Skip if already in real doctors collection (by email match)
                if (doc.email && embeddedDoctorsEmails.has(doc.email.toLowerCase())) {
                    return false;
                }
                // Skip if name matches a real doctor (to avoid duplicates)
                const nameMatch = assignedRealDoctors.find(rd => 
                    rd.name.toLowerCase() === doc.name?.toLowerCase()
                );
                if (nameMatch) {
                    return false;
                }
                // Standard filters
                return doc.showOnHospitalPage && 
                    doc.name && 
                    !doc.name.includes('Sample Doctor');
            });

        // Combine real doctors and valid embedded doctors (no duplicates)
        const hospitalData = hospital.toObject();
        hospitalData.doctors = [...assignedRealDoctors, ...embeddedDoctors];

        res.json({ success: true, hospital: hospitalData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get ALL doctors from all public hospitals (aggregated)
// Only returns real doctors from doctorModel that are assigned to hospitals
const getAllHospitalDoctors = async (req, res) => {
    try {
        const hospitals = await HospitalTieUp.find({ showOnHome: true });
        let allDoctors = [];

        // Get all real doctors from doctorModel that have hospitalId set
        const realDoctors = await doctorModel.find({ 
            hospitalId: { $exists: true, $ne: null },
            available: true 
        }).populate('hospitalId');

        // Map real doctors to hospital doctor format
        realDoctors.forEach(doc => {
            const hospital = hospitals.find(h => 
                h._id.toString() === doc.hospitalId?.toString()
            );
            
            if (hospital) {
                // Extract experience number from string (e.g., "10 Years" -> 10)
                let experienceNum = 0;
                if (doc.experience) {
                    const match = doc.experience.toString().match(/(\d+)/);
                    experienceNum = match ? parseInt(match[1]) : 0;
                }

                allDoctors.push({
                    _id: doc._id,
                    name: doc.name,
                    qualification: doc.degree || 'MBBS',
                    specialization: doc.speciality || hospital.specialization,
                    experience: experienceNum,
                    image: doc.image || '',
                    available: doc.available !== undefined ? doc.available : true,
                    showOnHospitalPage: true,
                    hospitalName: hospital.name,
                    address: { line1: hospital.address, line2: hospital.specialization },
                    isHospitalDoctor: true,
                    hospitalId: hospital._id
                });
            }
        });

        // Also include embedded hospital doctors that are NOT "Sample Doctor" entries
        // (for backward compatibility with manually added hospital doctors)
        // But exclude duplicates - only include embedded doctors that don't exist in doctors collection
        const realDoctorNamesAndEmails = new Set();
        allDoctors.forEach(doc => {
            if (doc.name) realDoctorNamesAndEmails.add(doc.name.toLowerCase());
            // Also track by email if available
            if (doc.email) realDoctorNamesAndEmails.add(doc.email.toLowerCase());
        });

        hospitals.forEach(hospital => {
            const embeddedDoctors = (hospital.doctors || [])
                .filter(doc => {
                    // Skip if name or email matches a real doctor (to avoid duplicates)
                    if (doc.name && realDoctorNamesAndEmails.has(doc.name.toLowerCase())) {
                        return false;
                    }
                    if (doc.email && realDoctorNamesAndEmails.has(doc.email.toLowerCase())) {
                        return false;
                    }
                    // Standard filters
                    return doc.showOnHospitalPage && 
                        doc.name && 
                        !doc.name.includes('Sample Doctor');
                })
                .map(doc => ({
                    ...doc.toObject(),
                    hospitalName: hospital.name,
                    address: { line1: hospital.address, line2: hospital.specialization },
                    isHospitalDoctor: true,
                    hospitalId: hospital._id
                }));
            allDoctors = [...allDoctors, ...embeddedDoctors];
        });

        res.json({ success: true, doctors: allDoctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// --- DOCTOR MANAGEMENT CONTROLLERS ---

// Add Doctor to Hospital
const addDoctorToHospital = async (req, res) => {
    try {
        const { hospitalId, doctorData } = req.body;

        if (!hospitalId || !doctorData) {
            return res.json({ success: false, message: "Missing required data" });
        }

        const hospital = await HospitalTieUp.findById(hospitalId);
        if (!hospital) {
            return res.json({ success: false, message: "Hospital not found" });
        }

        // Generate email if not provided
        let email = doctorData.email;
        if (!email || !email.trim()) {
            const namePart = doctorData.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
            const hospitalPart = hospital.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
            const baseEmail = `${namePart}@${hospitalPart}.pms.local`;
            
            // Check if this generated email already exists, if so add a number
            let uniqueEmail = baseEmail;
            let counter = 1;
            while (await doctorModel.findOne({ email: uniqueEmail })) {
                uniqueEmail = `${namePart}${counter}@${hospitalPart}.pms.local`;
                counter++;
            }
            email = uniqueEmail;
        } else {
            email = email.toLowerCase().trim();
        }

        // Check if doctor already exists in doctors collection
        const existingDoctorInCollection = await doctorModel.findOne({ email });
        if (existingDoctorInCollection) {
            return res.json({ success: false, message: "Doctor with this email already exists in doctors collection" });
        }

        // Generate password if not provided
        const password = doctorData.password || generatePassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Use placeholder image since image is required
        const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData.name)}&background=667eea&color=fff&size=200`;

        // Create doctor in doctors collection
        const newDoctor = new doctorModel({
            name: doctorData.name,
            email: email,
            password: hashedPassword,
            image: placeholderImage,
            speciality: doctorData.specialization || hospital.specialization,
            degree: doctorData.qualification || 'MBBS',
            experience: doctorData.experience ? `${doctorData.experience} Years` : '0 Years',
            about: `Dr. ${doctorData.name} is a specialist in ${doctorData.specialization || hospital.specialization} at ${hospital.name}.`,
            available: doctorData.available !== undefined ? doctorData.available : true,
            fees: 0, // Default fee - can be updated later
            address: {
                line1: hospital.address,
                line2: hospital.specialization
            },
            date: Date.now(),
            hospitalId: hospital._id,
            hospital: hospital.name
        });

        await newDoctor.save();

        // Also add doctor to hospital's embedded doctors array (for backward compatibility)
        const doctorDataWithEmail = {
            ...doctorData,
            email: email,
            password: password // Store unhashed password for reference (not used for login)
        };

        hospital.doctors.push(doctorDataWithEmail);
        await hospital.save();

        res.json({ 
            success: true, 
            message: "Doctor Added Successfully",
            doctor: {
                email: email,
                password: password // Return password so admin can see it (if needed)
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update Doctor in Hospital
const updateDoctorInHospital = async (req, res) => {
    try {
        const { hospitalId, doctorId, doctorData } = req.body;

        const hospital = await HospitalTieUp.findById(hospitalId);
        if (!hospital) {
            return res.json({ success: false, message: "Hospital not found" });
        }

        const doctorIndex = hospital.doctors.findIndex(doc => doc._id.toString() === doctorId);
        if (doctorIndex === -1) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        // Update fields
        hospital.doctors[doctorIndex] = { ...hospital.doctors[doctorIndex].toObject(), ...doctorData, _id: doctorId }; // Enhance: be specific about fields for safety
        await hospital.save();

        res.json({ success: true, message: "Doctor Updated Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete Doctor from Hospital
const deleteDoctorFromHospital = async (req, res) => {
    try {
        const { hospitalId, doctorId } = req.body;

        const hospital = await HospitalTieUp.findById(hospitalId);
        if (!hospital) {
            return res.json({ success: false, message: "Hospital not found" });
        }

        // Find the doctor in the embedded array to get email
        const doctorToDelete = hospital.doctors.find(doc => doc._id.toString() === doctorId);
        
        // Remove from embedded doctors array
        hospital.doctors = hospital.doctors.filter(doc => doc._id.toString() !== doctorId);
        await hospital.save();

        // Also remove from doctors collection if it exists (by email)
        if (doctorToDelete && doctorToDelete.email) {
            try {
                await doctorModel.findOneAndDelete({ 
                    email: doctorToDelete.email.toLowerCase(),
                    hospitalId: hospital._id
                });
            } catch (deleteError) {
                console.log(`Note: Doctor not found in doctors collection or already deleted: ${deleteError.message}`);
                // Continue - it's okay if doctor doesn't exist in doctors collection
            }
        }

        res.json({ success: true, message: "Doctor Removed Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// --- BULK UPLOAD DOCTORS TO HOSPITAL ---

// API for bulk hospital doctor upload preview (parse file and return preview without saving)
const bulkAddHospitalDoctorsPreview = async (req, res) => {
    try {
        const file = req.file;
        const { hospitalId } = req.body;
        
        if (!file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        if (!hospitalId) {
            // Delete uploaded file
            if (file.path) {
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }
            return res.json({ success: false, message: "Hospital ID is required" });
        }

        // Verify hospital exists
        const hospital = await HospitalTieUp.findById(hospitalId);
        if (!hospital) {
            // Delete uploaded file
            if (file.path) {
                try {
                    fs.unlinkSync(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }
            return res.json({ success: false, message: "Hospital not found" });
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
                hospitalName: row.hospitalName || row.HospitalName || row.HOSPITAL_NAME || row.hospital || row.Hospital || '',
                qualification: row.qualification || row.Qualification || row.QUALIFICATION || row.degree || row.Degree || 'MBBS',
                specialization: row.specialization || row.Specialization || row.SPECIALIZATION || row.speciality || row.Speciality || hospital.specialization,
                experience: row.experience || row.Experience || row.EXPERIENCE || '0'
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
                hospitalName: row.hospitalName || row.HospitalName || row.HOSPITAL_NAME || row.hospital || row.Hospital || '',
                qualification: row.qualification || row.Qualification || row.QUALIFICATION || row.degree || row.Degree || 'MBBS',
                specialization: row.specialization || row.Specialization || row.SPECIALIZATION || row.speciality || row.Speciality || hospital.specialization,
                experience: row.experience || row.Experience || row.EXPERIENCE || '0'
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

        // Check if hospital name is present in CSV and validate it matches
        const firstRowHospitalName = doctorsData[0]?.hospitalName?.trim();
        if (!firstRowHospitalName) {
            fs.unlinkSync(file.path);
            return res.json({ 
                success: false, 
                message: `Hospital name is required in CSV file. Expected: "${hospital.name}"` 
            });
        }

        // Validate hospital name matches (case-insensitive)
        if (firstRowHospitalName.toLowerCase() !== hospital.name.toLowerCase()) {
            fs.unlinkSync(file.path);
            return res.json({ 
                success: false, 
                message: `Hospital name mismatch! CSV contains "${firstRowHospitalName}" but you're uploading to "${hospital.name}". Please check your file.` 
            });
        }

        // Validate and prepare preview data
        const preview = [];
        const errors = [];

        for (let i = 0; i < doctorsData.length; i++) {
            const doctorData = doctorsData[i];
            const rowNum = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

            // Validate hospital name for each row (all rows should have same hospital name)
            const rowHospitalName = doctorData.hospitalName?.trim();
            if (!rowHospitalName) {
                errors.push({
                    row: rowNum,
                    email: doctorData.email || 'N/A',
                    name: doctorData.name || 'N/A',
                    reason: 'Missing hospital name in row'
                });
                continue;
            }

            if (rowHospitalName.toLowerCase() !== hospital.name.toLowerCase()) {
                errors.push({
                    row: rowNum,
                    email: doctorData.email || 'N/A',
                    name: doctorData.name || 'N/A',
                    reason: `Hospital name mismatch: "${rowHospitalName}" (expected: "${hospital.name}")`
                });
                continue;
            }

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

            // Check if doctor already exists in this hospital
            const existingDoctor = hospital.doctors.find(doc => 
                doc.email && doc.email.toLowerCase() === doctorData.email.toLowerCase()
            );
            if (existingDoctor) {
                errors.push({
                    row: rowNum,
                    email: doctorData.email,
                    name: doctorData.name,
                    reason: 'Doctor with this email already exists in this hospital'
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
                qualification: doctorData.qualification,
                specialization: doctorData.specialization,
                experience: doctorData.experience,
                password: password, // Show in preview
                employeeId: employeeId // Show in preview
            });
        }

        res.json({
            success: true,
            preview: preview,
            errors: errors,
            summary: {
                total: doctorsData.length,
                valid: preview.length,
                invalid: errors.length
            },
            hospitalName: hospital.name
        });

    } catch (error) {
        console.error('Error in bulkAddHospitalDoctorsPreview:', error);
        
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

// API for bulk hospital doctor upload confirmation (save to database)
const bulkAddHospitalDoctors = async (req, res) => {
    try {
        const { hospitalId, previewData } = req.body;
        
        if (!hospitalId) {
            return res.json({ success: false, message: "Hospital ID is required" });
        }

        if (!previewData || !Array.isArray(previewData) || previewData.length === 0) {
            return res.json({ success: false, message: "No doctor data provided" });
        }

        const hospital = await HospitalTieUp.findById(hospitalId);
        if (!hospital) {
            return res.json({ success: false, message: "Hospital not found" });
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

                // Double-check if doctor already exists in this hospital
                const existingDoctor = hospital.doctors.find(doc => 
                    doc.email && doc.email.toLowerCase() === doctorData.email.toLowerCase()
                );
                if (existingDoctor) {
                    results.failed.push({
                        email: doctorData.email,
                        name: doctorData.name,
                        reason: 'Doctor with this email already exists in this hospital'
                    });
                    continue;
                }

                // Hash password for doctorModel
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Check if doctor already exists in doctors collection by email
                const existingDoctorInCollection = await doctorModel.findOne({ 
                    email: doctorData.email.toLowerCase() 
                });

                if (existingDoctorInCollection) {
                    results.failed.push({
                        email: doctorData.email,
                        name: doctorData.name,
                        reason: 'Doctor with this email already exists in doctors collection'
                    });
                    continue;
                }

                // Create doctor in doctors collection
                // Use a placeholder image URL since image is required
                const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorData.name)}&background=667eea&color=fff&size=200`;
                
                const newDoctor = new doctorModel({
                    name: doctorData.name,
                    email: doctorData.email.toLowerCase(),
                    password: hashedPassword,
                    image: placeholderImage, // Placeholder - doctor will upload their own photo
                    speciality: doctorData.specialization || hospital.specialization,
                    degree: doctorData.qualification || 'MBBS',
                    experience: `${parseInt(doctorData.experience) || 0} Years`,
                    about: `Dr. ${doctorData.name} is a specialist in ${doctorData.specialization || hospital.specialization} at ${hospital.name}.`,
                    available: true,
                    fees: 0, // Default fee - can be updated later
                    address: {
                        line1: hospital.address,
                        line2: hospital.specialization
                    },
                    date: Date.now(),
                    hospitalId: hospital._id,
                    hospital: hospital.name
                });

                await newDoctor.save();

                // Also add doctor to hospital's embedded doctors array (for backward compatibility)
                const newDoctorData = {
                    name: doctorData.name,
                    email: doctorData.email.toLowerCase(),
                    qualification: doctorData.qualification,
                    specialization: doctorData.specialization,
                    experience: parseInt(doctorData.experience) || 0,
                    available: true,
                    showOnHospitalPage: true,
                    password: password, // Store password temporarily for email
                    employeeId: employeeId
                };

                hospital.doctors.push(newDoctorData);
                await hospital.save();

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
        console.error('Error in bulkAddHospitalDoctors:', error);
        res.json({ success: false, message: error.message || 'Failed to process bulk upload' });
    }
}

// Migrate existing embedded doctors to doctors collection
const migrateEmbeddedDoctors = async (req, res) => {
    try {
        const hospitals = await HospitalTieUp.find({});
        let migrated = 0;
        let skipped = 0;
        let errors = [];

        for (const hospital of hospitals) {
            if (!hospital.doctors || hospital.doctors.length === 0) {
                continue;
            }

            for (const embeddedDoc of hospital.doctors) {
                // Generate email if doctor doesn't have one
                let email;
                if (!embeddedDoc.email || !embeddedDoc.email.trim()) {
                    // Generate a unique email based on doctor name and hospital
                    const namePart = embeddedDoc.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
                    const hospitalPart = hospital.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                    const baseEmail = `${namePart}@${hospitalPart}.pms.local`;
                    
                    // Check if this generated email already exists, if so add a number
                    let uniqueEmail = baseEmail;
                    let counter = 1;
                    while (await doctorModel.findOne({ email: uniqueEmail })) {
                        uniqueEmail = `${namePart}${counter}@${hospitalPart}.pms.local`;
                        counter++;
                    }
                    email = uniqueEmail;
                } else {
                    email = embeddedDoc.email.toLowerCase().trim();
                }

                // Check if doctor already exists in doctors collection
                const existingDoctor = await doctorModel.findOne({ email });
                if (existingDoctor) {
                    skipped++;
                    continue;
                }

                try {
                    // Generate password if not present
                    const password = embeddedDoc.password || generatePassword();
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);

                    // Use placeholder image since image is required
                    const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(embeddedDoc.name)}&background=667eea&color=fff&size=200`;

                    // Create doctor in doctors collection
                    const newDoctor = new doctorModel({
                        name: embeddedDoc.name,
                        email: email,
                        password: hashedPassword,
                        image: embeddedDoc.image && embeddedDoc.image.trim() ? embeddedDoc.image : placeholderImage,
                        speciality: embeddedDoc.specialization || hospital.specialization,
                        degree: embeddedDoc.qualification || 'MBBS',
                        experience: embeddedDoc.experience ? `${embeddedDoc.experience} Years` : '0 Years',
                        about: `Dr. ${embeddedDoc.name} is a specialist in ${embeddedDoc.specialization || hospital.specialization} at ${hospital.name}.`,
                        available: embeddedDoc.available !== undefined ? embeddedDoc.available : true,
                        fees: 0, // Default fee - can be updated later
                        address: {
                            line1: hospital.address,
                            line2: hospital.specialization
                        },
                        date: Date.now(),
                        hospitalId: hospital._id,
                        hospital: hospital.name
                    });

                    await newDoctor.save();
                    migrated++;

                } catch (error) {
                    console.error(`Error migrating doctor ${email}:`, error.message);
                    errors.push({
                        email: email,
                        name: embeddedDoc.name,
                        error: error.message
                    });
                }
            }
        }

        res.json({
            success: true,
            message: `Migration completed. ${migrated} doctors migrated, ${skipped} skipped (already exist), ${errors.length} errors.`,
            results: {
                migrated,
                skipped,
                errors: errors.length,
                errorDetails: errors
            }
        });

    } catch (error) {
        console.error('Error in migrateEmbeddedDoctors:', error);
        res.json({ success: false, message: error.message || 'Failed to migrate doctors' });
    }
}

export {
    getHospitals,
    addHospital,
    updateHospital,
    deleteHospital,
    getPublicHospitals,
    getAllPublicHospitalsWithDoctors,
    getHospitalDetails,
    getAllHospitalDoctors,
    addDoctorToHospital,
    updateDoctorInHospital,
    deleteDoctorFromHospital,
    bulkAddHospitalDoctorsPreview,
    bulkAddHospitalDoctors,
    migrateEmbeddedDoctors
};
