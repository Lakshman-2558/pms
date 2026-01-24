import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import BackArrow from '../components/BackArrow'
import LoadingSpinner, { ButtonSpinner } from '../components/LoadingSpinner'

const MyProfile = () => {

    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const { token, backendUrl, userData, setUserData, loadUserProfileData, setToken, isProfileLoading } = useContext(AppContext)
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        setToken(false)
        toast.success('Logged out successfully!')
        navigate('/login')
    }

    // Function to update user profile data using API
    const updateUserProfileData = async () => {
        setIsUpdating(true)
        try {
            const formData = new FormData();
            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)
            formData.append('age', userData.age || '')
            formData.append('bloodGroup', userData.bloodGroup || '')
            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile'
            toast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    if (isProfileLoading) {
        return <LoadingSpinner fullScreen text="Loading profile..." />
    }

    if (!userData) {
        return (
            <div className="page-container">
                <BackButton to="/" label="Back to Home" />
                <div className="empty-state card mt-6">
                    <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="empty-state-title">Profile Not Found</h3>
                    <p className="empty-state-text">Please log in to view your profile.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary mt-4">
                        Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='page-container fade-in'>
            {/* Back Arrow Button */}
            <div className='mb-6 flex items-center gap-4'>
                <BackArrow />
                <BackButton to="/" label="Back to Home" />
            </div>

            <div className='max-w-4xl mx-auto'>
                {/* Profile Card Container */}
                <div className='card card-overflow-hidden'>
                    {/* Profile Header with Gradient - Low z-index to stay behind navbar dropdown */}
                    <div className='profile-banner bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 px-6 py-10 sm:px-8 sm:py-12 relative z-[1]'>
                        <div className='absolute inset-0 bg-black/10'></div>
                        
                        {/* Profile Picture Section */}
                        <div className='relative z-[2] flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6'>
                            {isEdit ? (
                                <label htmlFor='image' className='cursor-pointer group relative'>
                                    <div className='relative'>
                                        <img 
                                            className='w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-2xl object-cover group-hover:opacity-90 transition-opacity' 
                                            src={image ? URL.createObjectURL(image) : userData.image} 
                                            alt="Profile" 
                                        />
                                        <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" accept="image/*" hidden />
                                </label>
                            ) : (
                                <div className='relative'>
                                    <img 
                                        className='w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-2xl object-cover' 
                                        src={userData.image} 
                                        alt="Profile" 
                                    />
                                    {/* Online Status Indicator */}
                                    <div className='absolute bottom-1 right-1 bg-green-500 border-3 border-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg'>
                                        <div className='w-3 h-3 bg-green-300 rounded-full animate-pulse'></div>
                                    </div>
                                </div>
                            )}

                            <div className='flex-1 text-white text-center sm:text-left pb-2'>
                                {isEdit ? (
                                    <input 
                                        className='bg-white/20 backdrop-blur-sm text-2xl sm:text-3xl font-bold text-white placeholder-white/70 border-2 border-white/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-white/60 focus:bg-white/30 transition-all' 
                                        type="text" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                                        value={userData.name}
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <h1 className='text-2xl sm:text-3xl font-bold mb-1'>{userData.name}</h1>
                                )}
                                <p className='text-blue-100'>Patient Account</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className='p-6 sm:p-8 space-y-6'>
                        {/* Contact Information Card */}
                        <div className='bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 sm:p-6 border border-cyan-100'>
                            <div className='flex items-center gap-3 mb-5'>
                                <div className='bg-cyan-500 p-2 rounded-lg'>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className='text-lg font-bold text-gray-800'>Contact Information</h2>
                            </div>

                            <div className='space-y-4'>
                                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                    <span className='text-sm text-gray-500 sm:w-24'>Email</span>
                                    <span className='text-cyan-600 font-medium'>{userData.email}</span>
                                </div>

                                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                    <span className='text-sm text-gray-500 sm:w-24'>Phone</span>
                                    {isEdit ? (
                                        <input 
                                            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all' 
                                            type="tel" 
                                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                            value={userData.phone}
                                        />
                                    ) : (
                                        <span className='text-gray-700 font-medium'>{userData.phone || 'Not provided'}</span>
                                    )}
                                </div>

                                <div className='flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4'>
                                    <span className='text-sm text-gray-500 sm:w-24 sm:pt-2'>Address</span>
                                    {isEdit ? (
                                        <div className='flex-1 space-y-2'>
                                            <input 
                                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all' 
                                                type="text" 
                                                placeholder="Street Address"
                                                onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                                                value={userData.address.line1} 
                                            />
                                            <input 
                                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all' 
                                                type="text" 
                                                placeholder="City, State, ZIP"
                                                onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                                                value={userData.address.line2} 
                                            />
                                        </div>
                                    ) : (
                                        <span className='text-gray-700 font-medium'>
                                            {userData.address.line1 || userData.address.line2 
                                                ? `${userData.address.line1} ${userData.address.line2}`.trim() 
                                                : 'No address provided'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Basic Information Card */}
                        <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 sm:p-6 border border-purple-100'>
                            <div className='flex items-center gap-3 mb-5'>
                                <div className='bg-purple-500 p-2 rounded-lg'>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className='text-lg font-bold text-gray-800'>Basic Information</h2>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className='flex flex-col gap-2'>
                                    <span className='text-sm text-gray-500'>Gender</span>
                                    {isEdit ? (
                                        <select 
                                            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                                            value={userData.gender}
                                        >
                                            <option value="Not Selected">Not Selected</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <span className='text-gray-700 font-medium'>{userData.gender || 'Not Selected'}</span>
                                    )}
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <span className='text-sm text-gray-500'>Age</span>
                                    <span className='text-gray-700 font-medium'>
                                        {userData.age ? `${userData.age} years` : 'Not available'}
                                    </span>
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <span className='text-sm text-gray-500'>Date of Birth</span>
                                    {isEdit ? (
                                        <input 
                                            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white' 
                                            type='date' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                                            value={userData.dob}
                                        />
                                    ) : (
                                        <span className='text-gray-700 font-medium'>
                                            {userData.dob === 'Not Selected' ? 'Not Selected' : new Date(userData.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <span className='text-sm text-gray-500'>Blood Group</span>
                                    {isEdit ? (
                                        <select 
                                            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white' 
                                            onChange={(e) => setUserData(prev => ({ ...prev, bloodGroup: e.target.value }))} 
                                            value={userData.bloodGroup || ''}
                                        >
                                            <option value="">Not Selected</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    ) : (
                                        <span className='text-gray-700 font-medium flex items-center gap-2'>
                                            {userData.bloodGroup ? (
                                                <>
                                                    <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm'>
                                                        {userData.bloodGroup}
                                                    </span>
                                                    {userData.bloodGroup}
                                                </>
                                            ) : (
                                                'Not provided'
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className='bg-gray-50 rounded-xl p-5 sm:p-6 border border-gray-200'>
                            <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Quick Actions
                            </h3>
                            <div className='flex flex-col sm:flex-row gap-3'>
                                <button 
                                    onClick={() => navigate('/my-appointments')}
                                    className='flex-1 btn btn-primary'
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    My Appointments
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className='flex-1 btn btn-danger'
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t'>
                            {isEdit ? (
                                <>
                                    <button 
                                        onClick={() => { setIsEdit(false); setImage(false); loadUserProfileData(); }} 
                                        className='btn btn-secondary'
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={updateUserProfileData} 
                                        className='btn btn-primary'
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <ButtonSpinner />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsEdit(true)} 
                                    className='btn btn-primary'
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyProfile
