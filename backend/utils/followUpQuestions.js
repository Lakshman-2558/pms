/**
 * Follow-up Question Engine
 * Generates appropriate follow-up questions for major medical emergencies
 */

/**
 * Generate follow-up question based on detected symptoms
 * @param {Array} symptoms - Detected major symptoms
 * @param {string} message - Original user message
 * @returns {Object} - Follow-up question object
 */
export const generateFollowUpQuestion = (symptoms = [], message = '') => {
    const lowerMessage = message.toLowerCase();
    
    // Chest pain / Heart-related
    if (symptoms.some(s => ['chest pain', 'heart', 'cardiac'].includes(s.toLowerCase()))) {
        return {
            question: "How severe is the chest pain on a scale of 1-10? Are you experiencing any shortness of breath, sweating, or pain radiating to your arm or jaw?",
            type: "chest_pain",
            priority: "critical"
        };
    }
    
    // Breathing difficulty
    if (symptoms.some(s => ['breathing', 'breathlessness', 'can\'t breathe'].includes(s.toLowerCase()))) {
        return {
            question: "How long have you been experiencing breathing difficulty? Are you able to speak in full sentences? Is your breathing getting worse?",
            type: "breathing",
            priority: "critical"
        };
    }
    
    // Seizure / Fit
    if (symptoms.some(s => ['seizure', 'fit', 'convulsion'].includes(s.toLowerCase()))) {
        return {
            question: "Is the person currently having a seizure? How long did it last? Have they regained consciousness?",
            type: "seizure",
            priority: "critical"
        };
    }
    
    // Stroke symptoms
    if (symptoms.some(s => ['stroke', 'paralysis', 'numbness', 'face drooping'].includes(s.toLowerCase()))) {
        return {
            question: "When did the symptoms start? Can you smile symmetrically? Can you raise both arms equally? Is your speech clear?",
            type: "stroke",
            priority: "critical"
        };
    }
    
    // Severe bleeding
    if (symptoms.some(s => ['bleeding', 'blood loss'].includes(s.toLowerCase()))) {
        return {
            question: "How severe is the bleeding? Is it continuous or has it stopped? Are you feeling dizzy or lightheaded?",
            type: "bleeding",
            priority: "critical"
        };
    }
    
    // Loss of consciousness
    if (symptoms.some(s => ['unconscious', 'unresponsive', 'fainted', 'coma'].includes(s.toLowerCase()))) {
        return {
            question: "Is the person conscious now? How long were they unconscious? Are they breathing normally?",
            type: "consciousness",
            priority: "critical"
        };
    }
    
    // High fever
    if (symptoms.some(s => ['fever', 'high temperature'].includes(s.toLowerCase())) && 
        (lowerMessage.includes('very high') || lowerMessage.includes('above 104'))) {
        return {
            question: "What is your current body temperature? How long have you had this fever? Are you experiencing any other symptoms like severe headache or body pain?",
            type: "fever",
            priority: "high"
        };
    }
    
    // Severe abdominal pain
    if (symptoms.some(s => ['abdominal pain', 'stomach pain'].includes(s.toLowerCase())) && 
        lowerMessage.includes('severe')) {
        return {
            question: "How severe is the abdominal pain on a scale of 1-10? Where exactly is the pain located? Are you experiencing any vomiting, fever, or blood in stool?",
            type: "abdominal",
            priority: "high"
        };
    }
    
    // Allergic reaction
    if (symptoms.some(s => ['allergic', 'anaphylaxis'].includes(s.toLowerCase()))) {
        return {
            question: "What triggered the allergic reaction? Are you experiencing difficulty breathing, swelling of face/throat, or hives?",
            type: "allergy",
            priority: "critical"
        };
    }
    
    // Poisoning / Overdose
    if (symptoms.some(s => ['poisoning', 'overdose'].includes(s.toLowerCase()))) {
        return {
            question: "What substance was ingested? When did this happen? Are you experiencing any symptoms like nausea, vomiting, or confusion?",
            type: "poisoning",
            priority: "critical"
        };
    }
    
    // Default follow-up for major symptoms
    return {
        question: "How long have you been experiencing these symptoms? On a scale of 1-10, how severe is your condition? Are there any other symptoms you're experiencing?",
        type: "general",
        priority: "high"
    };
};

/**
 * Check if follow-up response is sufficient
 * @param {string} followUpResponse - User's response to follow-up question
 * @returns {boolean}
 */
export const isFollowUpSufficient = (followUpResponse = '') => {
    const response = followUpResponse.toLowerCase();
    
    // Check if response contains useful information
    const hasDuration = /\d+\s*(hour|day|minute|week)/i.test(response);
    const hasSeverity = /\d+\s*(out of 10|scale|rating)/i.test(response) || 
                       ['severe', 'mild', 'moderate', 'high', 'low'].some(word => response.includes(word));
    const hasDetails = response.length > 20; // Substantial response
    
    return hasDuration || hasSeverity || hasDetails;
};

export default {
    generateFollowUpQuestion,
    isFollowUpSufficient
};

