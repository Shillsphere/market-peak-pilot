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

/**
 * Twitter OAuth constants
 */
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || 'http://localhost:4000/api/credentials/twitter/callback';
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

// Scopes needed for posting tweets and reading user info
const TWITTER_SCOPES = [
  'tweet.read',
  'tweet.write',
  'users.read',
  'offline.access'
].join(' ');

/**
 * Initiate Twitter OAuth flow
 */
export const initiateTwitterAuth = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.query;
    
    if (!businessId) {
      return res.status(400).json({ error: 'businessId query parameter is required' });
    }
    
    if (!TWITTER_CLIENT_ID) {
      return res.status(500).json({ error: 'Twitter client ID not configured' });
    }
    
    // Generate a state parameter to prevent CSRF
    // Store businessId in state for retrieval in callback
    const state = Buffer.from(JSON.stringify({
      businessId,
      timestamp: Date.now()
    })).toString('base64');
    
    // Build the authorization URL
    const authUrl = new URL(TWITTER_AUTH_URL);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', TWITTER_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', TWITTER_CALLBACK_URL);
    authUrl.searchParams.append('scope', TWITTER_SCOPES);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge_method', 'plain');
    authUrl.searchParams.append('code_challenge', 'challenge'); // Should use PKCE in production
    
    // Redirect to Twitter authorization page
    res.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Error in initiateTwitterAuth:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred', 
      message: error.message 
    });
  }
};

/**
 * Handle Twitter OAuth callback
 */
export const handleTwitterCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is missing' });
    }
    
    if (!state) {
      return res.status(400).json({ error: 'State parameter is missing' });
    }
    
    if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Twitter client credentials not configured' });
    }
    
    // Decode the state parameter to get businessId
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (e) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    const { businessId } = stateData;
    
    if (!businessId) {
      return res.status(400).json({ error: 'Business ID not found in state' });
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        'grant_type': 'authorization_code',
        'code': code as string,
        'redirect_uri': TWITTER_CALLBACK_URL,
        'code_verifier': 'challenge' // Should match code_challenge from authorization request
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Twitter token exchange failed:', errorData);
      return res.status(500).json({ 
        error: 'Failed to exchange authorization code for tokens',
        details: errorData
      });
    }
    
    const tokenData = await tokenResponse.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    };
    
    const { access_token, refresh_token, expires_in } = tokenData;
    
    if (!access_token || !refresh_token) {
      return res.status(500).json({ error: 'Twitter did not return required tokens' });
    }
    
    // Save the credentials to the database
    // The tokens will be encrypted in the saveCredentials function
    await saveTwitterCredentials(businessId, access_token, refresh_token);
    
    // Redirect to a success page or client-side callback
    res.redirect(`/settings/integrations?success=twitter&businessId=${businessId}`);
  } catch (error: any) {
    console.error('Error in handleTwitterCallback:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred', 
      message: error.message 
    });
  }
};

/**
 * Helper function to save Twitter credentials
 */
async function saveTwitterCredentials(businessId: string, accessToken: string, refreshToken: string): Promise<void> {
  try {
    // Format the credentials
    const credentials = {
      accessToken,
      refreshToken,
      createdAt: new Date().toISOString()
    };
    
    // Encrypt the credentials
    const encryptedToken = encrypt(JSON.stringify(credentials));
    
    // Check if credentials already exist for this business/channel
    const { data: existingCreds, error: queryError } = await supabase
      .from('channel_credentials')
      .select('id')
      .eq('business_id', businessId)
      .eq('channel', 'twitter')
      .maybeSingle();
    
    if (queryError) {
      console.error('Error checking existing Twitter credentials:', queryError);
      throw new Error('Database error when checking credentials');
    }
    
    // Update or insert
    if (existingCreds?.id) {
      // Update existing credentials
      const { error } = await supabase
        .from('channel_credentials')
        .update({ token_encrypted: encryptedToken })
        .eq('id', existingCreds.id);
        
      if (error) {
        throw new Error(`Failed to update Twitter credentials: ${error.message}`);
      }
    } else {
      // Insert new credentials
      const { error } = await supabase
        .from('channel_credentials')
        .insert({
          business_id: businessId,
          channel: 'twitter',
          token_encrypted: encryptedToken
        });
        
      if (error) {
        throw new Error(`Failed to save Twitter credentials: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error saving Twitter credentials:', error);
    throw error;
  }
} 