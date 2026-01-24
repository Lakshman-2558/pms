/**
 * Medical Mode Handler
 * Handles medical queries with strict format:
 * - Simple Explanation
 * - Possible Causes
 * - Safe Over-the-Counter Medicines
 * - Home Remedies
 * - When to See a Doctor
 * - Disclaimer
 */

import { generateChatCompletion } from './mistralService.js';
import { getComprehensiveMedicalInfo } from './medicalKnowledgeBase.js';
import { formatMedicineWithLinks } from './medicineLinks.js';

/**
 * Handle Medical Mode queries
 * Returns formatted response following strict medical format
 */
export const handleMedicalMode = async (message, conversationHistory, intentClassification, doctorsContext, req, res) => {
    try {
        // Get medical information from knowledge base
        const medicalInfo = getComprehensiveMedicalInfo(
            intentClassification.detectedKeywords || [],
            message
        );

        // Create system prompt for medical mode
        const systemPrompt = `You are MediChain AI, the official medical assistant chatbot for the MediChain website.

Your primary goal:
✔ Give SIMPLE, SHORT answers (8th-class level)
✔ NO long paragraphs - use bullet points
✔ Keep each section BRIEF (1-2 sentences max)
✔ Highlight important info clearly
✔ NEVER provide harmful medical instructions
✔ Safety comes first

🩺 MEDICAL MODE FORMAT (STRICT - KEEP IT SHORT):

When the user asks ANY medical-related question, ALWAYS follow this EXACT format:

**Simple Explanation**
[ONE short sentence. Maximum 15-20 words. Simple language only.]

**Possible Causes**
• [Cause 1 - 5 words max]
• [Cause 2 - 5 words max]
• [Cause 3 - 5 words max]

**Safe Over-the-Counter Medicines**
[ONLY mild OTC meds. NO antibiotics. NO steroids. NO dosages.]
• [Medicine name] – [3-4 word purpose]
• [Medicine name] – [3-4 word purpose]

**Home Remedies**
• [Remedy 1 - 5 words max]
• [Remedy 2 - 5 words max]

**When to See a Doctor**
• [Condition 1 - 6 words max]
• [Condition 2 - 6 words max]

**Disclaimer**
"This is general information, not a medical diagnosis. Consult a certified doctor for proper care."

CRITICAL RULES:
- Keep EVERYTHING SHORT - no paragraphs
- Maximum 1 sentence per section
- Use simple words only
- Never give dosages
- Never mention antibiotics or steroids
- Always add the disclaimer
- Safety comes first`;

        // Create user prompt with medical knowledge base context
        const userPrompt = `User Question: "${message}"

Detected Medical Keywords: ${(intentClassification.detectedKeywords || []).join(', ') || 'general health concern'}

Medical Knowledge Base Information:
- Possible Conditions: ${medicalInfo.conditions.join(', ') || 'General health concern'}
- Precautions: ${medicalInfo.precautions.join('; ') || 'General precautions'}
- OTC Medicines (USE THESE SPECIFIC MEDICINES - DO NOT use generic Paracetamol/Ibuprofen unless listed): ${medicalInfo.otc_medicines?.join(', ') || 'None'}
- When to See Doctor: ${medicalInfo.when_to_see_doctor || 'If symptoms persist or worsen'}

CRITICAL: Use ONLY the medicines listed above. Do NOT suggest Paracetamol or Ibuprofen unless they are specifically listed in the OTC Medicines section above. Each condition has specific appropriate medicines - use them.

Please provide a response following the EXACT MEDICAL MODE FORMAT above. Keep it simple, safe, and easy to understand.`;

        // Generate response using Mistral AI
        let aiResponse = '';
        try {
            aiResponse = await generateChatCompletion(
                userPrompt,
                conversationHistory,
                systemPrompt,
                'mistral-medium-latest'
            );
        } catch (error) {
            console.error('Mistral AI Error in Medical Mode:', error);
            // Fallback response using knowledge base
            aiResponse = generateFallbackResponse(message, medicalInfo);
        }

        // Extract medicines from response and add purchase links
        const medicinesWithLinks = [];
        if (medicalInfo.otc_medicines && medicalInfo.otc_medicines.length > 0) {
            medicalInfo.otc_medicines.slice(0, 2).forEach(med => {
                medicinesWithLinks.push(formatMedicineWithLinks(med));
            });
        }

        // Return formatted response
        return res.json({
            success: true,
            response: aiResponse, // Changed from 'message' to 'response' to match frontend expectation
            mode: 'MEDICAL_MODE',
            medicalData: {
                detectedKeywords: intentClassification.detectedKeywords || [],
                source: 'Medical Knowledge Base (10 lakhs records)',
                medicines: medicinesWithLinks // Include medicines with purchase links
            }
        });

    } catch (error) {
        console.error('Error in Medical Mode Handler:', error);
        return res.status(500).json({
            success: false,
            message: 'I apologize, but I encountered an error processing your medical query. Please try again or consult a doctor directly.',
            mode: 'MEDICAL_MODE'
        });
    }
};

/**
 * Generate fallback response if AI fails
 */
const generateFallbackResponse = (message, medicalInfo) => {
    const lowerMessage = message.toLowerCase();
    
    let simpleExplanation = 'This is a common health concern that many people experience.';
    let causes = ['Stress or lifestyle factors', 'Minor infection or irritation', 'Temporary discomfort'];
    let otcMedicines = [];
    let homeRemedies = ['Rest and stay hydrated', 'Apply warm or cold compress as needed'];
    let whenToSeeDoctor = ['If symptoms persist for more than 3 days', 'If pain becomes severe', 'If you develop other symptoms'];

    // ALWAYS prioritize knowledge base medicines first
    if (medicalInfo.otc_medicines && medicalInfo.otc_medicines.length > 0) {
        otcMedicines = medicalInfo.otc_medicines.slice(0, 2).map(med => {
            // Add purpose based on medicine type
            if (med.toLowerCase().includes('antacid') || med.toLowerCase().includes('calcium')) {
                return `${med} – for acidity`;
            } else if (med.toLowerCase().includes('cough') || med.toLowerCase().includes('syrup')) {
                return `${med} – for cough`;
            } else if (med.toLowerCase().includes('nasal') || med.toLowerCase().includes('saline')) {
                return `${med} – for congestion`;
            } else if (med.toLowerCase().includes('antihistamine')) {
                return `${med} – for allergies`;
            } else if (med.toLowerCase().includes('simethicone')) {
                return `${med} – for gas`;
            } else if (med.toLowerCase().includes('calamine')) {
                return `${med} – for rash`;
            } else {
                return `${med} – for relief`;
            }
        });
    }

    // Basic symptom-based fallback ONLY if knowledge base has no medicines
    if (otcMedicines.length === 0) {
        if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
            simpleExplanation = 'Fever is your body\'s way of fighting off infections. It\'s usually not serious unless it\'s very high.';
            causes = ['Viral or bacterial infection', 'Common cold or flu', 'Inflammation'];
            otcMedicines = ['Paracetamol – to reduce fever'];
            homeRemedies = ['Drink plenty of water', 'Rest in a cool room', 'Use a damp cloth on forehead'];
            whenToSeeDoctor = ['If fever is above 102°F (39°C)', 'If fever lasts more than 3 days', 'If you have severe headache or body pain'];
        } else if (lowerMessage.includes('headache')) {
            simpleExplanation = 'Headaches are very common and usually not serious. They can be caused by many things.';
            causes = ['Tension or stress', 'Dehydration', 'Eye strain or lack of sleep'];
            otcMedicines = ['Paracetamol – for pain relief'];
            homeRemedies = ['Rest in a quiet, dark room', 'Apply cold or warm compress', 'Stay hydrated'];
            whenToSeeDoctor = ['If headache is very severe', 'If headache lasts more than 3 days', 'If you have vision changes or fever'];
        } else if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
            simpleExplanation = 'Cough and cold are common infections that usually go away on their own.';
            causes = ['Viral infection', 'Common cold virus', 'Seasonal changes'];
            otcMedicines = ['Cough syrup – to loosen mucus'];
            homeRemedies = ['Drink warm water with honey', 'Gargle with salt water', 'Get plenty of rest'];
            whenToSeeDoctor = ['If cough lasts more than 2 weeks', 'If you have difficulty breathing', 'If fever is high'];
        } else if (lowerMessage.includes('stomach') || lowerMessage.includes('abdominal')) {
            simpleExplanation = 'Stomach pain can happen for many reasons, most of which are not serious.';
            causes = ['Indigestion or gas', 'Food-related issues', 'Mild stomach infection'];
            otcMedicines = ['Antacid – for acidity and gas'];
            homeRemedies = ['Eat light, easy-to-digest food', 'Drink plenty of water', 'Avoid spicy or oily food'];
            whenToSeeDoctor = ['If pain is severe', 'If pain lasts more than 2 days', 'If you have vomiting or diarrhea'];
        }
    }

    // Use knowledge base data if available
    if (medicalInfo.conditions && medicalInfo.conditions.length > 0) {
        causes = medicalInfo.conditions.slice(0, 3);
    }
    if (medicalInfo.precautions && medicalInfo.precautions.length > 0) {
        homeRemedies = medicalInfo.precautions.slice(0, 2);
    }
    if (medicalInfo.when_to_see_doctor) {
        whenToSeeDoctor = [medicalInfo.when_to_see_doctor];
    }

    return `**Simple Explanation**
${simpleExplanation}

**Possible Causes**
${causes.map(c => `• ${c}`).join('\n')}

**Safe Over-the-Counter Medicines**
${otcMedicines.length > 0 ? otcMedicines.map(m => `• ${m}`).join('\n') : '• Consult a pharmacist for appropriate OTC medicine'}

**Home Remedies**
${homeRemedies.map(r => `• ${r}`).join('\n')}

**When to See a Doctor**
${whenToSeeDoctor.map(w => `• ${w}`).join('\n')}

**Disclaimer**
This is general information, not a medical diagnosis. Consult a certified doctor for proper care.`;
};

export default {
    handleMedicalMode
};

