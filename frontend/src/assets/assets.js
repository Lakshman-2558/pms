import appointment_img from './appointment_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import logo from './logo.svg'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc3 from './doc3.png'
import doc4 from './doc4.png'
import doc5 from './doc5.png'
import doc6 from './doc6.png'
import doc7 from './doc7.png'
import doc8 from './doc8.png'
import doc9 from './doc9.png'
import doc10 from './doc10.png'
import doc11 from './doc11.png'
import doc12 from './doc12.png'
import doc13 from './doc13.png'
import doc14 from './doc14.png'
import doc15 from './doc15.png'
import doc16 from './doc16.png'
import doc17 from './doc17.png'
import Cardiologist from './Cardiologist.svg'
import Dentist from './Dentist.svg'
import Dermatologist from './Dermatologist.svg'
import ENT from './ENT.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Ophthalmologist from './Ophthalmologist.svg'
import Orthopedic from './Orthopedic.svg'
import Pediatricians from './Pediatricians.svg'
import Psychiatrist from './Psychiatrist.svg'


export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo,
    doc1,
    doc2,
    doc3,
    doc4,
    doc5,
    doc6,
    doc7,
    doc8,
    doc9,
    doc10,
    doc11,
    doc12,
    doc13,
    doc14,
    doc15,
    doc16,
    doc17
}

export const specialityData = [
    {
        speciality: 'General Medicine',
        image: General_physician
    },
    {
        speciality: 'Gynecology',
        image: Gynecologist
    },
    {
        speciality: 'Dermatology',
        image: Dermatologist
    },
    {
        speciality: 'Pediatrics',
        image: Pediatricians
    },
    {
        speciality: 'Neurology',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterology',
        image: Gastroenterologist
    },
    {
        speciality: 'Cardiology',
        image: Cardiologist
    },
    {
        speciality: 'Orthopedics',
        image: Orthopedic
    },
    {
        speciality: 'Psychiatry',
        image: Psychiatrist
    },
    {
        speciality: 'Ophthalmology',
        image: Ophthalmologist
    },
    {
        speciality: 'ENT',
        image: ENT
    },
    {
        speciality: 'Dentistry',
        image: Dentist
    },
]

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: doc1,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Richard James is a trusted general physician with a strong focus on preventive care, lifestyle counselling, and early diagnosis of chronic conditions. He is known for listening carefully to patients, explaining treatment options in simple language, and building long‑term relationships with families.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Emily Larson is a compassionate gynecologist who specializes in women’s health across all stages of life, from adolescence to menopause. She believes in evidence‑based care, respectful communication, and creating a safe environment where every patient feels heard and supported.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc3',
        name: 'Dr. Sarah Patel',
        image: doc3,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Sarah Patel is a dermatologist with a keen interest in acne management, hair and scalp disorders, and cosmetic dermatology. She combines modern therapies with skin‑care education so that patients understand how to protect and maintain healthy skin every day.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc4',
        name: 'Dr. Christopher Lee',
        image: doc4,
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Christopher Lee is a caring pediatrician who enjoys working closely with parents to track growth, development, and vaccination schedules. His gentle approach helps children feel comfortable during visits while ensuring early detection and treatment of common childhood illnesses.',
        fees: 40,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc5',
        name: 'Dr. Jennifer Garcia',
        image: doc5,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Jennifer Garcia is a neurologist experienced in treating migraines, seizure disorders, and nerve‑related conditions. She focuses on detailed evaluations, clear explanations of test results, and long‑term management plans tailored to each patient’s daily routine.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc6',
        name: 'Dr. Andrew Williams',
        image: doc6,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Andrew Williams is a neurologist with a special interest in stroke rehabilitation and memory disorders. He works closely with multi‑disciplinary teams to improve quality of life, focusing on both medical treatment and practical lifestyle adjustments.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc7',
        name: 'Dr. Christopher Davis',
        image: doc7,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Christopher Davis is a general physician who manages everyday health concerns, chronic diseases, and annual health check‑ups. He emphasizes patient education, preventive screenings, and coordinated care with specialists when needed.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc8',
        name: 'Dr. Timothy White',
        image: doc8,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Timothy White is a gynecologist focused on safe pregnancies, menstrual health, and minimally invasive procedures. His practice blends advanced diagnostics with a warm, reassuring bedside manner that helps patients feel confident in their care.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc9',
        name: 'Dr. Ava Mitchell',
        image: doc9,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Ava Mitchell is a dermatologist passionate about treating eczema, allergies, and pigmentation concerns in all age groups. She focuses on gentle, science‑backed treatments and personalized skin‑care routines that fit into each patient’s lifestyle.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc10',
        name: 'Dr. Jeffrey King',
        image: doc10,
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Jeffrey King is a pediatrician who combines clinical expertise with a friendly, playful approach to children. He supports parents with clear guidance on nutrition, immunity, and developmental milestones from infancy through adolescence.',
        fees: 40,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc11',
        name: 'Dr. Zoe Kelly',
        image: doc11,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Zoe Kelly is a neurologist experienced in movement disorders, neuropathies, and complex headache syndromes. She believes in collaborative decision‑making, helping patients and families understand every step of the treatment journey.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc12',
        name: 'Dr. Patrick Harris',
        image: doc12,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Patrick Harris is a neurologist with a focus on epilepsy care and neuro‑rehabilitation. He works to design practical treatment plans that balance medication, therapy, and lifestyle changes for better long‑term outcomes.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc13',
        name: 'Dr. Chloe Evans',
        image: doc13,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Chloe Evans is a general physician who manages chronic conditions such as diabetes, hypertension, and thyroid disorders. She focuses on regular follow‑ups, structured treatment plans, and empowering patients to make informed health choices every day.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc14',
        name: 'Dr. Ryan Martinez',
        image: doc14,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Ryan Martinez is a gynecologist specializing in high‑risk pregnancies and advanced fertility evaluation. He is dedicated to providing respectful, confidential care and guiding families through important reproductive health decisions.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc15',
        name: 'Dr. Amelia Hill',
        image: doc15,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Amelia Hill is a dermatologist who focuses on teen skin health, cosmetic concerns, and long‑term skin protection. She enjoys designing clear, step‑by‑step treatment routines that help patients see consistent improvements over time.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
]