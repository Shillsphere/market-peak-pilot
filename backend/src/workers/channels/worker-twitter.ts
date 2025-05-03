import { Job } from 'bullmq';
import { supabase } from '../../lib/supabase.js';
import axios from 'axios';

// Define the shape of Twitter job data
interface TwitterJobData {
  jobId: string;
  businessId: string;
  contentId: string;
  text: string;
  imageUrl?: string;
  credentials: {
    accessToken: string;
    refreshToken: string;
    clientId?: string;
    clientSecret?: string;
  };
  payload: any;
}

// Define the result interface
interface TwitterJobResult {
  success: boolean;
  tweetId?: string;
  error?: string;
}

// Twitter API v2 base URL
const TWITTER_API_BASE = 'https://api.twitter.com/2';

/**
 * Process a Twitter distribution job
 * Implementation for Twitter API v2
 */
export async function processTwitterJob(job: Job<TwitterJobData>): Promise<TwitterJobResult> {
  const { jobId, businessId, contentId, text, imageUrl, credentials, payload } = job.data;
  
  // Log the job start
  console.log(`Processing Twitter job ${jobId} for business ${businessId}`);
  
  try {
    // Validate required data
    if (!text) {
      throw new Error('Tweet text is required');
    }
    
    if (!credentials.accessToken) {
      throw new Error('Missing required Twitter credentials: accessToken');
    }
    
    // Setup Axios instance with auth headers
    const api = axios.create({
      baseURL: TWITTER_API_BASE,
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // First, check if we need to refresh the token
    if (credentials.refreshToken && credentials.clientId && credentials.clientSecret) {
      try {
        const newCredentials = await refreshTokenIfNeeded(credentials);
        if (newCredentials) {
          // Update credentials in the database
          await updateCredentials(businessId, 'twitter', newCredentials);
          
          // Update the API client with the new token
          api.defaults.headers.common['Authorization'] = `Bearer ${newCredentials.accessToken}`;
        }
      } catch (refreshError) {
        console.warn('Failed to refresh Twitter token:', refreshError);
        // Continue with the current token
      }
    }
    
    // Check if we have an image to upload
    let mediaIds = [];
    if (imageUrl) {
      console.log(`Uploading image for tweet: ${imageUrl}`);
      
      try {
        // Get the image data
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        
        // Upload image to Twitter
        const mediaId = await uploadMedia(credentials.accessToken, imageBuffer);
        mediaIds.push(mediaId);
        console.log(`Image uploaded to Twitter, media_id: ${mediaId}`);
      } catch (imageError: any) {
        console.error(`Failed to download/upload image from ${imageUrl}. Full Error:`, imageError);
        if (imageError.response) {
            console.error(`Axios Response Status: ${imageError.response.status}`);
            console.error(`Axios Response Data:`, imageError.response.data);
        }
        // Continue without image if upload fails
      }
    }
    
    // Prepare tweet data
    const tweetData: any = {
      text
    };
    
    // Add media if we have any
    if (mediaIds.length > 0) {
      tweetData.media = { media_ids: mediaIds };
    }
    
    // Post the tweet
    console.log(`Posting tweet: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    const tweetResponse = await api.post('/tweets', tweetData);
    
    // Check if the tweet was successfully posted
    if (tweetResponse.status !== 201 && tweetResponse.status !== 200) {
      throw new Error(`Twitter API returned status ${tweetResponse.status}: ${JSON.stringify(tweetResponse.data)}`);
    }
    
    const tweetId = tweetResponse.data.data.id;
    console.log(`Tweet posted successfully, ID: ${tweetId}`);
    
    // Return success result
    return {
      success: true,
      tweetId
    };
    
  } catch (error: any) {
    // Log the error details
    console.error(`Twitter job ${jobId} failed:`, error);
    
    // Check if this is a rate limit error
    if (error.response && error.response.status === 429) {
      const resetTime = error.response.headers['x-rate-limit-reset'];
      console.log(`Twitter rate limit exceeded. Reset at: ${new Date(Number(resetTime) * 1000)}`);
    }
    
    // Return error result
    return {
      success: false,
      error: error.message || 'Unknown error during Twitter processing'
    };
  }
}

/**
 * Helper function to refresh Twitter token if needed
 */
async function refreshTokenIfNeeded(credentials: TwitterJobData['credentials']): Promise<TwitterJobData['credentials'] | null> {
  // Implement token refresh logic here
  // This would use credentials.refreshToken, credentials.clientId, and credentials.clientSecret
  // to obtain a new access token from Twitter
  
  // For now, this is a placeholder
  return null;
}

/**
 * Helper function to update credentials in the database
 */
async function updateCredentials(businessId: string, channel: string, credentials: any): Promise<void> {
  try {
    // Get the current encrypted credentials record
    const { data, error } = await supabase
      .from('channel_credentials')
      .select('id')
      .eq('business_id', businessId)
      .eq('channel', channel)
      .single();
      
    if (error || !data) {
      console.error('Failed to find credentials record to update:', error);
      return;
    }
    
    // Update the credentials using the controller
    const response = await fetch(`/api/credentials/${channel}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessId,
        ...credentials
      })
    });
    
    if (!response.ok) {
      console.error('Failed to update credentials via API:', await response.text());
    }
  } catch (error) {
    console.error('Error updating credentials:', error);
  }
}

/**
 * Helper function to upload media to Twitter
 */
async function uploadMedia(accessToken: string, imageBuffer: Buffer): Promise<string> {
  // Note: Media upload doesn't use the v2 API, it uses v1.1
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
  
  try {
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Create form data
    const formData = new FormData();
    formData.append('media_data', base64Image);
    
    // Upload the media
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Return the media ID
    return response.data.media_id_string;
  } catch (error: any) {
    console.error('Error uploading media to Twitter:', error);
    throw new Error(`Failed to upload media: ${error.message}`);
  }
} 