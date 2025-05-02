import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { distributionQueue } from '../queue.js';
import { decrypt } from '../lib/encryption.js';

// Valid distribution channels
const VALID_CHANNELS = ['twitter', 'gmb', 'sms', 'email', 'fb_group'] as const;
type DistributionChannel = typeof VALID_CHANNELS[number];

/**
 * Validate the distribution request
 */
const validateDistributionRequest = (
  businessId: string, 
  contentId: string, 
  channels: string[], 
  scheduledAt: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!businessId) {
    errors.push('businessId is required');
  }
  
  if (!contentId) {
    errors.push('contentId is required');
  }
  
  if (!channels || !Array.isArray(channels) || channels.length === 0) {
    errors.push('At least one channel must be selected');
  } else {
    // Check if all channels are valid
    const invalidChannels = channels.filter(c => !VALID_CHANNELS.includes(c as DistributionChannel));
    if (invalidChannels.length > 0) {
      errors.push(`Invalid channels: ${invalidChannels.join(', ')}. Valid channels are: ${VALID_CHANNELS.join(', ')}`);
    }
  }
  
  if (scheduledAt) {
    // Validate date format
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      errors.push('scheduledAt must be a valid date');
    }
    
    // Prevent scheduling in the past
    if (date.getTime() < Date.now()) {
      errors.push('scheduledAt cannot be in the past');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Controller to handle content distribution
 * Creates jobs for each selected channel
 */
export const distributeContent = async (req: Request, res: Response) => {
  try {
    const { businessId, contentId, channels, scheduledAt, payload = {} } = req.body;
    
    // Validate request
    const validation = validateDistributionRequest(businessId, contentId, channels, scheduledAt);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid distribution request', 
        details: validation.errors 
      });
    }
    
    // Fetch the content to distribute
    const { data: content, error: contentError } = await supabase
      .from('posts')
      .select('caption, image_id, generated_images(url)')
      .eq('id', contentId)
      .single();
      
    if (contentError || !content) {
      console.error('Error fetching content:', contentError);
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Create jobs for each channel
    const jobResults = await Promise.all(
      channels.map(async (channel: string) => {
        try {
          // Check if we have credentials for this channel
          const { data: credentials, error: credError } = await supabase
            .from('channel_credentials')
            .select('token_encrypted')
            .eq('business_id', businessId)
            .eq('channel', channel)
            .single();
            
          if (credError || !credentials) {
            return { 
              channel, 
              success: false, 
              error: `No credentials found for ${channel}` 
            };
          }
          
          // Insert job record in the database
          const { data: job, error: jobError } = await supabase
            .from('distribution_jobs')
            .insert({
              business_id: businessId,
              content_id: contentId,
              channel,
              scheduled_at: scheduledAt || new Date().toISOString(),
              payload: {
                ...payload,
                channelSpecific: payload[channel] || {}
              }
            })
            .select()
            .single();
            
          if (jobError || !job) {
            console.error(`Error creating job for ${channel}:`, jobError);
            return { 
              channel, 
              success: false, 
              error: 'Failed to create job record' 
            };
          }
          
          // Add job to the queue
          // Only decrypt credentials when adding to queue (not stored in job record)
          const decryptedCredentials = credentials.token_encrypted 
            ? JSON.parse(decrypt(credentials.token_encrypted)) 
            : {};
            
          // Get the image URL correctly from the nested structure
          const imageUrl = content.generated_images ? 
            (content.generated_images as any).url : 
            undefined;
          
          await distributionQueue.add(
            `${channel}-${job.id}`,
            {
              jobId: job.id,
              businessId,
              contentId,
              channel: channel as DistributionChannel,
              text: content.caption,
              imageUrl,
              credentials: decryptedCredentials,
              payload: job.payload
            },
            {
              // If scheduled for future, delay the job
              delay: scheduledAt 
                ? Math.max(0, new Date(scheduledAt).getTime() - Date.now()) 
                : 0
            }
          );
          
          return { 
            channel, 
            success: true, 
            jobId: job.id 
          };
        } catch (error: any) {
          console.error(`Error processing ${channel}:`, error);
          return { 
            channel, 
            success: false, 
            error: error.message 
          };
        }
      })
    );
    
    const successJobs = jobResults.filter(r => r.success);
    const failedJobs = jobResults.filter(r => !r.success);
    
    res.status(200).json({
      success: successJobs.length > 0,
      message: successJobs.length > 0 
        ? `Successfully created ${successJobs.length} distribution job(s)` 
        : 'No distribution jobs were created',
      successJobs,
      failedJobs,
      totalJobs: jobResults.length
    });
  } catch (error: any) {
    console.error('Error in distributeContent:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred', 
      message: error.message 
    });
  }
}; 