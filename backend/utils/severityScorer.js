/**
 * Severity Scoring System
 * Determines severity level for medical symptoms
 */

/**
 * Calculate severity score for minor medical issues
 * @param {string} message - User message describing symptoms
 * @param {Array} detectedSymptoms - Detected symptom keywords
 * @returns {string} - Severity level: 'Low' | 'Mild' | 'Moderate'
 */
export const scoreMinorSeverity = (message, detectedSymptoms = []) => {
    const lowerMessage = message.toLowerCase();
    
    // Intensity indicators
    const highIntensityWords = ['severe', 'very', 'extremely', 'intense', 'unbearable', 
                                'excruciating', 'terrible', 'awful', 'bad', 'worst'];
    const moderateIntensityWords = ['moderate', 'noticeable', 'some', 'quite', 'pretty'];
    const lowIntensityWords = ['mild', 'slight', 'little', 'bit', 'minor', 'small'];
    
    // Duration indicators
    const longDurationWords = ['days', 'week', 'weeks', 'long time', 'persistent', 'chronic'];
    const shortDurationWords = ['just', 'recent', 'today', 'few hours', 'moment'];
    
    // Frequency indicators
    const frequentWords = ['always', 'constantly', 'continuous', 'non-stop', 'all the time'];
    const occasionalWords = ['sometimes', 'occasionally', 'once in a while', 'rarely'];
    
    let score = 0;
    
    // Check intensity
    const hasHighIntensity = highIntensityWords.some(word => lowerMessage.includes(word));
    const hasModerateIntensity = moderateIntensityWords.some(word => lowerMessage.includes(word));
    const hasLowIntensity = lowIntensityWords.some(word => lowerMessage.includes(word));
    
    if (hasHighIntensity) score += 3;
    else if (hasModerateIntensity) score += 2;
    else if (hasLowIntensity) score += 1;
    
    // Check duration
    const hasLongDuration = longDurationWords.some(word => lowerMessage.includes(word));
    const hasShortDuration = shortDurationWords.some(word => lowerMessage.includes(word));
    
    if (hasLongDuration) score += 2;
    else if (hasShortDuration) score -= 1;
    
    // Check frequency
    const hasFrequent = frequentWords.some(word => lowerMessage.includes(word));
    const hasOccasional = occasionalWords.some(word => lowerMessage.includes(word));
    
    if (hasFrequent) score += 1;
    else if (hasOccasional) score -= 1;
    
    // Multiple symptoms increase severity
    if (detectedSymptoms.length > 2) score += 1;
    
    // Determine severity level
    if (score >= 4) return 'Moderate';
    if (score >= 2) return 'Mild';
    return 'Low';
};

/**
 * Determine severity for major medical emergencies
 * @param {string} message - User message
 * @param {string} followUpResponse - Follow-up information if available
 * @returns {string} - Severity level: 'High' | 'Critical'
 */
export const scoreMajorSeverity = (message, followUpResponse = '') => {
    const combinedMessage = `${message} ${followUpResponse}`.toLowerCase();
    
    // Critical indicators
    const criticalIndicators = [
        'unconscious', 'unresponsive', 'coma', 'not breathing',
        'severe bleeding', 'heavy bleeding', 'blood loss',
        'heart attack', 'cardiac arrest', 'chest pain',
        'stroke', 'paralysis', 'seizure', 'fit',
        'anaphylaxis', 'severe allergic', 'poisoning', 'overdose'
    ];
    
    // High severity indicators
    const highIndicators = [
        'shortness of breath', 'breathing difficulty', 'can\'t breathe',
        'severe pain', 'excruciating', 'very high fever',
        'severe dehydration', 'severe abdominal pain'
    ];
    
    const hasCritical = criticalIndicators.some(indicator => combinedMessage.includes(indicator));
    const hasHigh = highIndicators.some(indicator => combinedMessage.includes(indicator));
    
    if (hasCritical) return 'Critical';
    if (hasHigh) return 'High';
    
    // Default to High for major symptoms
    return 'High';
};

export default {
    scoreMinorSeverity,
    scoreMajorSeverity
};

