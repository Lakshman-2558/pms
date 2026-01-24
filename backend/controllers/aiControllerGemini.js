import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { classifyIntent } from '../utils/medicalIntentClassifier.js';
import { handleMedicalMode } from '../utils/medicalHandler.js';
import { generateChatCompletion } from '../utils/mistralService.js';

// Get available doctors and specialties for context
const getDoctorsContext = async () => {
    try {
        const doctors = await doctorModel.find({ available: true }).select('name speciality degree experience fees _id');
        const specialties = [...new Set(doctors.map(doc => doc.speciality))];
        
        return {
            doctors: doctors.map(doc => ({
                id: doc._id.toString(),
                name: doc.name,
                speciality: doc.speciality,
                degree: doc.degree,
                experience: doc.experience,
                fees: doc.fees
            })),
            specialties
        };
    } catch (error) {
        console.error('Error fetching doctors context:', error);
        return { doctors: [], specialties: [] };
    }
};

// Get available slots for a doctor
const getAvailableSlots = async (docId, daysAhead = 7) => {
    try {
        const doctor = await doctorModel.findById(docId).select('slots_booked');
        if (!doctor) return [];

        const today = new Date();
        const availableSlots = [];

        for (let i = 0; i < daysAhead; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            const endTime = new Date(currentDate);
            endTime.setHours(21, 0, 0, 0);

            // Start time logic
            if (i === 0) {
                // Today - start from current hour + 1
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
            } else {
                // Future days - start from 10 AM
                currentDate.setHours(10);
                currentDate.setMinutes(0);
            }

            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const slotDate = `${day}_${month}_${year}`;

            const daySlots = [];

            while (currentDate < endTime) {
                const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const slotTime = formattedTime;

                const isSlotAvailable = !doctor.slots_booked[slotDate] || 
                                       !doctor.slots_booked[slotDate].includes(slotTime);

                if (isSlotAvailable) {
                    daySlots.push({
                        date: slotDate,
                        time: slotTime,
                        displayDate: currentDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                        }),
                        displayTime: slotTime
                    });
                }

                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            if (daySlots.length > 0) {
                availableSlots.push({
                    date: slotDate,
                    displayDate: new Date(year, month - 1, day).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    slots: daySlots.slice(0, 5) // Limit to 5 slots per day for display
                });
            }
        }

        return availableSlots;
    } catch (error) {
        console.error('Error fetching available slots:', error);
        return [];
    }
};

// Extract booking intent from message
const extractBookingIntent = (message, doctorsContext) => {
    const lowerMessage = message.toLowerCase().replace(/dr\./g, '').replace(/doctor/g, '').trim();
    const intent = {
        specialty: null,
        doctorName: null,
        doctorId: null,
        timePreference: null,
        datePreference: null
    };

    // Extract doctor name FIRST (priority) - improved matching
    for (const doctor of doctorsContext.doctors) {
        const doctorNameLower = doctor.name.toLowerCase().replace(/dr\./g, '').replace(/doctor/g, '').trim();
        const doctorNameParts = doctorNameLower.split(' ').filter(part => part.length > 1);
        
        // Normalize message for comparison (remove common words)
        const normalizedMessage = lowerMessage
            .replace(/\b(book|appointment|with|see|want|need|schedule)\b/g, '')
            .trim();
        
        // Try exact match first (after normalization)
        if (normalizedMessage.includes(doctorNameLower) || lowerMessage.includes(doctorNameLower)) {
            intent.doctorName = doctor.name;
            intent.doctorId = doctor.id;
            console.log(`✅ Exact match: "${doctor.name}" found in message`);
            break;
        }
        
        // Try matching first and last name together (both must be present)
        if (doctorNameParts.length >= 2) {
            const firstName = doctorNameParts[0];
            const lastName = doctorNameParts[doctorNameParts.length - 1];
            
            // Both names must be in the message
            const hasFirstName = normalizedMessage.includes(firstName) || lowerMessage.includes(firstName);
            const hasLastName = normalizedMessage.includes(lastName) || lowerMessage.includes(lastName);
            
            if (hasFirstName && hasLastName) {
                intent.doctorName = doctor.name;
                intent.doctorId = doctor.id;
                console.log(`✅ First+Last match: "${doctor.name}" (${firstName} + ${lastName})`);
                break;
            }
        }
        
        // Try matching significant parts (at least 4 characters)
        for (const part of doctorNameParts) {
            if (part.length >= 4) {
                const partInMessage = normalizedMessage.includes(part) || lowerMessage.includes(part);
                
                if (partInMessage) {
                    // For single-word names or if other parts also match
                    if (doctorNameParts.length === 1) {
                        intent.doctorName = doctor.name;
                        intent.doctorId = doctor.id;
                        console.log(`✅ Single name match: "${doctor.name}"`);
                        break;
                    }
                    
                    // Check if other significant parts also match
                    const otherPartsMatch = doctorNameParts.filter(p => 
                        p !== part && p.length >= 3 && 
                        (normalizedMessage.includes(p) || lowerMessage.includes(p))
                    ).length > 0;
                    
                    if (otherPartsMatch) {
                        intent.doctorName = doctor.name;
                        intent.doctorId = doctor.id;
                        console.log(`✅ Multi-part match: "${doctor.name}"`);
                        break;
                    }
                }
            }
        }
        
        if (intent.doctorId) break;
    }

    // Extract specialty (only if doctor not found)
    if (!intent.doctorId) {
        for (const specialty of doctorsContext.specialties) {
            const specialtyLower = specialty.toLowerCase();
            const specialtyWords = specialtyLower.split(' ');
            if (specialtyWords.some(word => word.length > 3 && lowerMessage.includes(word))) {
                intent.specialty = specialty;
                break;
            }
        }
    }

    // Extract time preference
    if (lowerMessage.includes('today')) intent.timePreference = 'today';
    else if (lowerMessage.includes('tomorrow')) intent.timePreference = 'tomorrow';
    else if (lowerMessage.includes('next week') || lowerMessage.includes('next week')) intent.timePreference = 'next_week';
    else if (lowerMessage.includes('this week')) intent.timePreference = 'this_week';

    return intent;
};

// AI Chat endpoint using Google Gemini (FREE!)
export const aiChat = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const { userId } = req.body;

        if (!message) {
            return res.json({ success: false, message: 'Message is required' });
        }

        // Get doctors and specialties for context
        const doctorsContext = await getDoctorsContext();
        
        // ============================================
        // STEP 1: INTENT CLASSIFICATION (TWO MODES)
        // ============================================
        const intentClassification = classifyIntent(message, conversationHistory);
        
        console.log('🎯 Intent Classification:', intentClassification);
        
        // ============================================
        // MODE 1: MEDICAL MODE
        // ============================================
        if (intentClassification.intent === 'MEDICAL_MODE') {
            try {
                return await handleMedicalMode(message, conversationHistory, intentClassification, doctorsContext, req, res);
            } catch (error) {
                console.error('Error in Medical Mode Handler:', error);
                // Fallback to normal query handling
                console.log('Falling back to normal query handling...');
            }
        }
        
        // ============================================
        // MODE 2: NORMAL MODE (Non-medical queries)
        // ============================================
        // Continue with normal query logic below
        const lowerMessage = message.toLowerCase();
        
        // Extract booking intent
        const bookingIntent = extractBookingIntent(message, doctorsContext);
        
        console.log('🔍 Booking Intent Extracted:', bookingIntent);
        
        // Get available slots if booking intent detected
        let availableSlots = null;
        let selectedDoctor = null;

        // PRIORITY 1: If specific doctor is mentioned, use ONLY that doctor
        if (bookingIntent.doctorId) {
            selectedDoctor = doctorsContext.doctors.find(d => d.id === bookingIntent.doctorId);
            if (selectedDoctor) {
                console.log(`✅ Found doctor: ${selectedDoctor.name} (ID: ${selectedDoctor.id})`);
                availableSlots = await getAvailableSlots(bookingIntent.doctorId);
            } else {
                console.log(`⚠️ Doctor ID found but doctor not in database: ${bookingIntent.doctorId}`);
            }
        } 
        // PRIORITY 2: If specialty mentioned but NO specific doctor, find doctors with that specialty
        else if (bookingIntent.specialty && !bookingIntent.doctorName) {
            const specialtyDoctors = doctorsContext.doctors.filter(d => 
                d.speciality.toLowerCase() === bookingIntent.specialty.toLowerCase()
            );
            if (specialtyDoctors.length > 0) {
                selectedDoctor = specialtyDoctors[0];
                console.log(`✅ Found doctor by specialty: ${selectedDoctor.name}`);
                availableSlots = await getAvailableSlots(selectedDoctor.id);
            }
        }
        
        // Log what we found
        if (selectedDoctor) {
            console.log(`📅 Available slots found: ${availableSlots?.length || 0} days`);
        } else if (bookingIntent.doctorName) {
            console.log(`⚠️ Doctor "${bookingIntent.doctorName}" mentioned but not found in database`);
        }

        // Build comprehensive system prompt
        // NORMAL MODE System Prompt - Simple, direct answers for non-medical queries
        let systemPrompt = `You are MediChain AI, the official medical assistant chatbot for the MediChain website.

💬 NORMAL MODE RULES:
- Respond in 1-2 SHORT sentences maximum
- NO paragraphs
- NO long explanations
- Keep it simple and direct
- Tone: friendly, clear, brief

Example:
User: "What is AI?"
Reply: "AI means machines that can think like humans. It helps in chatbots and search engines."

You help with:
- Booking appointments
- Finding doctors
- General questions about the platform
- Non-medical queries

IMPORTANT: Keep ALL responses SHORT. Maximum 2 sentences. No paragraphs.

🎯 YOUR PRIMARY ROLES:
1. Provide compassionate, evidence-based health guidance
2. Help patients find the right healthcare professional
3. Facilitate seamless appointment booking
4. Answer questions about medical specialties, doctors, and procedures
5. Offer preventive health advice and wellness tips

👤 YOUR PERSONALITY:
- Warm, friendly, and professional
- Patient and understanding
- Clear and concise in communication
- Empathetic to patient concerns
- Respectful of all patients regardless of background
- Use simple, jargon-free language
- Never condescending or dismissive

📋 COMPREHENSIVE MEDICAL KNOWLEDGE:

👨‍⚕️ AVAILABLE DOCTORS IN OUR NETWORK:
${doctorsContext.doctors.map(doc => 
    `- Dr. ${doc.name} (${doc.speciality}) - ₹${doc.fees}`
).join('\n')}

🏥 AVAILABLE SPECIALTIES:
${doctorsContext.specialties.join(', ')}

🔐 BOOKING RULES:
- If user mentions a SPECIFIC doctor by name → Use ONLY that doctor
- Always mention consultation fees upfront
- Show available appointment slots when requested`;

        // Add slot information if available
        if (availableSlots && availableSlots.length > 0 && selectedDoctor) {
            systemPrompt += `\n\nCRITICAL: The user specifically requested ${selectedDoctor.name}. Here are REAL available slots for ${selectedDoctor.name}:\n`;
            availableSlots.slice(0, 3).forEach(daySlot => {
                systemPrompt += `\n${daySlot.displayDate}:\n`;
                daySlot.slots.forEach(slot => {
                    systemPrompt += `  - ${slot.displayTime}\n`;
                });
            });
            systemPrompt += `\nIMPORTANT: Show slots ONLY for ${selectedDoctor.name}. Do NOT suggest other doctors.`;
        } else if (bookingIntent.doctorName && !selectedDoctor) {
            systemPrompt += `\n\nWARNING: User mentioned "${bookingIntent.doctorName}" but this doctor was not found in the database. Please inform the user that this doctor is not available and ask if they'd like to see other doctors.`;
        }

        // Build conversation messages for Mistral AI
        // generateChatCompletion is already imported at the top
        
        
        // Add explicit instruction if doctor was mentioned
        if (bookingIntent.doctorName && selectedDoctor) {
            systemPrompt += `\n\n🚨 CRITICAL INSTRUCTION 🚨
The user specifically asked for "${bookingIntent.doctorName}" which matches ${selectedDoctor.name} in our database.
YOU MUST:
- Respond ONLY about ${selectedDoctor.name}
- Show slots ONLY for ${selectedDoctor.name}
- Do NOT mention any other doctors
- Do NOT suggest alternatives
- Use the exact name: ${selectedDoctor.name}`;
        } else if (bookingIntent.doctorName && !selectedDoctor) {
            systemPrompt += `\n\n🚨 CRITICAL INSTRUCTION 🚨
The user mentioned "${bookingIntent.doctorName}" but this doctor is NOT in our database.
YOU MUST:
- Inform them that "${bookingIntent.doctorName}" is not available
- Ask if they'd like to see other available doctors
- Do NOT suggest a specific doctor unless they ask
- Be helpful but clear that the requested doctor is not found`;
        }
        
        // Combine system prompt with conversation history
        let fullPrompt = systemPrompt + '\n\nConversation History:\n';
        
        conversationHistory.slice(-10).forEach(msg => {
            fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
        
        fullPrompt += `\nUser: ${message}\nAssistant:`;

        // Call Mistral AI API with system prompt and conversation history
        let aiResponse = '';
        try {
            aiResponse = await generateChatCompletion(message, conversationHistory, systemPrompt, 'mistral-medium-latest');
        } catch (error) {
            console.error('Mistral AI Error:', error);
            // Fallback response
            aiResponse = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact our support team.";
        }
        
        // Post-process response to ensure correct doctor is mentioned
        if (selectedDoctor && bookingIntent.doctorName) {
            // Verify the response mentions the correct doctor
            const responseLower = aiResponse.toLowerCase();
            const correctDoctorLower = selectedDoctor.name.toLowerCase();
            
            // If response mentions wrong doctor, add correction
            if (!responseLower.includes(correctDoctorLower)) {
                console.log(`⚠️ AI response doesn't mention correct doctor. Adding correction.`);
                aiResponse = `I found ${selectedDoctor.name} for you! ${aiResponse}`;
            }
            
            // Remove mentions of wrong doctors if any
            for (const doctor of doctorsContext.doctors) {
                if (doctor.id !== selectedDoctor.id) {
                    const wrongDoctorLower = doctor.name.toLowerCase();
                    // If wrong doctor is mentioned, replace with correct one
                    if (responseLower.includes(wrongDoctorLower) && !responseLower.includes(correctDoctorLower)) {
                        aiResponse = aiResponse.replace(
                            new RegExp(doctor.name, 'gi'),
                            selectedDoctor.name
                        );
                    }
                }
            }
        }

        // Build response with structured data
        const responseData = {
            success: true,
            response: aiResponse,
            suggestedActions: [],
            timestamp: new Date().toISOString(),
            provider: 'Google Gemini (FREE)'
        };

        // Add booking actions if slots are available
        if (availableSlots && availableSlots.length > 0 && selectedDoctor) {
            responseData.bookingData = {
                doctorId: selectedDoctor.id,
                doctorName: selectedDoctor.name,
                specialty: selectedDoctor.speciality,
                fees: selectedDoctor.fees,
                availableSlots: availableSlots.slice(0, 3) // First 3 days
            };

            responseData.suggestedActions.push({
                type: 'show_slots',
                label: `View All Slots for ${selectedDoctor.name}`,
                action: 'show_slots',
                doctorId: selectedDoctor.id
            });

            responseData.suggestedActions.push({
                type: 'book_appointment',
                label: `Book with ${selectedDoctor.name}`,
                action: `navigate_to_doctor/${selectedDoctor.id}`
            });
        } else if (bookingIntent.doctorName && !selectedDoctor) {
            // Doctor mentioned but not found
            responseData.response += `\n\nI couldn't find "${bookingIntent.doctorName}" in our system. Would you like to see other available doctors?`;
            responseData.suggestedActions.push({
                type: 'view_doctors',
                label: 'View All Doctors',
                action: 'navigate_to_doctors'
            });
        } else {
            // General booking action
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
                responseData.suggestedActions.push({
                    type: 'book_appointment',
                    label: 'Browse Doctors',
                    action: 'navigate_to_doctors'
                });
            }

            // Specialty action
            if (bookingIntent.specialty) {
                responseData.suggestedActions.push({
                    type: 'view_specialty',
                    label: `View ${bookingIntent.specialty} Doctors`,
                    action: `navigate_to_specialty/${bookingIntent.specialty.toLowerCase().replace(' ', '-')}`
                });
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error('AI Chat Error:', error);
        
        if (error.message?.includes('API_KEY')) {
            return res.json({
                success: false,
                message: 'Gemini API key not configured.',
                fallbackResponse: "I apologize, but I'm having trouble processing your request right now. Please contact our support team."
            });
        }

        res.json({
            success: false,
            message: error.message,
            fallbackResponse: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."
        });
    }
};

// Get available slots for a doctor (API endpoint)
export const getDoctorSlots = async (req, res) => {
    try {
        const { docId } = req.query;

        if (!docId) {
            return res.json({ success: false, message: 'Doctor ID is required' });
        }

        const slots = await getAvailableSlots(docId, 7);
        const doctor = await doctorModel.findById(docId).select('name speciality fees');

        res.json({
            success: true,
            doctor: {
                id: doctor._id.toString(),
                name: doctor.name,
                speciality: doctor.speciality,
                fees: doctor.fees
            },
            availableSlots: slots
        });

    } catch (error) {
        console.error('Error fetching doctor slots:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's appointments for context (if logged in)
export const getUserAppointmentsContext = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: true, appointments: [] });
        }

        const appointments = await appointmentModel.find({ 
            userId, 
            cancelled: false,
            isCompleted: false 
        })
        .sort({ slotDate: 1, slotTime: 1 })
        .limit(5);

        res.json({
            success: true,
            appointments: appointments.map(apt => ({
                id: apt._id,
                doctorName: apt.docData?.name || 'Unknown',
                specialty: apt.docData?.speciality || 'Unknown',
                date: apt.slotDate,
                time: apt.slotTime,
                status: apt.status
            }))
        });

    } catch (error) {
        console.error('Error fetching user appointments:', error);
        res.json({ success: false, message: error.message });
    }
};
