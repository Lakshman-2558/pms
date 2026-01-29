import React, { useState } from 'react'
import {
    CardiologyIcon,
    DentistryIcon,
    NeurologyIcon,
    PediatricsIcon,
    OrthopedicsIcon,
    OphthalmologyIcon,
    GastroenterologyIcon,
    GynecologyIcon,
    DermatologyIcon,
    ENTIcon,
    PsychiatryIcon,
    GeneralMedicineIcon
} from './ProfessionalIcons'

const IconCard = ({ Icon, title, description, color }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className='bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ borderTop: `3px solid ${color}` }}
        >
            <div className='flex justify-center mb-3'>
                <Icon isHovered={isHovered} />
            </div>
            <h3 className='text-center font-semibold text-gray-800 mb-1'>{title}</h3>
            <p className='text-center text-xs text-gray-500'>{description}</p>
        </div>
    )
}

const IconShowcase = () => {
    const icons = [
        {
            Icon: CardiologyIcon,
            title: 'Cardiology',
            description: 'Heart beats on hover',
            color: '#ef4444'
        },
        {
            Icon: DentistryIcon,
            title: 'Dentistry',
            description: 'Tooth glows on hover',
            color: '#3b82f6'
        },
        {
            Icon: NeurologyIcon,
            title: 'Neurology',
            description: 'Neural nodes light up',
            color: '#8b5cf6'
        },
        {
            Icon: PediatricsIcon,
            title: 'Pediatrics',
            description: 'Child smiles wider',
            color: '#ec4899'
        },
        {
            Icon: OrthopedicsIcon,
            title: 'Orthopedics',
            description: 'Bones scale up',
            color: '#10b981'
        },
        {
            Icon: OphthalmologyIcon,
            title: 'Ophthalmology',
            description: 'Eye opens fully',
            color: '#3b82f6'
        },
        {
            Icon: GastroenterologyIcon,
            title: 'Gastroenterology',
            description: 'Stomach expands',
            color: '#f97316'
        },
        {
            Icon: GynecologyIcon,
            title: 'Gynecology',
            description: 'Symbol enlarges',
            color: '#ec4899'
        },
        {
            Icon: DermatologyIcon,
            title: 'Dermatology',
            description: 'Skin sparkles',
            color: '#fbbf24'
        },
        {
            Icon: ENTIcon,
            title: 'ENT',
            description: 'Sound waves appear',
            color: '#06b6d4'
        },
        {
            Icon: PsychiatryIcon,
            title: 'Psychiatry',
            description: 'Thoughts float up',
            color: '#a855f7'
        },
        {
            Icon: GeneralMedicineIcon,
            title: 'General Medicine',
            description: 'Cross pulses',
            color: '#3b82f6'
        }
    ]

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8'>
            <div className='max-w-7xl mx-auto'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
                        Professional Medical Icons
                    </h1>
                    <p className='text-gray-600 mb-2'>Hover over each icon to see the interactive animation!</p>
                    <p className='text-sm text-gray-500'>Smaller, professional design with specialty-specific colors</p>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12'>
                    {icons.map((icon, index) => (
                        <IconCard key={index} {...icon} />
                    ))}
                </div>

                <div className='bg-white rounded-2xl p-8 shadow-lg'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-800'>✨ Interactive Features:</h2>
                    <div className='grid md:grid-cols-2 gap-4'>
                        <div className='space-y-3'>
                            <div className='flex items-start gap-3'>
                                <span className='text-green-500 text-xl'>❤️</span>
                                <div>
                                    <p className='font-semibold text-gray-800'>Cardiology</p>
                                    <p className='text-sm text-gray-600'>Heart beats and scales up</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='text-blue-500 text-xl'>👁️</span>
                                <div>
                                    <p className='font-semibold text-gray-800'>Ophthalmology</p>
                                    <p className='text-sm text-gray-600'>Eye opens fully, eyelid lifts</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='text-pink-500 text-xl'>👶</span>
                                <div>
                                    <p className='font-semibold text-gray-800'>Pediatrics</p>
                                    <p className='text-sm text-gray-600'>Child's smile gets bigger</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='text-purple-500 text-xl'>🧠</span>
                                <div>
                                    <p className='font-semibold text-gray-800'>Neurology</p>
                                    <p className='text-sm text-gray-600'>Neural nodes light up sequentially</p>
                                </div>
                            </div>
                        </div>
                        <div className='space-y-3'>
                            <div className='flex items-start gap-3'>
                                <span className='text-cyan-500 text-xl'>👂</span>
                                <div>
                                    <p className='font-semibold text-gray-800'>ENT</p>
                                    <p className='text-sm text-gray-600'>Sound waves animate</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='text-yellow-500 text-xl'>✨</span>
                                <div>
                                    <p className='font-semibold text-gray-800'>Dermatology</p>
                                    <p className='text-sm text-gray-600'>Skin sparkles appear</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='text-green-500 text-xl'>🦴</span>
                                <div>
                                    <p className='font-semibold text-gray-800'>Orthopedics</p>
                                    <p className='text-sm text-gray-600'>Bone structure scales up</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='text-blue-500 text-xl'>🦷</span>
                                <div>
                                    <p className='font-semibold text-gray-800'>Dentistry</p>
                                    <p className='text-sm text-gray-600'>Tooth glows with blue aura</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IconShowcase
