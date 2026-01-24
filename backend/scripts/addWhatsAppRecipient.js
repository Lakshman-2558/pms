/**
 * Script to add recipients to Meta WhatsApp Business Account
 * This uses the Meta Graph API to add recipients programmatically
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID

/**
 * Add recipient to Meta WhatsApp Business Account
 */
async function addRecipient(phoneNumber) {
    try {
        if (!WHATSAPP_ACCESS_TOKEN) {
            console.error('❌ WHATSAPP_ACCESS_TOKEN not found in .env')
            console.log('\n💡 Please add to backend/.env:')
            console.log('   WHATSAPP_ACCESS_TOKEN=your_access_token_here')
            return
        }

        if (!WHATSAPP_PHONE_NUMBER_ID && !WHATSAPP_BUSINESS_ACCOUNT_ID) {
            console.error('❌ WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_BUSINESS_ACCOUNT_ID not found in .env')
            console.log('\n💡 Please add to backend/.env:')
            console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here')
            console.log('   OR')
            console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here')
            return
        }

        // Clean phone number (remove all non-digits)
        const cleanPhone = phoneNumber.replace(/\D/g, '')
        
        // Ensure phone number starts with country code
        // Format: 919876543210 (no + sign for Meta API)
        const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`

        console.log('\n📱 Adding Recipient to Meta WhatsApp...')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`Phone Number: ${formattedPhone}`)
        console.log(`Phone Number ID: ${WHATSAPP_PHONE_NUMBER_ID || 'N/A'}`)
        console.log(`Business Account ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID || 'N/A'}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

        // Add via Business Account ID using test_message_phone_numbers endpoint
        if (WHATSAPP_BUSINESS_ACCOUNT_ID) {
            try {
                const url = `https://graph.facebook.com/v18.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/test_message_phone_numbers`
                
                console.log('📤 Attempting to add recipient via Business Account ID...')
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone_number: formattedPhone
                    })
                })

                const data = await response.json()

                if (response.ok) {
                    console.log('✅ Recipient added successfully!')
                    console.log(`   Phone Number: ${formattedPhone}`)
                    console.log(`   Response: ${JSON.stringify(data)}`)
                    return { success: true, data }
                } else {
                    console.error('❌ Failed to add recipient')
                    console.error(`   Error: ${data.error?.message || JSON.stringify(data)}`)
                    console.error(`   Error Code: ${data.error?.code || 'N/A'}`)
                    console.error(`   Error Type: ${data.error?.type || 'N/A'}`)
                    
                    if (data.error?.code === 131030) {
                        console.log('\n💡 This error means:')
                        console.log('   - Recipient phone number not in allowed list')
                        console.log('   - For test numbers, you need to add recipients manually in Meta dashboard')
                        console.log('   - OR complete business verification to send to any number')
                    }
                    
                    return { success: false, error: data.error }
                }
            } catch (error) {
                console.error('❌ Error adding recipient:', error.message)
                return { success: false, error: error.message }
            }
        }

        console.error('❌ Could not add recipient - WHATSAPP_BUSINESS_ACCOUNT_ID not found')
        console.log('\n💡 Please add to backend/.env:')
        console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here')
        return { success: false, error: 'WHATSAPP_BUSINESS_ACCOUNT_ID not found' }

    } catch (error) {
        console.error('❌ Error:', error.message)
        return { success: false, error: error.message }
    }
}

// Main execution
const phoneNumber = process.argv[2]

if (!phoneNumber) {
    console.log('\n📱 Add WhatsApp Recipient Script')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nUsage:')
    console.log('  node scripts/addWhatsAppRecipient.js <phone_number>')
    console.log('\nExample:')
    console.log('  node scripts/addWhatsAppRecipient.js 919876543210')
    console.log('  node scripts/addWhatsAppRecipient.js 9876543210')
    console.log('\nNote:')
    console.log('  - Phone number will be formatted with country code 91')
    console.log('  - Format: 919876543210 (no + sign, no spaces)')
    console.log('\n')
    process.exit(1)
}

addRecipient(phoneNumber)
    .then(result => {
        if (result && result.success) {
            console.log('\n✅ Done! Recipient added successfully.')
            console.log('   Wait 1-2 minutes, then test with: npm run test-whatsapp\n')
            process.exit(0)
        } else {
            console.log('\n❌ Failed to add recipient.')
            console.log('   Check the error message above for details.\n')
            process.exit(1)
        }
    })
    .catch(error => {
        console.error('\n❌ Unexpected error:', error)
        process.exit(1)
    })

