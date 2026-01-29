import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import DoctorProfile from './pages/DoctorProfile'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import PrivacyPolicy from './pages/PrivacyPolicy'
import DataSecurity from './pages/DataSecurity'
import Careers from './pages/Careers'
import ScrollToTop from './components/ScrollToTop'
import BackToTopButton from './components/BackToTopButton'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import VerifyAppointment from './pages/VerifyAppointment'
import Emergency from './pages/Emergency'
import CollaboratedHospitals from './pages/CollaboratedHospitals'
import ForgotPassword from './pages/ForgotPassword'
import HospitalDetails from './pages/HospitalDetails'
import AllDoctorsList from './pages/AllDoctorsList'
const App = () => {
  return (
    <div className='min-h-screen flex flex-col overflow-x-hidden'>
      {/* Toast Container - at root level for proper z-index */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="colored"
        limit={1}
      />
      <AnimatedBackground />
      {/* Navbar wrapper - MUST be highest z-index for dropdown and mobile menu to work */}
      <div className='relative' style={{ zIndex: 999999999 }}>
        <Navbar />
      </div>
      <ScrollToTop />
      {/* Main content - lower z-index than navbar, with top padding for fixed navbar */}
      <main className='relative z-[1] flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/hospitals' element={<CollaboratedHospitals />} />
          <Route path='/all-doctors' element={<AllDoctorsList />} />
          <Route path='/doctor/:docId' element={<DoctorProfile />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/data-security' element={<DataSecurity />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/verify-appointment' element={<VerifyAppointment />} />
          <Route path='/emergency' element={<Emergency />} />
          <Route path='/collaborated-hospitals' element={<CollaboratedHospitals />} />
          <Route path='/careers' element={<Careers />} />
          <Route path='/hospital/:id' element={<HospitalDetails />} />
        </Routes>
      </main>
      {/* Footer */}
      <Footer />
      {/* Scroll to Top Button - Available on all pages */}
      <BackToTopButton />
    </div>
  )
}

export default App
