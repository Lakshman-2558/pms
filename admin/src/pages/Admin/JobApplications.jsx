import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const JobApplications = () => {
  const { aToken } = useContext(AdminContext)
  const { backendUrl } = useContext(AppContext)

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        `${backendUrl}/api/jobs/admin/list`,
        {
          headers: { aToken },
          params: search ? { search } : {}
        }
      )
      if (data.success) {
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching job applications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (aToken) {
      fetchApplications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchApplications()
  }

  const handleOpenResume = async (id) => {
    try {
      const url = `${backendUrl}/api/jobs/admin/${id}/resume`
      const response = await axios.get(url, {
        headers: { aToken },
        responseType: 'blob'
      })
      const contentType = response.headers['content-type'] || 'application/pdf'
      const blob = new Blob([response.data], { type: contentType })
      const blobUrl = window.URL.createObjectURL(blob)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error opening resume:', error)
      const message =
        error?.response?.data?.message ||
        (error?.response?.status === 404
          ? 'Resume file not found on server.'
          : 'Failed to open resume.')
      toast.error(message)
    }
  }

  const handleApprove = async (id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/jobs/admin/${id}/approve`, {}, {
        headers: { aToken }
      })
      if (data.success) {
        toast.success('Application approved and email sent.')
        setApplications(prev =>
          prev.map(app => app._id === id ? { ...app, status: 'approved' } : app)
        )
      } else {
        toast.error(data.message || 'Failed to approve application.')
      }
    } catch (error) {
      console.error('Error approving application:', error)
      toast.error('Failed to approve application.')
    }
  }

  const handleReject = async (id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/jobs/admin/${id}/reject`, {}, {
        headers: { aToken }
      })
      if (data.success) {
        toast.info('Application rejected.')
        setApplications(prev =>
          prev.map(app => app._id === id ? { ...app, status: 'rejected' } : app)
        )
      } else {
        toast.error(data.message || 'Failed to reject application.')
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      toast.error('Failed to reject application.')
    }
  }

  return (
    <div className='w-full bg-gradient-to-br from-gray-50 via-white to-indigo-50/40 p-4 sm:p-6 mobile-safe-area pb-8 min-h-screen'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
          <div>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3'>
              <span className='inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2 shadow-lg shadow-indigo-500/30'>
                <svg className='w-5 h-5 text-white' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className='bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                Job Applications
              </span>
            </h2>
            <p className='text-xs sm:text-sm text-gray-500 mt-1'>
              Review each applicant’s details, open resumes, and update their hiring status.
            </p>
          </div>

          <form onSubmit={handleSearch} className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
            <div className='relative w-full sm:w-64 md:w-72'>
              <span className='absolute inset-y-0 left-3 flex items-center text-gray-400'>
                <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
              </span>
              <input
                type='text'
                placeholder='Search by name, role, city, email...'
                className='border-2 border-gray-200 rounded-xl px-9 pr-3 py-2.5 text-sm w-full bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type='submit'
              className='px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg transition-all'
            >
              Search
            </button>
          </form>
        </div>

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-8 text-center text-gray-500'>
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-8 text-center text-gray-500'>
          No applications found.
        </div>
      ) : (
        <div className='space-y-4'>
          {applications.map(app => (
            <div
              key={app._id}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 flex flex-col gap-4 w-full hover:shadow-md transition-shadow'
            >
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                <div>
                  <div className='flex items-center gap-3'>
                    <h3 className='text-base md:text-lg font-semibold text-gray-900'>
                      {app.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        app.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : app.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pending'}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    Applied on{' '}
                    {app.created_at ? new Date(app.created_at).toLocaleString() : '-'}
                  </p>
                </div>

                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={() => handleOpenResume(app._id)}
                    className='inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium text-primary border-primary hover:bg-primary hover:text-white transition-colors'
                  >
                    Open Resume
                  </button>
                  {/* Show Approve only when not rejected */}
                  {app.status !== 'rejected' && (
                    <button
                      type='button'
                      onClick={() => handleApprove(app._id)}
                      disabled={app.status === 'approved'}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium ${
                        app.status === 'approved'
                          ? 'border-emerald-100 text-emerald-300 cursor-not-allowed'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors'
                      }`}
                    >
                      {app.status === 'approved' ? 'Approved' : 'Approve'}
                    </button>
                  )}
                  {/* Show Reject only when not approved */}
                  {app.status !== 'approved' && (
                    <button
                      type='button'
                      onClick={() => handleReject(app._id)}
                      disabled={app.status === 'rejected'}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium ${
                        app.status === 'rejected'
                          ? 'border-red-100 text-red-300 cursor-not-allowed'
                          : 'border-red-200 text-red-600 hover:bg-red-50 transition-colors'
                      }`}
                    >
                      {app.status === 'rejected' ? 'Rejected' : 'Reject'}
                    </button>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div className='space-y-1'>
                  <p className='text-gray-500 text-xs uppercase tracking-wide'>Contact</p>
                  <p className='text-gray-800'>{app.email}</p>
                  <p className='text-gray-800'>{app.phone}</p>
                  <p className='text-gray-600 text-xs'>City: {app.city}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-gray-500 text-xs uppercase tracking-wide'>Profile</p>
                  <p className='text-gray-800'>Role: {app.role_applied}</p>
                  <p className='text-gray-800'>Experience: {app.experience} years</p>
                  <p className='text-gray-600 text-xs'>Qualification: {app.qualification}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-gray-500 text-xs uppercase tracking-wide'>Meta</p>
                  <p className='text-gray-600 text-xs break-all'>
                    Resume path: {app.resume_file_path || 'N/A'}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 mt-2'>
                <div>
                  <p className='text-gray-500 text-xs uppercase tracking-wide mb-1'>Skills</p>
                  <p className='text-gray-800 text-sm whitespace-pre-wrap'>
                    {app.skills}
                  </p>
                </div>
                <div>
                  <p className='text-gray-500 text-xs uppercase tracking-wide mb-1'>Cover Letter</p>
                  <p className='text-gray-800 text-sm whitespace-pre-wrap'>
                    {app.coverLetter || '—'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default JobApplications


