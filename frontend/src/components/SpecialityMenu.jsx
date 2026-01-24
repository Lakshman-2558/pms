import React from 'react'
import { specialityData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const SpecialityMenu = () => {
    const navigate = useNavigate()

    const handleSpecialityClick = (speciality) => {
        navigate(`/doctors/${speciality}?from=home`)
        window.scrollTo(0, 0)
    }

    return (
        <div id='speciality' className='flex flex-col items-center gap-3 sm:gap-4 py-8 sm:py-12 md:py-16 text-[#262626] px-4'>
            <h1 className='text-xl sm:text-2xl font-medium'>Find by Speciality</h1>
            <p className='sm:w-2/3 md:w-1/3 text-center text-xs sm:text-sm'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8 pt-3 sm:pt-5 w-full max-w-4xl justify-items-center'>
                {specialityData.map((item, index) => (
                    <div 
                        onClick={() => handleSpecialityClick(item.speciality)}
                        className='flex flex-col items-center justify-center text-xs cursor-pointer transition-all duration-300 active:scale-90 group' 
                        key={index}
                    >
                        <div className='relative mb-1 sm:mb-2 flex items-center justify-center'>
                            {/* Light, elegant blue circle - subtle and stylish */}
                            <div className='absolute w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-2 border-blue-300 opacity-0 group-hover:opacity-60 group-active:opacity-60 transition-all duration-300 scale-100 group-hover:scale-110 group-active:scale-110'></div>
                            {/* Soft glow background on hover */}
                            <div className='absolute w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-blue-50 opacity-0 group-hover:opacity-40 group-active:opacity-40 transition-all duration-300 scale-100 group-hover:scale-110 group-active:scale-110'></div>
                            <img 
                                className='w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-110' 
                                src={item.image} 
                                alt={item.speciality} 
                            />
                        </div>
                        <p className='text-center text-[10px] sm:text-xs leading-tight transition-colors duration-300 group-hover:text-blue-600 font-medium'>{item.speciality}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SpecialityMenu
