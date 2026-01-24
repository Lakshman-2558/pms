import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";


export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')

    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [dashData, setDashData] = useState(false)
    const [hospitals, setHospitals] = useState([])

    // Getting all Doctors data from Database using API
    const getAllDoctors = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
                if (data.message === 'Invalid Session. Please login again.' || data.message === 'Not Authorized Login Again') {
                    localStorage.removeItem('aToken')
                    setAToken('')
                }
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Function to change doctor availablity using API
    const changeAvailability = async (docId) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    // Getting all appointment data from Database using API
    const getAllAppointments = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
                if (data.message === 'Invalid Session. Please login again.' || data.message === 'Not Authorized Login Again') {
                    localStorage.removeItem('aToken')
                    setAToken('')
                }
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Function to cancel appointment using API
    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Getting Admin Dashboard data from Database using API
    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
                if (data.message === 'Invalid Session. Please login again.' || data.message === 'Not Authorized Login Again') {
                    localStorage.removeItem('aToken')
                    setAToken('')
                }
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    // Function to delete all appointments
    const deleteAllAppointments = async () => {
        try {
            const { data } = await axios.delete(backendUrl + '/api/admin/delete-all-appointments', { headers: { aToken } })

            if (data.success) {
                toast.success(`✅ ${data.message}`)
                // Refresh all data
                await Promise.all([
                    getDashData(),
                    getAllAppointments(),
                    getAllDoctors()
                ])
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message || 'Failed to delete appointments')
        }
    }


    // Function to get all hospitals
    const getAllHospitals = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital-tieup/all', { headers: { aToken } })
            if (data.success) {
                setHospitals(data.hospitals)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to add hospital
    const addHospital = async (hospitalData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/hospital-tieup/add', hospitalData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await getAllHospitals()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // Function to update hospital
    const updateHospital = async (hospitalData) => {
        try {
            const { data } = await axios.put(backendUrl + '/api/hospital-tieup/update', hospitalData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await getAllHospitals()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // Function to delete hospital
    const deleteHospital = async (id) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/hospital-tieup/delete', { id }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await getAllHospitals()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to add doctor to hospital
    const addDoctorToHospital = async (hospitalId, doctorData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/hospital-tieup/doctor/add', { hospitalId, doctorData }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await getAllHospitals()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // Function to update doctor in hospital
    const updateDoctorInHospital = async (hospitalId, doctorId, doctorData) => {
        try {
            const { data } = await axios.put(backendUrl + '/api/hospital-tieup/doctor/update', { hospitalId, doctorId, doctorData }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await getAllHospitals()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // Function to delete doctor from hospital
    const deleteDoctorFromHospital = async (hospitalId, doctorId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/hospital-tieup/doctor/delete', { hospitalId, doctorId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await getAllHospitals()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.message)
            return false
        }
    }

    // Function to bulk upload hospital doctors preview
    const bulkAddHospitalDoctorsPreview = async (hospitalId, file) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('hospitalId', hospitalId)

            const { data } = await axios.post(backendUrl + '/api/hospital-tieup/doctor/bulk-preview', formData, {
                headers: { 
                    aToken,
                    'Content-Type': 'multipart/form-data'
                }
            })
            // Return data regardless of success/failure so frontend can handle the error message
            return data
        } catch (error) {
            // Handle axios errors
            const errorMessage = error.response?.data?.message || error.message || 'Failed to process file'
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // Function to bulk upload hospital doctors confirm
    const bulkAddHospitalDoctors = async (hospitalId, previewData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/hospital-tieup/doctor/bulk-add', {
                hospitalId,
                previewData
            }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await getAllHospitals()
                return data
            } else {
                toast.error(data.message)
                return null
            }
        } catch (error) {
            toast.error(error.message)
            return null
        }
    }

    const value = {
        aToken, setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData,
        deleteAllAppointments,
        hospitals,
        getAllHospitals,
        addHospital,
        updateHospital,
        deleteHospital,
        addDoctorToHospital,
        updateDoctorInHospital,
        deleteDoctorFromHospital,
        bulkAddHospitalDoctorsPreview,
        bulkAddHospitalDoctors,
        migrateEmbeddedDoctors: async () => {
            try {
                const { data } = await axios.post(backendUrl + '/api/hospital-tieup/doctor/migrate', {}, { headers: { aToken } })
                if (data.success) {
                    toast.success(data.message)
                    await getAllHospitals()
                    return data
                } else {
                    toast.error(data.message)
                    return null
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message)
                return null
            }
        }
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider