import hospitalModel from "../models/hospitalModel.js";
import doctorModel from "../models/doctorModel.js";

// API to get all hospitals list for Frontend
const hospitalList = async (req, res) => {
    try {
        const hospitals = await hospitalModel.find({}).sort({ hospitalType: 1, hospitalName: 1 });
        res.json({ success: true, hospitals });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get doctors by hospital ID
const getDoctorsByHospital = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        
        // Verify hospital exists
        const hospital = await hospitalModel.findById(hospitalId);
        if (!hospital) {
            return res.json({ success: false, message: "Hospital not found" });
        }

        // Get doctors for this hospital
        const doctors = await doctorModel.find({ hospitalId })
            .select(['-password', '-email'])
            .sort({ available: -1, name: 1 });
        
        res.json({ 
            success: true, 
            doctors,
            hospital: {
                _id: hospital._id,
                hospitalName: hospital.hospitalName,
                location: hospital.location,
                contact: hospital.contact,
                hospitalType: hospital.hospitalType
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    hospitalList,
    getDoctorsByHospital
};
