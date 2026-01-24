/**
 * Mistral AI Service
 * Handles all Mistral AI API calls
 */

import { Mistral } from '@mistralai/mistralai';

// Initialize Mistral AI client
const mistralClient = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY || 'yTXgl26YgEUx0NeDkgQPlRHL7TmClmMy'
});

/**
 * Generate chat completion using Mistral AI
 * @param {string} prompt - The prompt to send
 * @param {Array} conversationHistory - Previous conversation messages
 * @param {string} model - Model to use (default: mistral-medium-latest)
 * @returns {Promise<string>} - Generated response
 */
export const generateChatCompletion = async (userMessage, conversationHistory = [], systemPrompt = '', model = 'mistral-medium-latest') => {
    try {
        // Format messages for Mistral
        const messages = [];
        
        // Add system prompt if provided
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }
        
        // Add conversation history
        conversationHistory
            .slice(-10) // Last 10 messages
            .forEach(msg => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });

        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage
        });

        const chatResponse = await mistralClient.chat.complete({
            model: model,
            messages: messages,
            temperature: 0.7,
            maxTokens: 2000
        });

        // Mistral API response structure: chatResponse.choices[0].message.content
        const responseContent = chatResponse.choices?.[0]?.message?.content || 
                               'I apologize, but I could not generate a response.';
        
        return responseContent;
    } catch (error) {
        console.error('Mistral AI Error:', error);
        throw error;
    }
};

/**
 * Generate structured JSON response using Mistral AI
 * @param {string} prompt - The prompt with JSON format instructions
 * @param {string} model - Model to use
 * @returns {Promise<Object>} - Parsed JSON object
 */
export const generateStructuredResponse = async (prompt, model = 'mistral-medium-latest') => {
    try {
        // Mistral API doesn't support responseFormat parameter in the same way
        // We'll use a more explicit prompt and parse the response
        const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or additional text. Just the JSON object.`;
        
        const chatResponse = await mistralClient.chat.complete({
            model: model,
            messages: [{
                role: 'user',
                content: jsonPrompt
            }],
            temperature: 0.3, // Lower temperature for more consistent structured output
            maxTokens: 1500
        });

        const responseText = chatResponse.choices[0]?.message?.content || '{}';
        
        // Try to parse JSON
        try {
            return JSON.parse(responseText);
        } catch (e) {
            // If parsing fails, try to extract JSON from markdown code blocks
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                             responseText.match(/```\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }
            throw new Error('Failed to parse JSON response');
        }
    } catch (error) {
        console.error('Mistral Structured Response Error:', error);
        throw error;
    }
};

export default {
    generateChatCompletion,
    generateStructuredResponse,
    mistralClient
};

