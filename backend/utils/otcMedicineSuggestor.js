/**
 * OTC Medicine Suggestion System
 * Provides safe over-the-counter medicine recommendations for minor issues
 */

// OTC Medicine database
const OTC_MEDICINES = {
    fever: ['Paracetamol 500mg', 'Crocin'],
    cold: ['Paracetamol 500mg', 'Vicks Vaporub'],
    cough: ['Cough Syrup (Dextromethorphan)', 'Honey with warm water'],
    headache: ['Paracetamol 500mg', 'Ibuprofen 400mg'],
    'body pain': ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Pain Relief Balm'],
    'body ache': ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Pain Relief Balm'],
    'hand pain': ['Ibuprofen 400mg', 'Pain Relief Balm', 'Hot/Cold Compress'],
    'leg pain': ['Ibuprofen 400mg', 'Pain Relief Balm', 'Hot/Cold Compress'],
    'arm pain': ['Ibuprofen 400mg', 'Pain Relief Balm', 'Hot/Cold Compress'],
    'foot pain': ['Ibuprofen 400mg', 'Pain Relief Balm', 'Rest and Elevation'],
    'knee pain': ['Ibuprofen 400mg', 'Pain Relief Balm', 'Rest and Ice'],
    'stomach ache': ['Antacid (Calcium Carbonate)', 'Digestive Enzymes'],
    'stomach pain': ['Antacid (Calcium Carbonate)', 'Digestive Enzymes'],
    'abdominal pain': ['Antacid (Calcium Carbonate)', 'Warm Water'],
    acidity: ['Antacid (Calcium Carbonate)', 'Omeprazole 20mg'],
    gas: ['Simethicone', 'Antacid (Calcium Carbonate)'],
    'sore throat': ['Gargle with Warm Salt Water', 'Throat Lozenges', 'Honey'],
    'throat pain': ['Gargle with Warm Salt Water', 'Throat Lozenges', 'Honey'],
    'mild dizziness': ['Rest', 'Hydration (ORS)', 'Ginger Tea'],
    dizzy: ['Rest', 'Hydration (ORS)', 'Ginger Tea'],
    'skin rash': ['Calamine Lotion', 'Antihistamine Cream', 'Aloe Vera Gel'],
    rash: ['Calamine Lotion', 'Antihistamine Cream', 'Aloe Vera Gel'],
    itchy: ['Calamine Lotion', 'Antihistamine Cream'],
    fatigue: ['Multivitamin', 'Hydration', 'Rest'],
    tired: ['Multivitamin', 'Hydration', 'Rest'],
    weakness: ['Multivitamin', 'Hydration', 'ORS'],
    'runny nose': ['Nasal Saline Drops', 'Steam Inhalation'],
    'nasal congestion': ['Nasal Saline Drops', 'Steam Inhalation', 'Vicks Vaporub'],
    sneezing: ['Antihistamine', 'Nasal Saline Drops'],
    'mild nausea': ['Ginger Tea', 'Peppermint', 'Rest'],
    'mild pain': ['Paracetamol 500mg', 'Ibuprofen 400mg'],
    ache: ['Paracetamol 500mg', 'Ibuprofen 400mg'],
    'back pain': ['Ibuprofen 400mg', 'Pain Relief Balm', 'Hot Compress'],
    'neck pain': ['Ibuprofen 400mg', 'Pain Relief Balm', 'Hot Compress'],
    'joint pain': ['Ibuprofen 400mg', 'Pain Relief Balm', 'Rest'],
    indigestion: ['Antacid (Calcium Carbonate)', 'Digestive Enzymes'],
    constipation: ['Fiber Supplements', 'Prune Juice', 'Warm Water'],
    'mild diarrhea': ['ORS (Oral Rehydration Solution)', 'Probiotics'],
    bloating: ['Simethicone', 'Antacid (Calcium Carbonate)']
};

/**
 * Get OTC medicine suggestions based on symptoms
 * @param {Array} symptoms - Detected symptom keywords
 * @param {string} message - User message for context
 * @returns {Array} - Array of suggested OTC medicines (max 2)
 */
export const suggestOTCMedicines = (symptoms = [], message = '') => {
    const suggestions = new Set();
    const lowerMessage = message.toLowerCase();
    
    // Match symptoms to medicines
    symptoms.forEach(symptom => {
        const symptomKey = symptom.toLowerCase();
        const medicines = OTC_MEDICINES[symptomKey];
        
        if (medicines) {
            medicines.forEach(medicine => {
                if (suggestions.size < 2) {
                    suggestions.add(medicine);
                }
            });
        }
    });
    
    // If no specific match, try generic matching
    if (suggestions.size === 0) {
        if (lowerMessage.includes('fever') || lowerMessage.includes('cold')) {
            suggestions.add('Paracetamol 500mg');
        }
        if (lowerMessage.includes('pain') || lowerMessage.includes('ache')) {
            suggestions.add('Paracetamol 500mg');
            if (suggestions.size < 2) {
                suggestions.add('Ibuprofen 400mg');
            }
        }
        if (lowerMessage.includes('stomach') || lowerMessage.includes('acidity')) {
            suggestions.add('Antacid (Calcium Carbonate)');
        }
    }
    
    // Convert to array and limit to 2
    return Array.from(suggestions).slice(0, 2);
};

/**
 * Generate safe medicine disclaimer
 * @returns {string}
 */
export const getMedicineDisclaimer = () => {
    return 'Please consult a doctor if symptoms persist for more than 3 days or worsen.';
};

export default {
    suggestOTCMedicines,
    getMedicineDisclaimer,
    OTC_MEDICINES
};

