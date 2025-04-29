import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { encrypt } from '../lib/encryption.js';

/**
 * Validates the incoming credentials based on channel type
 */
const validateChannelCredentials = (channel: string, credentials: any): boolean => {
  switch(channel) {
    case 'twitter':
      return !!(credentials.accessToken && credentials.refreshToken);
    case 'gmb':
      return !!(credentials.accessToken && credentials.refreshToken);
    case 'twilio':
      return !!(credentials.accountSid && credentials.authToken && credentials.fromNumber);
    case 'sendgrid':
      return !!(credentials.apiKey);
    default:
      return false;
  }
};

/**
 * Get validation errors for specific channel
 */
const getValidationErrors = (channel: string): string[] => {
  switch(channel) {
    case 'twitter':
      return ['accessToken', 'refreshToken'];
    case 'gmb':
      return ['accessToken', 'refreshToken'];
    case 'twilio':
      return ['accountSid', 'authToken', 'fromNumber'];
    case 'sendgrid':
      return ['apiKey'];
    default:
      return ['Unknown channel'];
  }
};

/**
 * Save credentials for a specific channel
 */
export const saveCredentials = async (req: Request, res: Response) => {
  try {
    const { channel } = req.params;
    const { businessId, ...credentials } = req.body;
    
    // Validate the channel
    const validChannels = ['twitter', 'gmb', 'twilio', 'sendgrid'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ 
        error: `Invalid channel. Must be one of: ${validChannels.join(', ')}` 
      });
    }
    
    // Validate required businessId
    if (!businessId) {
      return res.status(400).json({ 
        error: 'businessId is required' 
      });
    }
    
    // Validate required fields for the channel
    if (!validateChannelCredentials(channel, credentials)) {
      return res.status(400).json({ 
        error: 'Missing required credentials for channel',
        requiredFields: getValidationErrors(channel)
      });
    }
    
    // Encrypt the credentials
    const encryptedToken = encrypt(JSON.stringify(credentials));
    
    // Check if credentials already exist for this business/channel
    const { data: existingCreds, error: queryError } = await supabase
      .from('channel_credentials')
      .select('id')
      .eq('business_id', businessId)
      .eq('channel', channel)
      .maybeSingle();
    
    if (queryError) {
      console.error('Error checking existing credentials:', queryError);
      return res.status(500).json({ error: 'Database error when checking credentials' });
    }
    
    let dbResult;
    
    // Update or insert
    if (existingCreds?.id) {
      // Update existing credentials
      dbResult = await supabase
        .from('channel_credentials')
        .update({ token_encrypted: encryptedToken })
        .eq('id', existingCreds.id);
    } else {
      // Insert new credentials
      dbResult = await supabase
        .from('channel_credentials')
        .insert({
          business_id: businessId,
          channel,
          token_encrypted: encryptedToken
        });
    }
    
    if (dbResult.error) {
      console.error('Error saving credentials:', dbResult.error);
      return res.status(500).json({ error: 'Failed to save credentials' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: `${channel} credentials saved successfully`,
      operation: existingCreds?.id ? 'updated' : 'created'
    });
  } catch (error: any) {
    console.error('Error in saveCredentials:', error);
    console.error(error.stack);
    res.status(500).json({ 
      error: 'An unexpected error occurred', 
      message: error.message 
    });
  }
};

/**
 * Get all credentials for a business (returns only channel names, not tokens)
 */
export const getBusinessCredentials = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    
    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }
    
    const { data, error } = await supabase
      .from('channel_credentials')
      .select('id, channel, created_at')
      .eq('business_id', businessId);
    
    if (error) {
      console.error('Error fetching credentials:', error);
      return res.status(500).json({ error: 'Database error when fetching credentials' });
    }
    
    res.status(200).json({ 
      success: true, 
      credentials: data 
    });
  } catch (error: any) {
    console.error('Error in getBusinessCredentials:', error);
    console.error(error.stack);
    res.status(500).json({ 
      error: 'An unexpected error occurred', 
      message: error.message 
    });
  }
};

/**
 * Delete credentials for a specific channel
 */
export const deleteCredentials = async (req: Request, res: Response) => {
  try {
    const { credentialId } = req.params;
    
    if (!credentialId) {
      return res.status(400).json({ error: 'credentialId is required' });
    }
    
    const { error } = await supabase
      .from('channel_credentials')
      .delete()
      .eq('id', credentialId);
    
    if (error) {
      console.error('Error deleting credentials:', error);
      return res.status(500).json({ error: 'Database error when deleting credentials' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Credentials deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error in deleteCredentials:', error);
    console.error(error.stack);
    res.status(500).json({ 
      error: 'An unexpected error occurred', 
      message: error.message 
    });
  }
}; 