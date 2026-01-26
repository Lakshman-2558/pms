# MediChain - Full-Stack Healthcare Platform

A comprehensive healthcare management system that connects patients with doctors and hospitals, facilitating seamless appointment booking, profile management, and healthcare services.

## 🏗️ Architecture

This is a **three-tier full-stack application** consisting of:

1. **Frontend** - Patient-facing React application
2. **Admin Panel** - Administrative dashboard for managing the platform
3. **Backend** - RESTful API server built with Node.js/Express

## ✨ Features

### Patient Features

#### 🔐 Authentication & Security
- Secure registration and login with JWT
- Email verification system
- Password reset functionality with OTP
- Profile management with image upload
- Saved patient profiles for quick booking

#### 🔍 Doctor Discovery
- **Doctor Search** - Search doctors by specialty, name, or location
- **Hospital Browse** - Browse collaborated hospitals and their doctors
- **Specialty Filtering** - Filter doctors by medical specialty
- **Location-based Search** - Find nearby doctors and hospitals
- **Doctor Profiles** - View detailed doctor information including:
  - Qualifications and experience
  - Specialization and expertise
  - Consultation fees
  - Availability status
  - Patient reviews and ratings

#### 📅 Appointment Booking
- **Flexible Booking** - Book appointments for yourself or family members
- **Simplified Time Slot Selection** - Two slot type buttons:
  - **Morning Slots Button**: 10 AM - 1 PM (25 bookings maximum per day)
  - **Evening Slots Button**: 4 PM - 9 PM (25 bookings maximum per day)
  - Dynamic availability counter shows remaining slots in real-time
  - Click button to select slot type (no individual time picker)
  - System automatically assigns first available slot in selected time range
- **Symptom Selection** - Select symptoms based on doctor specialization
- **Prescription Upload** - Upload previous prescriptions/reports
- **Unified Payment Page** - Single payment page for all payment methods:
  - Pay online via Razorpay or Stripe
  - Pay on visit option (redirects to payment page)
  - Automatic payment detection and redirection
- **Appointment Confirmation** - Digital confirmation with QR code
- **QR Code Scanning** - Scan QR code to view patient details
- **WhatsApp Integration** - Receive appointment links via WhatsApp

#### 📱 Appointment Management
- **My Appointments** - View all booked appointments with modern, clean UI
  - Redesigned appointment cards with gradient headers
  - Doctor avatar with initials
  - Prominent token number display
  - QR code and appointment details in organized sections
  - Queue tracker integration for real-time wait times
- **Appointment History** - Track past consultations
- **Cancel Appointments** - Cancel appointments with refund handling
- **Payment Management** - Direct redirect to payment page for all payment types
  - "Pay Online" button redirects directly to payment page
  - "Pay on Visit" appointments also redirect to payment page
  - No inline payment method selection
- **OP Form Download** - Download Out Patient form for appointments
- **Receipt Management** - Receipt button removed for paid appointments (only OP Form and Cancel available)
- **Appointment Rescheduling** - Reschedule appointments (if supported)

#### 🎯 Queue Management System
- **Token Number Tracking** - Automatic token assignment for appointments
- **Real-time Wait Time** - Live estimated wait time calculation
- **Token Alerts** - Browser notifications when your turn is next
- **Live Doctor Status** - See if doctor is in-clinic, in-consult, or on-break
- **Delay Alerts** - Automatic notifications for appointment delays
- **Queue Position** - Know your position in the queue

#### 🏥 Hospital Features
- **Hospital Listings** - Browse all collaborated hospitals
- **Hospital Details** - View hospital information and doctors
- **Hospital Doctors** - See all doctors available at each hospital
- **Hospital Specialties** - Filter hospitals by specialization
- **Deduplication** - Smart deduplication prevents duplicate doctor listings

#### 📄 Health Records
- **Health Record Management** - Store and manage medical records
- **File Uploads** - Upload medical documents, reports, and prescriptions
- **Record History** - View complete health record history
- **Record Sharing** - Share records with doctors during consultation

#### 💬 Video Consultations
- **Virtual Consultations** - Schedule and attend video consultations
- **Consultation History** - View past video consultations
- **Consultation Details** - Access consultation notes and recordings

#### 🚨 Emergency Services
- **Emergency Fast-Lane** - Quick emergency assistance
- **Automatic Location Sharing** - Share location for emergency services
- **Emergency Contacts** - Manage emergency contacts (family and friends)
- **Emergency Alerts** - Send emergency alerts via SMS

#### 📊 Additional Features
- **Related Doctors** - Discover doctors with similar specialties
- **Symptoms by Specialization** - Get symptom suggestions based on specialty
- **Experience Badges** - Visual indicators for doctor experience levels
- **Responsive Design** - Mobile-first, works on all devices

### Doctor Features

#### 👨‍⚕️ Doctor Dashboard
- **Appointment Overview** - View all scheduled appointments
- **Patient Management** - Access patient information and history
- **Schedule Management** - Manage available time slots
- **Profile Management** - Update doctor profile and availability

#### 📊 Smart Queue Management System
- **Live Queue Display** - Real-time view of patient queue with token numbers
- **Status Management** - Update status (In-clinic, In-consult, On-break, Unavailable)
- **Smart Scheduling Suggestions**:
  - Automatically suggests pulling next patient when consultation runs short
  - Recommends moving follow-up patients to fill gaps
  - Detects no-show patients and suggests queue adjustments
- **Quick Actions** - Start consultation, mark complete, or mark no-show with one click
- **Performance Tracking** - Average consultation time tracking for better scheduling
- **Delay Monitoring** - Automatic detection and alerts for delayed appointments
- **Queue Optimization** - AI-powered suggestions for optimal queue management

#### 📈 Analytics & Reports
- **Appointment Statistics** - View appointment trends and patterns
- **Patient Analytics** - Understand patient demographics
- **Revenue Tracking** - Track earnings and payments

### Admin Features

#### 📊 Dashboard Analytics
- **Overview Statistics** - Doctors, patients, and appointments count
- **Revenue Tracking** - Track platform earnings
- **Growth Metrics** - Monitor user growth and engagement

#### 👨‍⚕️ Doctor Management
- **Add Doctors** - Add new doctors to the platform
- **Manage Doctors** - Update doctor information and availability
- **Doctor Verification** - Verify and approve doctor profiles
- **Bulk Operations** - Import/export doctor data

#### 🏥 Hospital Management
- **Hospital Tie-ups** - Manage collaborated hospitals
- **Add Hospitals** - Add new hospital partnerships
- **Hospital Doctors** - Manage doctors within hospitals
- **Hospital Visibility** - Control hospital visibility on platform

#### 📋 Appointment Management
- **View All Appointments** - Monitor all platform appointments
- **Appointment Analytics** - Track appointment trends
- **Cancellation Management** - Handle appointment cancellations
- **Refund Processing** - Process refunds for cancelled appointments

#### 👥 Patient Management
- **Patient Database** - View all registered patients
- **Patient Analytics** - Monitor patient demographics and behavior
- **Support Management** - Handle patient support requests

#### 💼 Additional Admin Features
- **Job Applications** - Manage job applications
- **Specialty Management** - Add and manage medical specialties
- **System Settings** - Configure platform settings
- **User Support** - Handle user queries and support

## 🛠️ Tech Stack

### Frontend & Admin Panel
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Framer Motion** - Smooth animations
- **React Toastify** - Toast notifications
- **React QR Code** - QR code generation
- **HTML2Canvas** - Screenshot utility for appointment tickets

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT (jsonwebtoken)** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image and file storage
- **Razorpay** - Payment gateway (India)
- **Stripe** - Payment gateway (International)
- **Validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **Brevo (Sendinblue)** - Email service
- **Twilio** - SMS service (optional)

### AI & ML Services
- **Google Gemini AI** - AI-powered medical assistance
- **Medical Intent Classification** - Symptom and condition classification
- **Severity Scoring** - Medical condition severity assessment
- **OTC Medicine Suggestions** - Over-the-counter medicine recommendations

### DevOps & Deployment
- **Vercel** - Hosting platform
- **MongoDB Atlas** - Cloud database
- **Cloudinary** - Cloud file storage

## 🆕 Recent Updates

### Appointment Booking Improvements
- **Simplified Slot Selection**: Replaced individual time slot picker with two intuitive buttons (Morning 10 AM-1 PM and Evening 4 PM-9 PM)
- **Dynamic Availability**: Real-time availability counter showing remaining slots out of 25 for each slot type
- **Automatic Slot Assignment**: System automatically assigns the first available slot when a slot type is selected
- **Booking Limits**: Enforced 25 bookings maximum per slot type per day with backend validation

### Payment Flow Enhancements
- **Unified Payment Page**: All payment methods (Pay Online, Pay on Visit) redirect to a single payment page
- **Automatic Payment Detection**: UPI payments are automatically detected via polling (every 3 seconds)
- **Auto-Redirect**: Users are automatically redirected to appointment page upon successful payment
- **Removed Manual Steps**: Eliminated manual UPI ID copying and "Pay Now" button for UPI payments

### UI/UX Improvements
- **My Appointments Redesign**: Modern card-based layout with gradient headers, doctor avatars, and organized information sections
- **Receipt Management**: Removed receipt button for paid appointments (only OP Form and Cancel available)
- **Queue Integration**: Real-time queue status and wait time tracking integrated into appointment cards
- **Footer Updates**: Fixed shield logo positioning, updated branding to "medchain", and made all links clickable

### Hospital & Doctor Management
- **Bulk Doctor Upload**: CSV/Excel bulk upload for hospital doctors with email credential delivery
- **Hospital Name Validation**: CSV validation ensures doctors are uploaded to the correct hospital
- **Doctor Migration**: Automatic migration of embedded doctors to main doctors collection
- **Duplicate Prevention**: Smart deduplication prevents duplicate doctor entries in listings

## 📁 Project Structure

```
prescripto-full-stack/
├── frontend/                    # Patient-facing React application
│   ├── src/
│   │   ├── assets/             # Images, icons, SVG files
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AppointmentBookingModal.jsx
│   │   │   ├── BackButton.jsx
│   │   │   ├── BrandLogo.jsx
│   │   │   ├── DoctorAppointmentBooking.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HospitalTieUps.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── QueueTracker.jsx
│   │   │   ├── RelatedDoctors.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   ├── SymptomsBySpecialization.jsx
│   │   │   └── UploadReportsModal.jsx
│   │   ├── context/            # React Context providers
│   │   │   └── AppContext.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── About.jsx
│   │   │   ├── AllDoctorsList.jsx
│   │   │   ├── Appointment.jsx
│   │   │   ├── CollaboratedHospitals.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── DataSecurity.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── DoctorProfile.jsx
│   │   │   ├── Emergency.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── HospitalDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyAppointments.jsx
│   │   │   ├── MyProfile.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── Verify.jsx
│   │   │   └── VerifyAppointment.jsx
│   │   ├── utils/              # Utility functions
│   │   │   ├── experienceBadge.js
│   │   │   └── locationUtils.js
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   └── package.json
│
├── admin/                       # Admin dashboard React application
│   ├── src/
│   │   ├── assets/             # Admin-specific assets
│   │   ├── components/        # Admin components
│   │   ├── context/           # Admin context providers
│   │   │   ├── AdminContext.jsx
│   │   │   ├── AppContext.jsx
│   │   │   ├── DoctorContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/             # Admin pages
│   │   │   ├── Admin/         # Admin-specific pages
│   │   │   │   ├── AddDoctor.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Doctors.jsx
│   │   │   │   ├── HospitalTieUps.jsx
│   │   │   │   ├── Patients.jsx
│   │   │   │   └── Appointments.jsx
│   │   │   ├── Doctor/        # Doctor dashboard pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Appointments.jsx
│   │   │   │   ├── QueueManagement.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── Login.jsx
│   │   └── App.jsx
│   └── package.json
│
├── backend/                     # Node.js/Express API server
│   ├── api/                    # API configuration
│   │   └── index.js
│   ├── config/                 # Database and service configs
│   │   ├── cloudinary.js
│   │   └── mongodb.js
│   ├── controllers/            # Business logic
│   │   ├── adminController.js
│   │   ├── aiControllerGemini.js
│   │   ├── consultationController.js
│   │   ├── doctorController.js
│   │   ├── emergencyController.js
│   │   ├── healthRecordController.js
│   │   ├── hospitalController.js
│   │   ├── hospitalTieUpController.js
│   │   ├── jobApplicationController.js
│   │   ├── locationController.js
│   │   ├── otpController.js
│   │   ├── patientController.js
│   │   ├── specialtyController.js
│   │   └── userController.js
│   ├── middleware/             # Auth and file upload middleware
│   │   ├── authAdmin.js
│   │   ├── authDoctor.js
│   │   ├── authUser.js
│   │   ├── multer.js
│   │   └── resumeUpload.js
│   ├── models/                 # MongoDB schemas
│   │   ├── appointmentModel.js
│   │   ├── consultationModel.js
│   │   ├── doctorModel.js
│   │   ├── healthRecordModel.js
│   │   ├── hospitalModel.js
│   │   ├── hospitalTieUpModel.js
│   │   ├── jobApplicationModel.js
│   │   ├── specialtyModel.js
│   │   └── userModel.js
│   ├── routes/                 # API routes
│   │   ├── adminRoute.js
│   │   ├── aiRoute.js
│   │   ├── doctorRoute.js
│   │   ├── emergencyRoute.js
│   │   ├── hospitalRoute.js
│   │   ├── hospitalTieUpRoute.js
│   │   ├── jobApplicationRoute.js
│   │   ├── locationRoute.js
│   │   ├── otpRoute.js
│   │   ├── specialtyRoute.js
│   │   └── userRoute.js
│   ├── services/               # External service integrations
│   │   ├── brevoMailer.js
│   │   ├── emailService.js
│   │   ├── queueService.js
│   │   ├── smsService.js
│   │   └── whatsappService.js
│   ├── utils/                  # Utility functions
│   │   ├── followUpQuestions.js
│   │   ├── medicalHandler.js
│   │   ├── medicalHandlers.js
│   │   ├── medicalIntentClassifier.js
│   │   ├── medicalKnowledgeBase.js
│   │   ├── medicineLinks.js
│   │   ├── mistralService.js
│   │   ├── otcMedicineSuggestor.js
│   │   ├── otpStorage.js
│   │   └── severityScorer.js
│   ├── scripts/                # Database scripts
│   │   └── addWhatsAppRecipient.js       # Add WhatsApp recipients
│   ├── server.js              # Entry point
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md
├── QUICK_DEPLOY.md
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (for image uploads)
- **Razorpay/Stripe** account (for payments)
- **Brevo (Sendinblue)** account (for emails)
- **Twilio** account (optional, for SMS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prescripto-full-stack
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install Admin Panel Dependencies**
   ```bash
   cd ../admin
   npm install
   ```

### Environment Configuration

#### Backend (.env)
Create a `.env` file in the `backend/` directory:
```env
# Database
# For MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
# For Local MongoDB Compass:
MONGODB_URI=mongodb://localhost:27017/healthsystem

# Server
PORT=4000
JWT_SECRET=<generate_a_strong_random_secret_key>

# Currency
CURRENCY=INR

# Admin Credentials
ADMIN_EMAIL=<your_admin_email>
ADMIN_PASSWORD=<your_secure_admin_password>

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

# Payment Gateways
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
STRIPE_SECRET_KEY=<your_stripe_secret_key>

# Email Service (Brevo/Sendinblue)
BREVO_API_KEY=<your_brevo_api_key>
BREVO_SENDER_EMAIL=<your_sender_email>

# SMS Service (Twilio - Optional)
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
TWILIO_PHONE_NUMBER=<your_twilio_phone_number>

# WhatsApp Service (Optional)
WHATSAPP_API_KEY=<your_whatsapp_api_key>
WHATSAPP_PHONE_NUMBER_ID=<your_whatsapp_phone_number_id>
```

#### Frontend (.env)
Create a `.env` file in the `frontend/` directory:
```env
VITE_BACKEND_URL=http://localhost:4000
```

#### Admin (.env)
Create a `.env` file in the `admin/` directory:
```env
VITE_BACKEND_URL=http://localhost:4000
```

### Running the Application

#### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm run server  # Uses nodemon for auto-reload
   ```
   Backend will run on `http://localhost:4000`

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173` (or another port)

3. **Start Admin Panel**
   ```bash
   cd admin
   npm run dev
   ```
   Admin panel will run on a separate port

#### Production Mode

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build Admin Panel**
   ```bash
   cd admin
   npm run build
   ```

3. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

## 🌐 Deployment

This application is configured for deployment on **Vercel**. See the detailed deployment guides:
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment instructions
- `QUICK_DEPLOY.md` - Quick deployment in 5 minutes

### Quick Deployment Steps

1. Deploy backend to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy frontend and admin panel separately
4. Update frontend/admin `.env` with production backend URL

## 🔐 Authentication & Authorization

- **JWT-based authentication** for all user types
- **Role-based access control**:
  - **Patients** - Can book appointments, manage profile, view health records
  - **Doctors** - Can view appointments, manage schedule, update queue
  - **Admins** - Full system access

## 👤 Creating Admin and Doctor Accounts

### Creating an Admin Account

Admin accounts are **not stored in the database**. They are authenticated using environment variables.

**Steps to create an admin account:**

1. **Set Environment Variables**
   
   Open your `backend/.env` file and set the following variables:
   ```env
   ADMIN_EMAIL=<your_admin_email>
   ADMIN_PASSWORD=<your_secure_password>
   ```
   
   Replace `<your_admin_email>` with your desired admin email and `<your_secure_password>` with a strong password.

2. **Login to Admin Panel**
   
   - Navigate to your admin panel (usually at `http://localhost:5174` or your admin panel URL)
   - Use the email and password you set in the `.env` file
   - You'll be logged in as an admin with full system access

**Note:** You can create multiple admin accounts by changing the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values in your `.env` file. However, only one admin account can be active at a time (the one matching the current environment variables).

### Creating a Doctor Account

There are **three ways** to create doctor accounts:

#### Method 1: Through Admin Panel (Recommended)

1. **Login as Admin**
   - First, ensure you have an admin account set up (see above)
   - Login to the admin panel

2. **Navigate to Add Doctor Page**
   - Go to the "Add Doctor" section in the admin panel
   - Fill in the required information:
     - **Name**: Doctor's full name
     - **Email**: Doctor's email address (must be unique)
     - **Password**: Doctor's login password (minimum 8 characters)
     - **Speciality**: Medical specialty (e.g., "Cardiologist", "General physician")
     - **Degree**: Medical qualifications (e.g., "MBBS", "MD")
     - **Experience**: Years of experience (e.g., "5 Years")
     - **About**: Brief description about the doctor
     - **Fees**: Consultation fee (number)
     - **Address**: Doctor's clinic/hospital address
     - **Image**: Upload doctor's profile picture

3. **Submit the Form**
   - Click "Add Doctor" to create the account
   - The doctor can now login using their email and password at the doctor login page

#### Method 2: Using API Endpoint (Programmatic)

If you want to create doctors programmatically, use the admin API:

```bash
POST /api/admin/add-doctor
Headers: {
  "aToken": "your_admin_jwt_token"
}
Body (FormData): {
  name: "Dr. John Doe",
  email: "doctor@example.com",
  password: "securepassword123",
  speciality: "Cardiologist",
  degree: "MBBS, MD",
  experience: "10 Years",
  about: "Experienced cardiologist...",
  fees: 500,
  address: JSON.stringify({ line1: "123 Main St", line2: "City, State" }),
  image: <file>
}
```

#### Method 3: Using Database Script (For Testing)

### Doctor Login

After creating a doctor account:

1. Navigate to the doctor login page (usually in the admin panel or a separate doctor portal)
2. Enter the doctor's email and password
3. The doctor will have access to:
   - View appointments
   - Manage queue
   - Update profile
   - View dashboard statistics

### Important Notes

- **Admin accounts** are environment-based and don't require database setup
- **Doctor accounts** are stored in the `doctorModel` collection in MongoDB
- Each doctor must have a **unique email address**
- Doctor passwords are **hashed** using bcrypt before storage
- Admin can **view, update, and manage** all doctors through the admin panel
- Doctors created through the admin panel have full access to the doctor dashboard

## 📱 API Endpoints

### User Routes (`/api/user`)

#### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `GET /verify` - Email verification
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with OTP

#### Profile Management
- `GET /get-profile` - Get user profile (Auth required)
- `POST /update-profile` - Update user profile (Auth required)
- `GET /saved-profiles` - Get saved patient profiles (Auth required)
- `POST /save-profile` - Save patient profile (Auth required)

#### Appointments
- `POST /book-appointment` - Book appointment (Auth required)
- `GET /appointments` - Get user appointments (Auth required)
- `POST /cancel-appointment` - Cancel appointment (Auth required)
- `GET /appointment/verify/:id` - Verify appointment by QR code (Public)

#### Payments
- `POST /payment-razorpay` - Create Razorpay payment (Auth required)
- `POST /verifyRazorpay` - Verify Razorpay payment (Auth required)
- `POST /payment-stripe` - Create Stripe payment (Auth required)
- `POST /verifyStripe` - Verify Stripe payment (Auth required)

#### Queue Management
- `GET /queue-status?appointmentId=xxx` - Get queue status (Auth required)
- `GET /doctor-status?docId=xxx` - Get live doctor status (Public)
- `POST /mark-alerted` - Mark appointment as alerted (Auth required)

#### Health Records
- `POST /health-records` - Create health record (Auth required)
- `GET /health-records` - Get user health records (Auth required)
- `GET /health-records/:recordId` - Get specific health record (Auth required)
- `DELETE /health-records/:recordId` - Delete health record (Auth required)

#### Video Consultations
- `POST /consultation/create` - Create consultation (Auth required)
- `GET /consultations` - Get user consultations (Auth required)
- `GET /consultation/:consultationId` - Get consultation details (Auth required)

#### Emergency
- `POST /emergency-sms` - Send emergency alert (Auth required)
- `GET /emergency-contacts` - Get emergency contacts (Auth required)
- `POST /emergency-contacts/add` - Add emergency contact (Auth required)
- `POST /emergency-contacts/update` - Update emergency contact (Auth required)
- `POST /emergency-contacts/delete` - Delete emergency contact (Auth required)

#### Contact
- `POST /contact` - Send contact message (Public)

### Doctor Routes (`/api/doctor`)

- `POST /login` - Doctor login
- `GET /appointments/:docId` - Get doctor appointments (Auth required)
- `GET /profile/:docId` - Get doctor profile (Auth required)
- `GET /queue-status?slotDate=xxx` - Get queue status and suggestions (Auth required)
- `POST /update-status` - Update doctor status (Auth required)
- `POST /start-consultation` - Start consultation (Auth required)
- `POST /complete-consultation` - Complete consultation (Auth required)
- `POST /move-appointment` - Move appointment in queue (Auth required)
- `GET /smart-suggestions` - Get AI-powered scheduling suggestions (Auth required)

### Admin Routes (`/api/admin`)

- `POST /login` - Admin login
- `GET /dashboard` - Get dashboard statistics (Auth required)
- `POST /add-doctor` - Add new doctor (Auth required)
- `GET /doctors` - Get all doctors (Auth required)
- `GET /appointments` - Get all appointments (Auth required)
- `GET /patients` - Get all patients (Auth required)

### Hospital Routes (`/api/hospital-tieup`)

- `GET /` - Get all hospitals (Public)
- `GET /public` - Get public hospitals (Public)
- `GET /:id` - Get hospital details (Public)
- `GET /doctors/all` - Get all hospital doctors (Public)
- `POST /` - Add hospital (Auth required)
- `POST /:id/doctors` - Add doctor to hospital (Auth required)
- `PUT /:id/doctors/:doctorId` - Update hospital doctor (Auth required)
- `DELETE /:id/doctors/:doctorId` - Remove doctor from hospital (Auth required)

### Specialty Routes (`/api/specialty`)

- `GET /` - Get all specialties (Public)
- `POST /` - Add specialty (Auth required)

### AI Routes (`/api/ai`)

- `POST /chat` - AI medical chat (Auth required)
- `POST /analyze-symptoms` - Analyze symptoms (Auth required)

## 🗄️ Database Models

### User Model
- User information and profile
- Saved patient profiles
- Emergency contacts
- Health records references
- Authentication data

### Doctor Model
- Doctor details, specialties, availability
- `status`: in-clinic, in-consult, on-break, unavailable
- `currentAppointmentId`: Currently consulting patient
- `averageConsultationTime`: For wait time calculations
- `slots_booked`: Booked time slots
- `available`: Doctor availability flag

### Appointment Model
- Booking information, payment status, queue data
- `tokenNumber`: Assigned token number
- `queuePosition`: Current position in queue
- `estimatedWaitTime`: Calculated wait time in minutes
- `status`: pending, in-queue, in-consult, completed, no-show, cancelled
- `actualStartTime`, `actualEndTime`: Consultation timing
- `consultationDuration`: Actual consultation duration
- `isDelayed`: Delay flag
- `alerted`: Whether patient has been notified
- `actualPatient`: Patient information (for booking for others)
- `selectedSymptoms`: Array of selected symptoms
- `recentPrescription`: Prescription file URL

### Hospital Tie-Up Model
- Hospital information
- Array of doctors within hospital (with image support)
- Hospital specialization and type
- Visibility settings
- Doctor schema includes:
  - Name, qualification, specialization, experience
  - Image URL (custom or generated avatar)
  - Availability and visibility flags

### Health Record Model
- User health records
- Medical documents and files
- Record dates and descriptions

### Consultation Model
- Video consultation details
- Consultation notes
- Recording references

## 🎨 Key Features Implementation

### Image & File Upload
- **Cloudinary Integration** - Profile images, doctor photos, prescriptions
- **Multer Middleware** - File upload handling
- **File Validation** - Type and size validation

### Payment Processing
- **Dual Payment Gateway** - Razorpay (India) and Stripe (International)
- **Payment Verification** - Secure payment verification
- **Refund Handling** - Automatic refund processing

### QR Code System
- **QR Code Generation** - Digital appointment confirmations
- **QR Code Scanning** - Scan to view patient details
- **Public Verification** - Verify appointments without login
- **Patient Details Display** - Show complete patient information on scan

### Notification System
- **Email Notifications** - Brevo/Sendinblue integration
  - Appointment confirmations
  - Password reset emails
  - Verification emails
- **SMS Notifications** - Twilio integration (optional)
  - Appointment reminders
  - Queue updates
  - Emergency alerts
- **WhatsApp Integration** - Appointment links via WhatsApp
- **Browser Notifications** - Real-time queue alerts

### Queue Management
- **Automatic Token Assignment** - Sequential token numbers
- **Real-time Wait Time Calculation** - Based on consultation history
- **Smart Scheduling** - AI-powered suggestions
- **Delay Detection** - Automatic delay alerts
- **Status Tracking** - Live doctor and appointment status

### Hospital Management
- **Hospital Tie-ups** - Manage collaborated hospitals
- **Doctor Deduplication** - Smart deduplication prevents duplicates
- **Hospital Doctor Management** - Add/update/remove doctors from hospitals
- **Visibility Control** - Control hospital and doctor visibility

### AI Features
- **Medical Chat** - AI-powered medical assistance
- **Symptom Analysis** - Analyze and classify symptoms
- **Severity Scoring** - Assess medical condition severity
- **Medicine Suggestions** - OTC medicine recommendations
- **Smart Scheduling** - AI-powered queue optimization

### Location Services
- **Geolocation** - Get user location
- **Address Geocoding** - Convert addresses to coordinates
- **Distance Calculation** - Calculate distances between locations
- **Nearby Hospitals** - Find nearby hospitals

### Responsive Design
- **Mobile-first** - Optimized for mobile devices
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Accessibility** - WCAG compliant

## 🐛 Recent Fixes & Improvements

### Bug Fixes
1. **Duplicate Doctors Issue** - Fixed duplicate doctor listings in hospital pages
   - Implemented Map-based deduplication using name + specialization as unique key
   - Merged hospital names for doctors in multiple hospitals
   - Added null checks for doctor IDs
   - Prefers doctors with custom images when duplicates exist

2. **Null Error Fixes** - Fixed "Cannot read properties of null" errors
   - Added comprehensive null checks in frontend components
   - Default values for missing doctor properties
   - Safe property access throughout the application

3. **Booking Form Errors** - Fixed appointment booking issues
   - Validated doctor data before booking
   - Added error handling for missing data
   - Improved state management in booking modal

4. **QR Code Functionality** - Enhanced QR code system
   - QR codes now contain URLs for easy scanning
   - Created public verification endpoint
   - Patient details display on scan

5. **Login/Signup Navigation** - Fixed buttons not opening issue
   - Updated redirect logic to only redirect when both token and userData are present
   - Allows access to login/signup page even with stale tokens
   - Improved user experience for authentication flow

6. **MongoDB Connection** - Enhanced database connection handling
   - Support for local MongoDB Compass connection
   - Improved connection string configuration
   - Better error logging and connection status display

### New Features
1. **Saved Patient Profiles** - Save patient profiles for quick booking
2. **QR Code Scanning** - Scan QR codes to view patient details
3. **Hospital Deduplication** - Smart deduplication for hospital doctors
4. **Enhanced Error Handling** - Better error messages and handling

5. **Doctor Image Management** - Improved doctor image handling
   - Support for custom image URLs per doctor
   - Fallback to UI-Avatars for doctors without images
   - Image field added to hospital doctor schema
   - Script to update doctor images in bulk

6. **Enhanced Hospital Cards UI** - Modern, polished hospital card design
   - Improved card styling with rounded corners and shadows
   - Smooth hover animations (lift and scale effects)
   - Enhanced icon design with gradients and hover effects
   - Pulsing online status indicator
   - Better badge design with gradients
   - Improved spacing and typography
   - Enhanced "View Details" button with arrow icon
   - Responsive grid layout (1/2/3/4 columns based on screen size)

7. **Indian Healthcare Data** - Added real Indian healthcare providers
   - Hospitals from Telangana and Andhra Pradesh
   - Indian doctor names and qualifications
   - Real hospital addresses in Hyderabad, Visakhapatnam, Vijayawada
   - Support for Indian doctor images

### UI/UX Improvements
1. **Hospital Cards** - Complete redesign with modern aesthetics
   - Gradient backgrounds on hover
   - Decorative corner accents
   - Enhanced icon containers with borders and shadows
   - Better color scheme and contrast
   - Improved mobile responsiveness

2. **Doctor Images** - Consistent image display across the platform
   - Custom image URL support
   - Automatic avatar generation for doctors without images
   - Image preservation during updates
   - Better image fallback mechanism

## 📝 Available Scripts

### Backend
```bash
npm start        # Start production server
npm run server   # Start development server with nodemon
npm run fix-index # Fix MongoDB indexes
```

#### Database Utility Scripts
```bash
# Add WhatsApp recipients
npm run add-whatsapp-recipient
```

### Frontend/Admin
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt password encryption
- **Input Validation** - Validator library for input sanitization
- **CORS Protection** - Cross-origin resource sharing configuration
- **File Upload Security** - File type and size validation
- **SQL Injection Prevention** - Mongoose ODM protection
- **XSS Protection** - React's built-in XSS protection

## 📊 Performance Optimizations

- **Code Splitting** - Lazy loading for routes
- **Image Optimization** - Cloudinary CDN for images
- **Database Indexing** - Optimized MongoDB queries
- **Caching** - Context API for state management
- **Memoization** - React.memo and useMemo for optimization

## 🧪 Testing

- Manual testing for all features
- Error handling validation
- Payment gateway testing
- Queue system testing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use and modify

## 👥 Support

For issues, questions, or contributions, please open an issue on the repository.

## 🎯 Roadmap

### Upcoming Features
- [ ] Real-time chat support
- [ ] Telemedicine video calls
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Appointment reminders via push notifications
- [ ] Integration with more payment gateways
- [ ] Advanced AI diagnostics
- [ ] Electronic Health Records (EHR) system

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database solution
- Cloudinary for image storage
- All open-source contributors

---

**Built with ❤️ using React, Node.js, and MongoDB**

**MediChain - Connecting Patients with Healthcare Providers**
