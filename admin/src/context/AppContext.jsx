import { createContext } from "react";


export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        try {
            if (!slotDate) return "Date not set"
            const dateArray = slotDate.split('_')
            if (dateArray.length !== 3) return "Invalid date"
            const day = dateArray[0]
            const monthIndex = Number(dateArray[1])
            const year = dateArray[2]
            
            if (!months[monthIndex]) return "Invalid date"
            
            return day + " " + months[monthIndex] + " " + year
        } catch (error) {
            return "Invalid date"
        }
    }

    // Function to calculate the age eg. ( 20_01_2000 => 24 )
    const calculateAge = (dob) => {
        try {
            if (!dob) return "N/A"
            const today = new Date()
            const birthDate = new Date(dob)
            
            if (isNaN(birthDate.getTime())) return "N/A"
            
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            
            return age > 0 ? age : "N/A"
        } catch (error) {
            return "N/A"
        }
    }

    const value = {
        backendUrl,
        currency,
        slotDateFormat,
        calculateAge,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider