import { sendEmail } from './brevoMailer.js';

// Brevo email service - all emails now use Brevo API

// General contact form email
export const sendContactMessage = async ({ name, email, message }) => {
    try {
        const recipientEmail = process.env.CONTACT_EMAIL || process.env.BERVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || 'medichain123@gmail.com';
        
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .container {
                            background-color: #ffffff;
                            border-radius: 10px;
                            padding: 24px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.08);
                        }
                        .header {
                            border-bottom: 1px solid #e5e7eb;
                            padding-bottom: 12px;
                            margin-bottom: 16px;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 20px;
                            color: #111827;
                        }
                        .meta {
                            font-size: 14px;
                            color: #6b7280;
                            margin-bottom: 16px;
                        }
                        .meta div {
                            margin-bottom: 4px;
                        }
                        .message-box {
                            background-color: #f9fafb;
                            border-radius: 8px;
                            padding: 16px;
                            border: 1px solid #e5e7eb;
                            white-space: pre-wrap;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Contact Message</h1>
                        </div>
                        <div class="meta">
                            <div><strong>From:</strong> ${name || 'N/A'} (${email || 'No email provided'})</div>
                            <div><strong>Received at:</strong> ${new Date().toLocaleString()}</div>
                        </div>
                        <div class="message-box">
                            ${message ? message.replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'No message provided.'}
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            recipientEmail,
            'New Contact Message - MediChain Website',
            htmlContent,
            'MediChain Team',
            'MediChain Website'
        );

        if (result.success) {
            console.log(`✅ Contact message email sent from ${email} (name: ${name})`);
            return {
                success: true,
                message: 'Contact message sent successfully',
                messageId: result.messageId
            };
        } else {
            return result;
        }
    } catch (error) {
        console.error('❌ Error sending contact message email:', error);
        return {
            success: false,
            message: 'Failed to send contact message',
            error: error.message
        };
    }
};

// Send OTP email for password reset
export const sendPasswordResetOTP = async (email, otp, userName) => {
    try {
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 10px;
                            padding: 30px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            color: #5f6fff;
                            margin-bottom: 30px;
                        }
                        .otp-box {
                            background-color: #5f6fff;
                            color: white;
                            font-size: 32px;
                            font-weight: bold;
                            text-align: center;
                            padding: 20px;
                            border-radius: 8px;
                            letter-spacing: 8px;
                            margin: 20px 0;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset Request</h1>
                        </div>
                        
                        <p>Hi ${userName},</p>
                        
                        <p>We received a request to reset your password for your MediChain account. Use the OTP below to complete the password reset process:</p>
                        
                        <div class="otp-box">
                            ${otp}
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong>
                            <ul style="margin: 10px 0;">
                                <li>This OTP is valid for <strong>10 minutes</strong> only</li>
                                <li>Do not share this OTP with anyone</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <p>If you have any questions or concerns, please contact our support team.</p>
                        
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} MediChain. All rights reserved.</p>
                            <p>This is an automated email, please do not reply to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            email,
            'Password Reset OTP - MediChain',
            htmlContent,
            userName || 'User',
            'MediChain'
        );

        if (result.success) {
            console.log(`✅ Password reset OTP email sent successfully to ${email}`);
            return {
                success: true,
                message: 'OTP email sent successfully',
                messageId: result.messageId
            };
        } else {
            return result;
        }

    } catch (error) {
        console.error('❌ Error sending password reset OTP email:', error);
        return {
            success: false,
            message: 'Failed to send OTP email',
            error: error.message
        };
    }
};

// Send appointment confirmation email
export const sendAppointmentConfirmation = async (email, appointmentDetails) => {
    try {
        const {
            patientName,
            doctorName,
            speciality,
            date,
            time,
            fee,
            hospitalAddress,
            tokenNumber,
            googleMapsLink
        } = appointmentDetails;

        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 0;
                            background-color: #f4f4f4;
                        }
                        .email-container {
                            background-color: #ffffff;
                            margin: 20px;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #5f6fff 0%, #4f5fd9 100%);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                        }
                        .header p {
                            margin: 10px 0 0 0;
                            font-size: 16px;
                            opacity: 0.95;
                        }
                        .content {
                            padding: 30px 25px;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #333;
                            margin-bottom: 20px;
                        }
                        .success-badge {
                            background-color: #10b981;
                            color: white;
                            padding: 12px 20px;
                            border-radius: 8px;
                            text-align: center;
                            font-size: 16px;
                            font-weight: 600;
                            margin-bottom: 25px;
                        }
                        .appointment-card {
                            background-color: #f8fafc;
                            border-left: 4px solid #5f6fff;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .appointment-card h2 {
                            color: #5f6fff;
                            font-size: 20px;
                            margin: 0 0 15px 0;
                        }
                        .detail-row {
                            display: flex;
                            padding: 10px 0;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                        }
                        .detail-label {
                            font-weight: 600;
                            color: #6b7280;
                            width: 140px;
                            flex-shrink: 0;
                        }
                        .detail-value {
                            color: #1f2937;
                            font-weight: 500;
                        }
                        .token-number {
                            background: linear-gradient(135deg, #5f6fff 0%, #4f5fd9 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                            margin: 25px 0;
                        }
                        .token-number h3 {
                            margin: 0 0 10px 0;
                            font-size: 16px;
                            opacity: 0.9;
                        }
                        .token-number .number {
                            font-size: 48px;
                            font-weight: 700;
                            margin: 10px 0;
                        }
                        .info-box {
                            background-color: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            border-radius: 6px;
                            margin: 20px 0;
                        }
                        .info-box p {
                            margin: 5px 0;
                            color: #92400e;
                        }
                        .button {
                            display: inline-block;
                            background-color: #5f6fff;
                            color: white;
                            padding: 14px 28px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            text-align: center;
                            margin: 10px 0;
                            transition: background-color 0.3s;
                        }
                        .button:hover {
                            background-color: #4f5fd9;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 25px;
                            text-align: center;
                            color: #6b7280;
                            font-size: 13px;
                        }
                        .footer p {
                            margin: 5px 0;
                        }
                        .divider {
                            height: 1px;
                            background-color: #e5e7eb;
                            margin: 25px 0;
                        }
                        @media only screen and (max-width: 600px) {
                            .email-container {
                                margin: 10px;
                            }
                            .content {
                                padding: 20px 15px;
                            }
                            .detail-row {
                                flex-direction: column;
                            }
                            .detail-label {
                                width: 100%;
                                margin-bottom: 5px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <!-- Header -->
                        <div class="header">
                            <h1>🏥 MediChain Hospital</h1>
                            <p>Your Health, Our Priority</p>
                        </div>

                        <!-- Content -->
                        <div class="content">
                            <p class="greeting">Dear ${patientName},</p>

                            <div class="success-badge">
                                ✓ Your Appointment Has Been Confirmed!
                            </div>

                            <p>We're pleased to confirm your appointment at MediChain Hospital. Please find your appointment details below:</p>

                            <!-- Appointment Details Card -->
                            <div class="appointment-card">
                                <h2>📋 Appointment Details</h2>
                                
                                <div class="detail-row">
                                    <div class="detail-label">👨‍⚕️ Doctor:</div>
                                    <div class="detail-value">${doctorName}</div>
                                </div>

                                <div class="detail-row">
                                    <div class="detail-label">🏥 Specialty:</div>
                                    <div class="detail-value">${speciality}</div>
                                </div>

                                <div class="detail-row">
                                    <div class="detail-label">📅 Date:</div>
                                    <div class="detail-value">${date}</div>
                                </div>

                                <div class="detail-row">
                                    <div class="detail-label">🕐 Time:</div>
                                    <div class="detail-value">${time}</div>
                                </div>

                                <div class="detail-row">
                                    <div class="detail-label">💰 Consultation Fee:</div>
                                    <div class="detail-value">₹${fee}</div>
                                </div>

                                <div class="detail-row">
                                    <div class="detail-label">📍 Location:</div>
                                    <div class="detail-value">${hospitalAddress || 'MediChain Hospital'}</div>
                                </div>
                            </div>

                            ${tokenNumber ? `
                            <!-- Token Number -->
                            <div class="token-number">
                                <h3>Your Token Number</h3>
                                <div class="number">#${tokenNumber}</div>
                                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Please show this at the reception</p>
                            </div>
                            ` : ''}

                            <!-- Important Information -->
                            <div class="info-box">
                                <p><strong>⚠️ Important Information:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Please arrive 15 minutes before your appointment time</li>
                                    <li>Bring any relevant medical records or reports</li>
                                    <li>Carry a valid ID proof</li>
                                    ${tokenNumber ? `<li>Your token number is <strong>#${tokenNumber}</strong></li>` : ''}
                                </ul>
                            </div>

                            ${googleMapsLink ? `
                            <!-- Get Directions Button -->
                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${googleMapsLink}" class="button">
                                    📍 Get Directions to Hospital
                                </a>
                            </div>
                            ` : ''}

                            <div class="divider"></div>

                            <p style="font-size: 14px; color: #6b7280;">
                                <strong>Need to reschedule or cancel?</strong><br>
                                Please contact us at ${process.env.EMAIL_USER} or call our helpline.
                            </p>

                            <p style="margin-top: 25px;">
                                We look forward to seeing you!<br>
                                <strong>Team MediChain</strong>
                            </p>
                        </div>

                        <!-- Footer -->
                        <div class="footer">
                            <p><strong>MediChain Hospital</strong></p>
                            <p>Quality Healthcare for Everyone</p>
                            <p style="margin-top: 15px;">© ${new Date().getFullYear()} MediChain. All rights reserved.</p>
                            <p>This is an automated email, please do not reply to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            email,
            'Appointment Confirmed - MediChain Hospital',
            htmlContent,
            patientName || 'Patient',
            'MediChain'
        );

        if (result.success) {
            console.log(`✅ Appointment confirmation email sent to ${email}`);
            return {
                success: true,
                message: 'Appointment confirmation email sent successfully',
                messageId: result.messageId
            };
        } else {
            return result;
        }

    } catch (error) {
        console.error('❌ Error sending appointment confirmation email:', error);
        return {
            success: false,
            message: 'Failed to send appointment confirmation email',
            error: error.message
        };
    }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, userName) => {
    try {
        const senderEmail = process.env.BERVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || 'medichain123@gmail.com';
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 10px;
                            padding: 30px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            color: #28a745;
                            margin-bottom: 30px;
                        }
                        .success-icon {
                            font-size: 64px;
                            text-align: center;
                            margin: 20px 0;
                        }
                        .info-box {
                            background-color: #d1ecf1;
                            border-left: 4px solid #0c5460;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Password Reset Successful</h1>
                        </div>
                        
                        <div class="success-icon">🎉</div>
                        
                        <p>Hi ${userName},</p>
                        
                        <p>Your password has been successfully reset. You can now log in to your MediChain account with your new password.</p>
                        
                        <div class="info-box">
                            <strong>ℹ️ Security Tips:</strong>
                            <ul style="margin: 10px 0;">
                                <li>Never share your password with anyone</li>
                                <li>Use a strong, unique password</li>
                                <li>Change your password regularly</li>
                            </ul>
                        </div>
                        
                            <p><strong>Didn't make this change?</strong></p>
                        <p>If you didn't reset your password, please contact our support team immediately at ${senderEmail}</p>
                        
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} MediChain. All rights reserved.</p>
                            <p>This is an automated email, please do not reply to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            email,
            'Password Reset Successful - MediChain',
            htmlContent,
            userName || 'User',
            'MediChain'
        );

        if (result.success) {
            console.log(`✅ Password reset confirmation email sent to ${email}`);
            return {
                success: true,
                message: 'Confirmation email sent successfully'
            };
        } else {
            return result;
        }

    } catch (error) {
        console.error('❌ Error sending confirmation email:', error);
        return {
            success: false,
            message: 'Failed to send confirmation email',
            error: error.message
        };
    }
};

// Send appointment cancellation email
export const sendAppointmentCancellationEmail = async (email, appointmentDetails) => {
    try {
        const {
            patientName,
            doctorName,
            speciality,
            date,
            time,
            cancelledBy
        } = appointmentDetails;

        const senderEmail = process.env.BERVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || 'medichain123@gmail.com';
        const frontendUrl = process.env.FRONTEND_URL || 'https://medichain.com';
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 0;
                            background-color: #f4f4f4;
                        }
                        .email-container {
                            background-color: #ffffff;
                            margin: 20px;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                        }
                        .content {
                            padding: 30px 25px;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #333;
                            margin-bottom: 20px;
                        }
                        .cancellation-badge {
                            background-color: #fef2f2;
                            border-left: 4px solid #ef4444;
                            color: #991b1b;
                            padding: 15px;
                            border-radius: 8px;
                            text-align: center;
                            font-size: 16px;
                            font-weight: 600;
                            margin-bottom: 25px;
                        }
                        .appointment-card {
                            background-color: #f8fafc;
                            border-left: 4px solid #ef4444;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .appointment-card h2 {
                            color: #ef4444;
                            font-size: 20px;
                            margin: 0 0 15px 0;
                        }
                        .detail-row {
                            display: flex;
                            padding: 10px 0;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                        }
                        .detail-label {
                            font-weight: 600;
                            color: #6b7280;
                            width: 140px;
                            flex-shrink: 0;
                        }
                        .detail-value {
                            color: #1f2937;
                            font-weight: 500;
                        }
                        .info-box {
                            background-color: #dbeafe;
                            border-left: 4px solid #3b82f6;
                            padding: 15px;
                            border-radius: 6px;
                            margin: 20px 0;
                        }
                        .info-box p {
                            margin: 8px 0;
                            color: #1e40af;
                        }
                        .button {
                            display: inline-block;
                            background-color: #3b82f6;
                            color: white;
                            padding: 14px 28px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            text-align: center;
                            margin: 10px 0;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 25px;
                            text-align: center;
                            color: #6b7280;
                            font-size: 13px;
                        }
                        @media only screen and (max-width: 600px) {
                            .detail-row {
                                flex-direction: column;
                            }
                            .detail-label {
                                width: 100%;
                                margin-bottom: 5px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>🏥 MediChain Hospital</h1>
                        </div>

                        <div class="content">
                            <p class="greeting">Dear ${patientName},</p>

                            <div class="cancellation-badge">
                                ⚠️ Your Appointment Has Been Cancelled
                            </div>

                            <p>We regret to inform you that your appointment has been cancelled. Here are the details of the cancelled appointment:</p>

                            <div class="appointment-card">
                                <h2>📋 Cancelled Appointment Details</h2>
                                
                                <div class="detail-row">
                                    <div class="detail-label">👨‍⚕️ Doctor:</div>
                                    <div class="detail-value">${doctorName}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">🏥 Speciality:</div>
                                    <div class="detail-value">${speciality}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">📅 Date:</div>
                                    <div class="detail-value">${date}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">🕐 Time:</div>
                                    <div class="detail-value">${time}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">❌ Cancelled By:</div>
                                    <div class="detail-value">${cancelledBy || 'Hospital Administration'}</div>
                                </div>
                            </div>

                            <div class="info-box">
                                <p><strong>📞 Need to Reschedule?</strong></p>
                                <p>We apologize for any inconvenience. You can book a new appointment anytime through our website or by calling our helpline.</p>
                                <p>If you have any questions, please don't hesitate to contact us.</p>
                            </div>

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${frontendUrl}/doctors" class="button">
                                    📅 Book New Appointment
                                </a>
                            </div>

                            <p>We look forward to serving you in the future.</p>
                            <p style="margin-top: 20px;">Best regards,<br><strong>MediChain Hospital Team</strong></p>
                        </div>

                        <div class="footer">
                            <p>📞 For assistance, contact us at ${senderEmail}</p>
                            <p style="margin-top: 10px;">© ${new Date().getFullYear()} MediChain Hospital. All rights reserved.</p>
                            <p>This is an automated email, please do not reply to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            email,
            'Appointment Cancelled - MediChain Hospital',
            htmlContent,
            patientName || 'Patient',
            'MediChain'
        );

        if (result.success) {
            console.log(`✅ Appointment cancellation email sent to ${email}`);
            return {
                success: true,
                message: 'Appointment cancellation email sent successfully',
                messageId: result.messageId
            };
        } else {
            return result;
        }

    } catch (error) {
        console.error('❌ Error sending appointment cancellation email:', error);
        return {
            success: false,
            message: 'Failed to send appointment cancellation email',
            error: error.message
        };
    }
};

// Send appointment completion thank you email
export const sendAppointmentCompletionEmail = async (email, appointmentDetails) => {
    try {
        const {
            patientName,
            doctorName,
            speciality,
            date,
            time
        } = appointmentDetails;

        const senderEmail = process.env.BERVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || 'medichain123@gmail.com';
        const frontendUrl = process.env.FRONTEND_URL || 'https://medichain.com';
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 0;
                            background-color: #f4f4f4;
                        }
                        .email-container {
                            background-color: #ffffff;
                            margin: 20px;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                        }
                        .header p {
                            margin: 10px 0 0 0;
                            font-size: 16px;
                            opacity: 0.95;
                        }
                        .content {
                            padding: 30px 25px;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #333;
                            margin-bottom: 20px;
                        }
                        .success-badge {
                            background-color: #d1fae5;
                            border-left: 4px solid #10b981;
                            color: #065f46;
                            padding: 15px;
                            border-radius: 8px;
                            text-align: center;
                            font-size: 16px;
                            font-weight: 600;
                            margin-bottom: 25px;
                        }
                        .appointment-card {
                            background-color: #f8fafc;
                            border-left: 4px solid #10b981;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .appointment-card h2 {
                            color: #10b981;
                            font-size: 20px;
                            margin: 0 0 15px 0;
                        }
                        .detail-row {
                            display: flex;
                            padding: 10px 0;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                        }
                        .detail-label {
                            font-weight: 600;
                            color: #6b7280;
                            width: 140px;
                            flex-shrink: 0;
                        }
                        .detail-value {
                            color: #1f2937;
                            font-weight: 500;
                        }
                        .info-box {
                            background-color: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            border-radius: 6px;
                            margin: 20px 0;
                        }
                        .info-box p {
                            margin: 8px 0;
                            color: #92400e;
                        }
                        .care-tips {
                            background-color: #dbeafe;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .care-tips h3 {
                            color: #1e40af;
                            margin-top: 0;
                        }
                        .care-tips ul {
                            margin: 10px 0;
                            padding-left: 20px;
                        }
                        .care-tips li {
                            color: #1e40af;
                            margin: 8px 0;
                        }
                        .button {
                            display: inline-block;
                            background-color: #10b981;
                            color: white;
                            padding: 14px 28px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            text-align: center;
                            margin: 10px 5px;
                        }
                        .button-secondary {
                            background-color: #3b82f6;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 25px;
                            text-align: center;
                            color: #6b7280;
                            font-size: 13px;
                        }
                        @media only screen and (max-width: 600px) {
                            .detail-row {
                                flex-direction: column;
                            }
                            .detail-label {
                                width: 100%;
                                margin-bottom: 5px;
                            }
                            .button {
                                display: block;
                                margin: 10px 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>🏥 Thank You for Visiting!</h1>
                            <p>MediChain Hospital - Your Health, Our Priority</p>
                        </div>

                        <div class="content">
                            <p class="greeting">Dear ${patientName},</p>

                            <div class="success-badge">
                                ✨ Your Consultation is Complete!
                            </div>

                            <p>Thank you for choosing MediChain Hospital for your healthcare needs. We hope you had a positive experience during your visit today.</p>

                            <div class="appointment-card">
                                <h2>📋 Your Completed Appointment</h2>
                                
                                <div class="detail-row">
                                    <div class="detail-label">👨‍⚕️ Doctor:</div>
                                    <div class="detail-value">${doctorName}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">🏥 Speciality:</div>
                                    <div class="detail-value">${speciality}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">📅 Date:</div>
                                    <div class="detail-value">${date}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">🕐 Time:</div>
                                    <div class="detail-value">${time}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">✅ Status:</div>
                                    <div class="detail-value" style="color: #10b981; font-weight: 600;">Completed</div>
                                </div>
                            </div>

                            <div class="care-tips">
                                <h3>💊 Post-Consultation Care</h3>
                                <ul>
                                    <li>Follow your doctor's prescribed treatment plan carefully</li>
                                    <li>Take medications as directed</li>
                                    <li>Keep track of any symptoms or changes</li>
                                    <li>Schedule follow-up appointments if recommended</li>
                                    <li>Contact us immediately if you have any concerns</li>
                                </ul>
                            </div>

                            <div class="info-box">
                                <p><strong>📄 Medical Records & Reports</strong></p>
                                <p>Your consultation details and any prescriptions have been saved to your account. You can access them anytime through your patient portal.</p>
                            </div>

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${frontendUrl}/my-appointments" class="button">
                                    📋 View My Records
                                </a>
                                <a href="${frontendUrl}/doctors" class="button button-secondary">
                                    📅 Book Next Appointment
                                </a>
                            </div>

                            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #166534; text-align: center;">
                                    <strong>💚 We Value Your Feedback!</strong><br>
                                    Your opinion helps us improve our services. Please take a moment to rate your experience.
                                </p>
                            </div>

                            <p style="font-size: 16px; line-height: 1.8;">
                                If you have any questions about your treatment, need clarification on prescriptions, or wish to schedule a follow-up appointment, please don't hesitate to contact us.
                            </p>

                            <p style="margin-top: 20px;">
                                Wishing you good health and speedy recovery!<br><br>
                                Warm regards,<br>
                                <strong>MediChain Hospital Team</strong>
                            </p>
                        </div>

                        <div class="footer">
                            <p><strong>📞 24/7 Support:</strong> Available for any concerns or emergencies</p>
                            <p>📧 Email: ${senderEmail} | 🌐 Website: ${frontendUrl}</p>
                            <p style="margin-top: 15px;">© ${new Date().getFullYear()} MediChain Hospital. All rights reserved.</p>
                            <p>This is an automated email, please do not reply to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            email,
            'Thank You for Visiting - MediChain Hospital',
            htmlContent,
            patientName || 'Patient',
            'MediChain'
        );

        if (result.success) {
            console.log(`✅ Appointment completion thank you email sent to ${email}`);
            return {
                success: true,
                message: 'Appointment completion email sent successfully',
                messageId: result.messageId
            };
        } else {
            return result;
        }

    } catch (error) {
        console.error('❌ Error sending appointment completion email:', error);
        return {
            success: false,
            message: 'Failed to send appointment completion email',
            error: error.message
        };
    }
};

// Send job interview invitation email when application is approved
export const sendJobInterviewEmail = async (email, { name, role }) => {
    try {
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 0;
                            background-color: #f4f4f4;
                        }
                        .email-container {
                            background-color: #ffffff;
                            margin: 20px;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.08);
                        }
                        .header {
                            background: linear-gradient(135deg, #5f6fff 0%, #4f5fd9 100%);
                            color: white;
                            padding: 28px 22px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 700;
                        }
                        .content {
                            padding: 26px 22px 28px;
                        }
                        .greeting {
                            font-size: 16px;
                            margin-bottom: 16px;
                        }
                        .pill {
                            display: inline-block;
                            padding: 6px 12px;
                            border-radius: 999px;
                            background-color: #EEF2FF;
                            color: #4338CA;
                            font-size: 12px;
                            font-weight: 600;
                            margin-bottom: 16px;
                        }
                        .info-box {
                            background-color: #F9FAFB;
                            border-radius: 10px;
                            padding: 16px 18px;
                            border: 1px solid #E5E7EB;
                            margin: 16px 0 20px;
                        }
                        .info-box p {
                            margin: 4px 0;
                        }
                        .footer {
                            padding: 18px 22px 22px;
                            background-color: #F9FAFB;
                            text-align: center;
                            font-size: 12px;
                            color: #6B7280;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>Interview Invitation</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear ${name || 'Candidate'},</p>
                            <span class="pill">MediChain+ Careers</span>
                            <p>
                                Thank you for applying for the <strong>${role || 'open'}</strong> position at MediChain+.
                                We are pleased to inform you that your profile has been shortlisted for the next round of our hiring process.
                            </p>
                            <div class="info-box">
                                <p><strong>Next Steps:</strong></p>
                                <p>• Our HR team will contact you shortly with the exact interview schedule and meeting link / venue details.</p>
                                <p>• Please keep your updated resume and ID proof handy during the interview.</p>
                                <p>• If you have any questions, you can reply to this email or contact our support team.</p>
                            </div>
                            <p>
                                We appreciate your interest in joining MediChain+ and look forward to speaking with you soon.
                            </p>
                            <p style="margin-top: 18px;">
                                Best regards,<br />
                                <strong>MediChain+ Careers Team</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} MediChain+. All rights reserved.</p>
                            <p>This is an automated email, please do not reply directly to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            email,
            `Interview Invitation - ${role || 'MediChain+'} Position`,
            htmlContent,
            name || 'Candidate',
            'MediChain Careers'
        );

        if (result.success) {
            console.log(`✅ Job interview invitation email sent to ${email}`);
            return { success: true, message: 'Interview email sent successfully' };
        } else {
            return result;
        }
    } catch (error) {
        console.error('❌ Error sending job interview email:', error);
        return { success: false, message: 'Failed to send interview email', error: error.message };
    }
};

// Send job rejection email when application is rejected
export const sendJobRejectionEmail = async (email, { name, role }) => {
    try {
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 0;
                            background-color: #f4f4f4;
                        }
                        .email-container {
                            background-color: #ffffff;
                            margin: 20px;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.08);
                        }
                        .header {
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                            color: white;
                            padding: 26px 22px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 22px;
                            font-weight: 700;
                        }
                        .content {
                            padding: 26px 22px 28px;
                        }
                        .greeting {
                            font-size: 16px;
                            margin-bottom: 14px;
                        }
                        .footer {
                            padding: 18px 22px 22px;
                            background-color: #F9FAFB;
                            text-align: center;
                            font-size: 12px;
                            color: #6B7280;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>Application Status Update</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear ${name || 'Candidate'},</p>
                            <p>
                                Thank you for taking the time to apply for the
                                <strong>${role || 'open'}</strong> position at MediChain+.
                            </p>
                            <p>
                                After careful review, we regret to inform you that we will not be
                                moving forward with your application at this time.
                            </p>
                            <p>
                                This decision was not easy and reflects our current hiring priorities.
                                We encourage you to stay connected with MediChain+ and apply again in the future
                                if you see another role that matches your skills and experience.
                            </p>
                            <p>
                                We truly appreciate your interest in joining our team and wish you all the best
                                in your ongoing career journey.
                            </p>
                            <p style="margin-top: 18px;">
                                Warm regards,<br />
                                <strong>MediChain+ Careers Team</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} MediChain+. All rights reserved.</p>
                            <p>This is an automated email, please do not reply directly to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            email,
            `Application Update - ${role || 'MediChain+'} Position`,
            htmlContent,
            name || 'Candidate',
            'MediChain Careers'
        );

        if (result.success) {
            console.log(`✅ Job rejection email sent to ${email}`);
            return { success: true, message: 'Rejection email sent successfully' };
        } else {
            return result;
        }
    } catch (error) {
        console.error('❌ Error sending job rejection email:', error);
        return { success: false, message: 'Failed to send rejection email', error: error.message };
    }
};

// Send welcome email to doctor with login credentials
export const sendDoctorWelcomeEmail = async (email, { name, password, employeeId }) => {
    try {
        const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 0;
                            background-color: #f4f4f4;
                        }
                        .email-container {
                            background-color: #ffffff;
                            margin: 20px;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.08);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px 25px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 700;
                        }
                        .header .subtitle {
                            margin: 8px 0 0;
                            font-size: 14px;
                            opacity: 0.95;
                        }
                        .content {
                            padding: 30px 25px;
                        }
                        .greeting {
                            font-size: 16px;
                            margin-bottom: 16px;
                            color: #1f2937;
                        }
                        .credentials-box {
                            background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
                            border-left: 4px solid #667eea;
                            padding: 20px;
                            margin: 24px 0;
                            border-radius: 8px;
                        }
                        .credentials-box h3 {
                            margin: 0 0 16px;
                            color: #4f46e5;
                            font-size: 18px;
                            font-weight: 600;
                        }
                        .credential-item {
                            margin: 12px 0;
                            padding: 12px;
                            background: white;
                            border-radius: 6px;
                            border: 1px solid #e5e7eb;
                        }
                        .credential-label {
                            font-size: 12px;
                            font-weight: 600;
                            color: #6b7280;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 4px;
                        }
                        .credential-value {
                            font-size: 16px;
                            font-weight: 700;
                            color: #1f2937;
                            font-family: 'Courier New', monospace;
                        }
                        .info-box {
                            background-color: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 16px;
                            margin: 20px 0;
                            border-radius: 6px;
                        }
                        .info-box p {
                            margin: 8px 0;
                            font-size: 14px;
                            color: #92400e;
                        }
                        .footer {
                            padding: 20px 25px;
                            background-color: #F9FAFB;
                            text-align: center;
                            font-size: 12px;
                            color: #6B7280;
                            border-top: 1px solid #e5e7eb;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: 600;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>Welcome to MediChain</h1>
                            <p class="subtitle">Doctor Management System</p>
                        </div>
                        <div class="content">
                            <p class="greeting">Dear ${name || 'Doctor'},</p>
                            <p>
                                Your doctor account has been successfully created in our MediChain Doctor Management System.
                                You can now access the system to view appointments, manage your schedule, and update your profile.
                            </p>
                            
                            <div class="credentials-box">
                                <h3>Your Login Credentials</h3>
                                <div class="credential-item">
                                    <div class="credential-label">Email</div>
                                    <div class="credential-value">${email}</div>
                                </div>
                                ${employeeId ? `
                                <div class="credential-item">
                                    <div class="credential-label">Employee ID</div>
                                    <div class="credential-value">${employeeId}</div>
                                </div>
                                ` : ''}
                                <div class="credential-item">
                                    <div class="credential-label">Password</div>
                                    <div class="credential-value">${password}</div>
                                </div>
                            </div>
                            
                            <div class="info-box">
                                <p><strong>⚠️ Important:</strong></p>
                                <p>• Please change your password after your first login for security purposes</p>
                                <p>• Keep your login credentials secure and do not share them with anyone</p>
                                <p>• If you have any questions, please contact the administrator</p>
                            </div>
                            
                            <p style="margin-top: 24px;">
                                We look forward to working with you and providing excellent healthcare services through MediChain.
                            </p>
                            
                            <p style="margin-top: 18px;">
                                Warm regards,<br />
                                <strong>MediChain Administration Team</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} MediChain. All rights reserved.</p>
                            <p>This is an automated email, please do not reply directly to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

        const result = await sendEmail(
            email,
            'Welcome to MediChain - Doctor Account Created',
            htmlContent,
            name || 'Doctor',
            'MediChain'
        );

        if (result.success) {
            console.log(`✅ Welcome email sent to doctor ${email} (${name})`);
            return { success: true, message: 'Welcome email sent successfully' };
        } else {
            return result;
        }
    } catch (error) {
        console.error('❌ Error sending doctor welcome email:', error);
        return { success: false, message: 'Failed to send welcome email', error: error.message };
    }
};

