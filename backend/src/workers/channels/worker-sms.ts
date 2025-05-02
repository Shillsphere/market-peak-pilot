import { Job } from 'bullmq';
import { supabase } from '../../lib/supabase.js';
import twilio from 'twilio';

// Define the shape of SMS job data
interface SMSJobData {
  jobId: string;
  businessId: string;
  contentId: string;
  text: string;
  credentials: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
    // Any other Twilio-specific credentials
  };
  payload: {
    recipients?: string[];
    // Any other SMS-specific payload
  };
}

// Define the result interface
interface SMSJobResult {
  success: boolean;
  batchId?: string;
  messageCount?: number;
  error?: string;
}

/**
 * Process an SMS distribution job using Twilio
 * Full implementation for Day 3
 */
export async function processSMSJob(job: Job<SMSJobData>): Promise<SMSJobResult> {
  const { jobId, businessId, contentId, text, credentials, payload } = job.data;
  
  // Log the job start
  console.log(`Processing SMS job ${jobId} for business ${businessId}`);
  
  try {
    // Validate required data
    if (!text) {
      throw new Error('SMS text is required');
    }
    
    if (!credentials.accountSid || !credentials.authToken || !credentials.fromNumber) {
      throw new Error('Missing required Twilio credentials');
    }
    
    // Validate recipients
    const recipients = payload.recipients || [];
    if (recipients.length === 0) {
      throw new Error('No recipients specified for SMS');
    }
    
    // Initialize the Twilio client
    const client = twilio(credentials.accountSid, credentials.authToken);
    
    // Generate a batch ID for tracking
    const batchId = `sms-batch-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Format phone numbers properly if needed
    const formattedRecipients = recipients.map(formatPhoneNumber);
    
    // Log the SMS sending attempt
    console.log(`Sending SMS to ${formattedRecipients.length} recipients`);
    console.log(`Message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    // Track successful and failed messages
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Send SMS to each recipient
    // We'll do this in batches to avoid overwhelming the Twilio API
    const BATCH_SIZE = 10;
    const BATCH_DELAY = 1000; // 1 second delay between batches
    
    for (let i = 0; i < formattedRecipients.length; i += BATCH_SIZE) {
      const batch = formattedRecipients.slice(i, i + BATCH_SIZE);
      
      // Process this batch
      const batchPromises = batch.map(async (recipient) => {
        try {
          const message = await client.messages.create({
            body: text,
            from: credentials.fromNumber,
            to: recipient,
            // Optional: Add statusCallback for tracking delivery status
            // statusCallback: 'https://your-webhook-endpoint/sms-status-callback'
          });
          
          console.log(`Message sent to ${recipient}, SID: ${message.sid}`);
          results.success++;
          
          // Track the message in the database if needed
          await trackSMSMessage(jobId, message.sid, recipient);
          
          return { recipient, sid: message.sid, success: true };
        } catch (error: any) {
          console.error(`Failed to send SMS to ${recipient}:`, error.message);
          results.failed++;
          results.errors.push(`${recipient}: ${error.message}`);
          
          return { recipient, error: error.message, success: false };
        }
      });
      
      // Wait for this batch to complete
      await Promise.all(batchPromises);
      
      // Wait before processing the next batch (only if more messages to send)
      if (i + BATCH_SIZE < formattedRecipients.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    // Determine overall success/failure
    const allSuccess = results.failed === 0 && results.success > 0;
    
    // Generate a meaningful error message if any failures
    const errorMessage = results.errors.length > 0 
      ? `Failed to send ${results.failed} out of ${results.success + results.failed} messages: ${results.errors.slice(0, 3).join('; ')}${results.errors.length > 3 ? '...' : ''}`
      : undefined;
    
    // Return the overall result
    return {
      success: allSuccess,
      batchId,
      messageCount: results.success,
      error: errorMessage
    };
    
  } catch (error: any) {
    // Log the error details
    console.error(`SMS job ${jobId} failed:`, error);
    
    // Return error result
    return {
      success: false,
      error: error.message || 'Unknown error during SMS processing'
    };
  }
}

/**
 * Format phone number to ensure it has correct international format
 * This is important for Twilio to properly route messages
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the number doesn't start with +, add the + sign
  // Assuming US/North American numbers by default if no country code
  if (!phoneNumber.startsWith('+')) {
    // If it's likely a US number without country code (10 digits)
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }
    // Otherwise, just add the + sign
    return `+${digitsOnly}`;
  }
  
  return phoneNumber;
}

/**
 * Track an SMS message in the database
 * This is optional but useful for detailed reporting
 */
async function trackSMSMessage(
  jobId: string, 
  messageSid: string, 
  recipient: string
): Promise<void> {
  try {
    // Insert a record into a tracking table (you would need to create this table)
    // This is optional and can be implemented later if needed
    
    // Example:
    /*
    await supabase
      .from('sms_message_tracking')
      .insert({
        job_id: jobId,
        message_sid: messageSid,
        recipient,
        status: 'sent',
        sent_at: new Date().toISOString()
      });
    */
  } catch (error) {
    // Just log the error but don't fail the overall process
    console.error('Failed to track SMS message:', error);
  }
} 