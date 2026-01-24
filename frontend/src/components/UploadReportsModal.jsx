import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const UploadReportsModal = ({ docId, docName, appointmentId, onClose, onSuccess }) => {
    const { backendUrl, token, userData } = useContext(AppContext);
    const [formData, setFormData] = useState({
        recordType: 'lab_report',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        // Limit to 10 files
        const remainingSlots = 10 - files.length;
        const filesToAdd = selectedFiles.slice(0, remainingSlots);
        setFiles([...files, ...filesToAdd]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (files.length === 0) {
            toast.error('Please select at least one file');
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Please enter a title for the report');
            return;
        }

        setIsUploading(true);

        try {
            const formDataToSend = new FormData();

            // Ensure backend receives the authenticated user ID for validation
            if (userData?._id) {
                formDataToSend.append('userId', userData._id);
            }
            formDataToSend.append('recordType', formData.recordType);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('docId', docId);
            formDataToSend.append('doctorName', docName);
            formDataToSend.append('date', formData.date);
            if (appointmentId) {
                formDataToSend.append('appointmentId', appointmentId);
            }

            files.forEach(file => {
                formDataToSend.append('files', file);
            });

            const { data } = await axios.post(
                `${backendUrl}/api/user/health-records`,
                formDataToSend,
                {
                    headers: { token },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        // You can show progress here if needed
                    }
                }
            );

            if (data.success) {
                toast.success('Reports uploaded successfully! Doctor will be able to view them during consultation.');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(data.message || 'Failed to upload reports');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to upload reports');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-modal">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Upload Reports</h2>
                            <p className="text-sm text-gray-600 mt-1">Upload your medical reports for Dr. {docName}</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-gray-500 hover:text-gray-700"
                            disabled={isUploading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Record Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Report Type *</label>
                            <select
                                value={formData.recordType}
                                onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                required
                                disabled={isUploading}
                            >
                                <option value="lab_report">🧪 Lab Report</option>
                                <option value="xray">📷 X-Ray</option>
                                <option value="scan">🔬 Scan (CT/MRI/Ultrasound)</option>
                                <option value="medical_note">📝 Medical Note</option>
                                <option value="other">📄 Other Document</option>
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="e.g., Blood Test Report, Chest X-Ray"
                                required
                                disabled={isUploading}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                rows="3"
                                placeholder="Any additional notes about these reports..."
                                disabled={isUploading}
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Report Date *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                required
                                disabled={isUploading}
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Upload Files *</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-cyan-400 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    disabled={isUploading || files.length >= 10}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`cursor-pointer flex flex-col items-center ${isUploading || files.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</span>
                                    <span className="text-xs text-gray-400 mt-1">PDF, Images, Documents (Max 10MB each, up to 10 files)</span>
                                    {files.length > 0 && (
                                        <span className="text-xs text-cyan-600 mt-1">{files.length} file(s) selected</span>
                                    )}
                                </label>
                            </div>
                            
                            {/* File List */}
                            {files.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                                <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="text-red-600 hover:text-red-800 ml-2"
                                                disabled={isUploading}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info Message */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> These reports will be visible to Dr. {docName} during your consultation. 
                                You can upload reports before or after booking your appointment.
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 btn btn-secondary"
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 btn btn-primary"
                                disabled={isUploading || files.length === 0}
                            >
                                {isUploading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload Reports
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadReportsModal;

