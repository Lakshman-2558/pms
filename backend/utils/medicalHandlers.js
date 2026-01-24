/**
 * Medical Chatbot Handlers
 * Handles three modes: Normal Query, Minor Medical, Major Medical
 */

import { generateStructuredResponse } from './mistralService.js';
import { scoreMinorSeverity, scoreMajorSeverity } from './severityScorer.js';
import { suggestOTCMedicines, getMedicineDisclaimer } from './otcMedicineSuggestor.js';
import { generateFollowUpQuestion } from './followUpQuestions.js';
import { getComprehensiveMedicalInfo } from './medicalKnowledgeBase.js';
// extractBookingIntent is used internally in the main controller

/**
 * Handle Normal Query Mode (Non-medical)
 */
export const handleNormalQuery = async (message, conversationHistory, doctorsContext, req, res) => {
    // Use existing normal query logic from original controller
    // This will be handled by the existing code path
    return null; // Signal to continue with existing logic
};

/**
 * Handle Minor Medical Mode
 * Returns immediate JSON response with analysis
 */
export const handleMinorMedical = async (message, conversationHistory, intentClassification, doctorsContext, req, res) => {
    try {
        // Get medical information from knowledge base (10 lakhs records)
        const medicalInfo = getComprehensiveMedicalInfo(
            intentClassification.detectedSymptoms || [],
            message
        );
        
        // Calculate severity
        const severity = scoreMinorSeverity(message, intentClassification.detectedSymptoms || []);
        
        // Get OTC medicine suggestions (combine knowledge base + suggestion logic)
        const kbMedicines = medicalInfo.otc_medicines || [];
        const suggestedMedicines = suggestOTCMedicines(intentClassification.detectedSymptoms || [], message);
        const otcMedicines = [...new Set([...kbMedicines, ...suggestedMedicines])].slice(0, 2);
        
        // Generate analysis using Mistral AI with knowledge base context
        const analysisPrompt = `You are a medical assistant with access to a comprehensive medical knowledge base of 10 lakhs records. Analyze this minor medical symptom description using the provided medical information.

User message: "${message}"
Detected symptoms: ${(intentClassification.detectedSymptoms || []).join(', ') || 'general discomfort'}

Medical Knowledge Base Information:
- Possible Conditions: ${medicalInfo.conditions.join(', ')}
- Precautions: ${medicalInfo.precautions.join('; ')}
- When to see doctor: ${medicalInfo.when_to_see_doctor}

Provide a concise analysis in JSON format:
{
  "analysis": "<brief 2-3 sentence analysis based on medical knowledge base>",
  "possible_conditions": ${JSON.stringify(medicalInfo.conditions)},
  "precautions": ${JSON.stringify(medicalInfo.precautions)}
}

Respond ONLY with valid JSON, no additional text.`;

        let analysisData = {};
        
        try {
            // Use Mistral AI with structured JSON response
            analysisData = await generateStructuredResponse(analysisPrompt);
        } catch (aiError) {
            console.error('Mistral API Error:', aiError);
            // Use knowledge base data directly as fallback
            analysisData = {
                analysis: `Based on our medical knowledge base of 10 lakhs records, your symptoms (${(intentClassification.detectedSymptoms || []).slice(0, 3).join(', ') || 'general discomfort'}) suggest ${medicalInfo.conditions[0] || 'a common condition'}. This can often be managed with self-care and over-the-counter medications.`,
                possible_conditions: medicalInfo.conditions,
                precautions: medicalInfo.precautions
            };
        }
        
        // Build structured JSON response
        const medicalResponse = {
            analysis: analysisData.analysis || `Based on your symptoms, this appears to be a minor health concern.`,
            severity: severity,
            possible_conditions: analysisData.possible_conditions || ['Common condition', 'Minor ailment'],
            precautions: analysisData.precautions || [
                'Rest and stay hydrated',
                'Monitor symptoms',
                'Consult doctor if symptoms persist'
            ],
            suggested_medicines: otcMedicines,
            follow_up: severity === 'Moderate' ? 'How long have you been experiencing these symptoms?' : null
        };
        
        // Format response text for display
        const responseText = `Based on your symptoms, here's my analysis from our medical knowledge base (10 lakhs records):

**Analysis:** ${medicalResponse.analysis}

**Severity:** ${medicalResponse.severity}

**Possible Conditions (from knowledge base):**
${medicalResponse.possible_conditions.map(c => `• ${c}`).join('\n')}

**Precautions (from knowledge base):**
${medicalResponse.precautions.map(p => `• ${p}`).join('\n')}

${otcMedicines.length > 0 ? `**Suggested OTC Medicines (from knowledge base):**\n${otcMedicines.map(m => `• ${m}`).join('\n')}\n\n${getMedicineDisclaimer()}` : ''}

📚 *This information is retrieved from our comprehensive medical knowledge base containing 10 lakhs medical records.*

⚕️ **Disclaimer:** This is general health information, not a medical diagnosis. Consult a healthcare professional for proper evaluation.`;

        return res.json({
            success: true,
            response: responseText,
            medicalData: medicalResponse,
            suggestedActions: [{
                type: 'view_doctors',
                label: 'Consult a Doctor',
                action: 'navigate_to_doctors'
            }],
            timestamp: new Date().toISOString(),
            provider: 'MediChain+ Medical AI'
        });
        
    } catch (error) {
        console.error('Minor Medical Handler Error:', error);
        throw error;
    }
};

/**
 * Handle Major Medical Follow-up (First Response)
 * Asks critical follow-up questions
 */
export const handleMajorMedicalFollowUp = async (message, conversationHistory, intentClassification, doctorsContext, req, res) => {
    try {
        const followUp = generateFollowUpQuestion(intentClassification.detectedSymptoms, message);
        
        const responseText = `🚨 **IMPORTANT: This appears to be a serious medical concern.**

${followUp.question}

Please provide these details so I can give you appropriate guidance.`;

        return res.json({
            success: true,
            response: responseText,
            medicalData: {
                follow_up: followUp.question,
                status: 'awaiting_details',
                severity: 'High',
                type: followUp.type
            },
            suggestedActions: [{
                type: 'emergency',
                label: 'Call Emergency Services',
                action: 'emergency'
            }],
            timestamp: new Date().toISOString(),
            provider: 'MediChain+ Medical AI'
        });
        
    } catch (error) {
        console.error('Major Medical Follow-up Handler Error:', error);
        throw error;
    }
};

/**
 * Handle Major Medical Final Analysis (After Follow-up)
 * Returns final structured analysis
 */
export const handleMajorMedicalFinal = async (message, conversationHistory, intentClassification, doctorsContext, req, res) => {
    try {
        // Get original symptom message from history
        const originalMessage = conversationHistory
            .slice()
            .reverse()
            .find(msg => msg.role === 'user')?.content || message;
        
        const combinedMessage = `${originalMessage} ${message}`;
        const severity = scoreMajorSeverity(originalMessage, message);
        
        // Search knowledge base for emergency information
        const emergencyInfo = getComprehensiveMedicalInfo(
            intentClassification.detectedSymptoms || [],
            combinedMessage
        );
        
        // Generate final analysis using Mistral AI with knowledge base
        const analysisPrompt = `You are a medical assistant with access to a comprehensive medical knowledge base of 10 lakhs records analyzing a serious medical emergency.

Original symptoms: "${originalMessage}"
Follow-up information: "${message}"
Detected symptoms: ${(intentClassification.detectedSymptoms || []).join(', ')}

Medical Knowledge Base Information:
- Possible Conditions: ${emergencyInfo.conditions.join(', ')}
- Severity: ${severity}

Provide a concise high-risk analysis in JSON format:
{
  "analysis": "<brief high-risk summary - 2-3 sentences based on medical knowledge base>",
  "possible_conditions": ${JSON.stringify(emergencyInfo.conditions.length > 0 ? emergencyInfo.conditions : ['Serious medical condition', 'Emergency situation'])},
  "precautions": [
    "Do not self-medicate",
    "Seek emergency medical care immediately",
    "Do not delay seeking professional help"
  ]
}

Respond ONLY with valid JSON, no additional text.`;

        let analysisData = {};
        
        try {
            // Use Mistral AI with structured JSON response
            analysisData = await generateStructuredResponse(analysisPrompt);
        } catch (aiError) {
            console.error('Mistral API Error:', aiError);
            // Use knowledge base data directly as fallback
            analysisData = {
                analysis: `Based on our medical knowledge base, your symptoms indicate a serious medical condition that requires immediate medical attention.`,
                possible_conditions: emergencyInfo.conditions.length > 0 ? emergencyInfo.conditions : ['Serious medical condition', 'Emergency situation'],
                precautions: [
                    'Do not self-medicate',
                    'Seek emergency medical care immediately',
                    'Do not delay seeking professional help'
                ]
            };
        }
        
        // Build final response
        const medicalResponse = {
            analysis: analysisData.analysis,
            severity: severity,
            possible_conditions: analysisData.possible_conditions || [],
            precautions: analysisData.precautions || [
                'Do not self-medicate',
                'Seek emergency medical care immediately'
            ],
            suggested_medicines: [], // NO medicines for emergencies
            follow_up: 'Have you contacted emergency services or a healthcare provider?'
        };
        
        const responseText = `🚨 **CRITICAL MEDICAL ALERT**

**Analysis (from medical knowledge base):** ${medicalResponse.analysis}

**Severity:** ${medicalResponse.severity}

**Possible Conditions (from knowledge base of 10 lakhs records):**
${medicalResponse.possible_conditions.map(c => `• ${c}`).join('\n')}

**⚠️ CRITICAL PRECAUTIONS (from knowledge base):**
${medicalResponse.precautions.map(p => `• ${p}`).join('\n')}

**🚨 IMMEDIATE ACTION REQUIRED:**
• Do NOT self-medicate
• Seek emergency medical care immediately
• Call emergency services if symptoms are severe
• Do not delay professional medical evaluation

📚 *This analysis is based on our comprehensive medical knowledge base containing 10 lakhs medical records.*

⚕️ **This is NOT a substitute for professional medical care. Please consult a healthcare provider immediately.**`;

        return res.json({
            success: true,
            response: responseText,
            medicalData: medicalResponse,
            suggestedActions: [
                {
                    type: 'emergency',
                    label: 'Call Emergency Services',
                    action: 'emergency'
                },
                {
                    type: 'view_doctors',
                    label: 'Find Emergency Care',
                    action: 'navigate_to_doctors'
                }
            ],
            timestamp: new Date().toISOString(),
            provider: 'MediChain+ Medical AI'
        });
        
    } catch (error) {
        console.error('Major Medical Final Handler Error:', error);
        throw error;
    }
};

