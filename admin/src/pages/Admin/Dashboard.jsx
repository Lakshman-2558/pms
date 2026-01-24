import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { useSocket } from '../../context/SocketContext'
import { toast } from 'react-toastify'
import GlassCard from '../../components/ui/GlassCard'
import AnimatedCounter from '../../components/ui/AnimatedCounter'
import StatusIndicator from '../../components/ui/StatusIndicator'
import LineChart from '../../components/charts/LineChart'
import BarChart from '../../components/charts/BarChart'
import AreaChart from '../../components/charts/AreaChart'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData, getAllDoctors, doctors, getAllAppointments, hospitals, getAllHospitals } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)
  const { socket, isConnected, liveData } = useSocket()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [chartData, setChartData] = useState({
    patientGrowth: { labels: [], values: [] },
    revenue: { labels: [], values: [] },
    appointments: { labels: [], values: [] }
  })

  useEffect(() => {
    if (aToken) {
      getDashData()
      getAllDoctors()
      getAllHospitals()
      
      // Auto-refresh dashboard every 30 seconds to get latest counts
      const refreshInterval = setInterval(() => {
        getDashData()
      }, 30000) // Refresh every 30 seconds
      
      return () => clearInterval(refreshInterval)
    }
  }, [aToken])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Initialize chart data from actual dashboard data (no random values)
  useEffect(() => {
    if (dashData && dashData.chartData) {
      // Use actual chart data from backend (starts at 0, updates live)
      setChartData({
        patientGrowth: dashData.chartData.patientGrowth || { labels: [], values: [] },
        revenue: dashData.chartData.revenue || { labels: [], values: [] },
        appointments: dashData.chartData.appointments || { labels: [], values: [] }
      })
    } else {
      // Initialize with zeros if no data yet
      const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date()
        hour.setHours(hour.getHours() - (23 - i))
        return hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      })
      
      setChartData({
        patientGrowth: { labels: hours, values: new Array(24).fill(0) },
        revenue: { labels: hours, values: new Array(24).fill(0) },
        appointments: { labels: hours, values: new Array(24).fill(0) }
      })
    }
  }, [dashData])

  // Listen for real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('new-appointment', (data) => {
        toast.success(`🟢 New Appointment: ${data.patientName} at ${data.slotTime}`, {
          position: 'top-right',
          autoClose: 3000
        })
        // Refresh dashboard to update counts, revenue, and charts
        getDashData()
        if (getAllAppointments) getAllAppointments()
      })

      socket.on('appointments-deleted', (data) => {
        console.log('📋 Appointments deleted:', data)
        getDashData()
        if (getAllAppointments) getAllAppointments()
      })

      socket.on('patient-count-updated', (count) => {
        console.log('👥 Patient count updated:', count)
      })

      socket.on('revenue-updated', (data) => {
        console.log('💰 Revenue updated:', data)
      })

      return () => {
        socket.off('new-appointment')
        socket.off('appointments-deleted')
        socket.off('patient-count-updated')
        socket.off('revenue-updated')
      }
    }
  }, [socket, isConnected])


  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate stats from actual dashboard data - only show if appointments exist
  // Default to 0 if no appointments have been made
  const totalPatientsToday = (dashData?.patientsToday && dashData?.patientsToday > 0) ? dashData.patientsToday : 0
  const totalAppointmentsToday = (dashData?.appointmentsToday && dashData?.appointmentsToday > 0) ? dashData.appointmentsToday : 0
  const totalDoctors = dashData?.doctors || doctors?.length || 0
  const activeDoctorsOnline = dashData?.activeDoctors || doctors?.filter(doc => doc.available).length || 0
  const totalHospitals = hospitals?.length || 0
  const todayRevenue = (dashData?.revenueToday && dashData?.revenueToday > 0) ? dashData.revenueToday : 0 // Revenue from today's appointments

  if (!dashData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 sm:p-4 mobile-safe-area pb-6 min-h-screen'>
      <div className='space-y-3 sm:space-y-4 animate-fade-in-up'>
      {/* Live Clock Widget */}
      <GlassCard className="p-3 sm:p-4">
        <div className='flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2 shadow-lg'>
              <svg className='w-5 h-5 sm:w-6 sm:h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className='text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 tracking-wider'>{formatTime(currentTime)}</h2>
              <p className='text-gray-500 text-[10px] sm:text-xs mt-0.5 flex items-center gap-1.5 flex-wrap'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
                <span className='whitespace-nowrap'>Live</span>
                <span className='hidden sm:inline'>•</span>
                <span className='text-[9px] sm:text-[10px]'>{formatDate(currentTime)}</span>
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Top Widgets - Animated Counters */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3'>
        {/* Patients Today */}
        <GlassCard
          hover={false}
          className="p-4 cursor-pointer hover-lift"
          onClick={() => navigate('/all-appointments')}
        >
          <div className='flex items-center gap-2.5 sm:gap-3'>
            <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 shadow-lg flex-shrink-0'>
              <svg className='w-5 h-5 sm:w-6 sm:h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>
                <AnimatedCounter value={totalPatientsToday} />
              </p>
              <p className='text-gray-500 text-[10px] sm:text-xs mt-0.5'>Total Patients Today</p>
            </div>
          </div>
        </GlassCard>

        {/* Appointments Today */}
        <GlassCard
          hover={false}
          className="p-4 cursor-pointer hover-lift"
          onClick={() => navigate('/all-appointments')}
        >
          <div className='flex items-center gap-2.5 sm:gap-3'>
            <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 shadow-lg flex-shrink-0'>
              <svg className='w-5 h-5 sm:w-6 sm:h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>
                <AnimatedCounter value={totalAppointmentsToday} />
              </p>
              <p className='text-gray-500 text-[10px] sm:text-xs mt-0.5'>Appointments Today</p>
            </div>
          </div>
        </GlassCard>

        {/* Active Doctors */}
        <GlassCard
          hover={false}
          className="p-4 cursor-pointer hover-lift"
          onClick={() => navigate('/doctor-list?filter=available')}
        >
          <div className='flex items-center gap-2.5 sm:gap-3'>
            <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 shadow-lg flex-shrink-0'>
              <svg className='w-5 h-5 sm:w-6 sm:h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>
                <AnimatedCounter value={activeDoctorsOnline} /> / {totalDoctors}
              </p>
              <p className='text-gray-500 text-[10px] sm:text-xs mt-0.5'>Active Doctors</p>
            </div>
          </div>
        </GlassCard>

        {/* Tie-Up Hospitals */}
        <GlassCard
          hover={false}
          className="p-4 cursor-pointer hover-lift"
          onClick={() => navigate('/hospital-tieups')}
        >
          <div className='flex items-center gap-2.5 sm:gap-3'>
            <div className='bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-2 shadow-lg flex-shrink-0'>
              <svg className='w-5 h-5 sm:w-6 sm:h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>
                <AnimatedCounter value={totalHospitals} />
              </p>
              <p className='text-gray-500 text-[10px] sm:text-xs mt-0.5'>Tie-Up Hospitals</p>
            </div>
          </div>
        </GlassCard>

        {/* Today's Revenue */}
        <GlassCard
          hover={false}
          className="p-4 cursor-pointer hover-lift"
          onClick={() => navigate('/all-appointments')}
        >
          <div className='flex items-center gap-2.5 sm:gap-3'>
            <div className='bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-2 shadow-lg flex-shrink-0'>
              <svg className='w-5 h-5 sm:w-6 sm:h-6 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xl sm:text-2xl font-bold text-gray-800'>
                <AnimatedCounter value={todayRevenue} prefix="₹" />
              </p>
              <p className='text-gray-500 text-[10px] sm:text-xs mt-0.5'>Today's Revenue</p>
              {dashData?.revenueMonthly && dashData.revenueMonthly > 0 && (
                <p className='text-[9px] sm:text-[10px] text-gray-400 mt-0.5'>
                  Monthly: ₹{dashData.revenueMonthly.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Live Graphs Section - Equal Cards (Same Design Desktop & Mobile) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'>
        <GlassCard className="p-3 sm:p-4 flex flex-col lg:h-full w-full min-h-[260px]">
          <h3 className='text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5'>
            <svg className='w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0' fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className='text-sm sm:text-base lg:text-xl'>Patient Growth (24 Hours)</span>
          </h3>
          <div className="chart-container overflow-x-auto flex-1 min-h-0 w-full">
            <LineChart data={chartData.patientGrowth} title="Patients" color="#667eea" />
          </div>
        </GlassCard>

        <GlassCard className="p-3 sm:p-4 flex flex-col lg:h-full w-full min-h-[260px]">
          <h3 className='text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5'>
            <svg className='w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0' fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Revenue Progress
          </h3>
          <div className="chart-container flex-1 min-h-0 w-full">
            <BarChart data={chartData.revenue} title="Revenue" color="#764ba2" />
          </div>
        </GlassCard>
      </div>

      {/* Appointments Peak Hours - Full Width */}
      <GlassCard className="p-3 sm:p-4 mt-3 sm:mt-4 min-h-[260px]">
        <h3 className='text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5'>
          <svg className='w-5 h-5 sm:w-6 sm:h-6 text-pink-600 flex-shrink-0' fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Appointments Peak Hours
        </h3>
        <div className="chart-container">
          <AreaChart data={chartData.appointments} title="Appointments" color="#f093fb" />
        </div>
      </GlassCard>

      {/* Latest Appointments */}
      <GlassCard className="p-3 sm:p-4">
        <div className='flex items-center justify-between mb-3 sm:mb-4'>
          <h3 className='text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1.5'>
            <img src={assets.list_icon} alt="" className='w-6 h-6' />
            Latest Appointments
          </h3>
          <StatusIndicator status={isConnected ? 'online' : 'offline'} />
        </div>

        <div 
          className='space-y-2 pr-1 max-h-80 overflow-y-auto'
        >
          {dashData.latestAppointments?.length ? dashData.latestAppointments.slice(0, 10).map((item, index) => (
            <div
              key={index}
              className='flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-150 group'
            >
              <img
                className='w-10 h-10 rounded-full ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all'
                src={item.docData?.image || 'https://ui-avatars.com/api/?name=Doctor&background=667eea&color=fff'}
                alt=""
              />
              <div className='flex-1 min-w-0'>
                <p className='text-gray-800 font-semibold text-sm truncate'>{item.docData?.name || 'Unknown Doctor'}</p>
                <p className='text-gray-600 text-xs'>
                  {item.actualPatient && !item.actualPatient.isSelf 
                    ? `${item.actualPatient.name} (${item.actualPatient.relationship})` 
                    : item.userData?.name || 'Patient'} • {slotDateFormat(item.slotDate)} at {item.slotTime}
                </p>
                {item.actualPatient && !item.actualPatient.isSelf && (
                  <p className='text-[10px] text-cyan-600 mt-0.5'>
                    Booked by: {item.userData?.name || 'User'}
                  </p>
                )}
                <p className='text-[10px] text-gray-500 mt-0.5'>{item.docData?.speciality || 'General'}</p>
              </div>
              <div className='flex items-center gap-2'>
                {item.cancelled ? (
                  <span className='px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-medium'>Cancelled</span>
                ) : item.isCompleted ? (
                  <span className='px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-[10px] font-medium'>Completed</span>
                ) : (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className='p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-300'
                    title="Cancel Appointment"
                  >
                    <img className='w-4 h-4' src={assets.cancel_icon} alt="Cancel" />
                  </button>
                )}
              </div>
            </div>
          )) : (
            <p className='text-xs text-gray-500 text-center py-4'>No recent appointments.</p>
          )}
        </div>
      </GlassCard>
      </div>
    </div>
  )
}

export default Dashboard
