/**
 * Medical Intent Classification System
 * Classifies user queries into: MEDICAL_MODE or NORMAL_MODE
 */

// Medical-related keywords (symptoms, diseases, medicines, treatments, etc.)
const MEDICAL_KEYWORDS = [
    // Symptoms
    'fever', 'pain', 'headache', 'vomiting', 'dizziness', 'cough', 'cold', 'infection',
    'ache', 'sore', 'hurt', 'hurting', 'hurts', 'sick', 'ill', 'unwell',
    'nausea', 'diarrhea', 'constipation', 'rash', 'itchy', 'fatigue', 'tired',
    'weakness', 'dizzy', 'numbness', 'tingling', 'burning', 'stinging',
    'stomach ache', 'stomach pain', 'abdominal pain', 'back pain', 'neck pain',
    'joint pain', 'chest pain', 'throat pain', 'ear pain', 'eye pain',
    'body pain', 'body ache', 'muscle pain', 'bone pain',
    
    // Diseases/Conditions
    'disease', 'condition', 'disorder', 'syndrome', 'infection', 'virus', 'bacteria',
    'diabetes', 'hypertension', 'asthma', 'allergy', 'allergic', 'flu', 'influenza',
    
    // Medicines/Treatments
    'medicine', 'medication', 'tablet', 'pill', 'syrup', 'capsule', 'drug',
    'treatment', 'remedy', 'cure', 'therapy', 'prescription',
    'can i take', 'should i take', 'what tablet', 'what medicine',
    
    // Health concerns
    'first aid', 'emergency', 'health', 'medical', 'doctor', 'clinic', 'hospital',
    'diagnosis', 'symptom', 'symptoms', 'signs', 'warning',
    
    // Body parts (when mentioned in health context)
    'heart', 'lungs', 'liver', 'kidney', 'stomach', 'head', 'chest', 'back'
];

/**
 * Classify user intent - MEDICAL_MODE or NORMAL_MODE
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Object} - Classification result
 */
export const classifyIntent = (message, conversationHistory = []) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check conversation history for context
    const recentContext = conversationHistory
        .slice(-3)
        .map(msg => msg.content?.toLowerCase() || '')
        .join(' ');
    
    const fullContext = `${recentContext} ${lowerMessage}`.toLowerCase();
    
    // Check if message contains any medical-related keywords
    const hasMedicalKeyword = MEDICAL_KEYWORDS.some(keyword => 
        fullContext.includes(keyword.toLowerCase())
    );
    
    // Check for medical question patterns
    const medicalQuestionPatterns = [
        /what (medicine|tablet|pill|syrup)/i,
        /can i take/i,
        /should i take/i,
        /how to treat/i,
        /how to cure/i,
        /what causes/i,
        /why do i have/i,
        /is (this|it) (normal|serious|dangerous)/i
    ];
    
    const hasMedicalPattern = medicalQuestionPatterns.some(pattern => 
        pattern.test(lowerMessage)
    );
    
    // If 50-50 unsure, default to NORMAL_MODE (safer)
    if (hasMedicalKeyword || hasMedicalPattern) {
        return {
            intent: 'MEDICAL_MODE',
            confidence: hasMedicalKeyword && hasMedicalPattern ? 'high' : 'medium',
            detectedKeywords: MEDICAL_KEYWORDS.filter(k => fullContext.includes(k.toLowerCase()))
        };
    }
    
    // Default to NORMAL_MODE
    return {
        intent: 'NORMAL_MODE',
        confidence: 'high',
        detectedKeywords: []
    };
};

export default {
    classifyIntent
};

