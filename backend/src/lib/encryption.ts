import * as crypto from 'crypto';

// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The text to encrypt
 * @returns The encrypted text as a string in format 'iv:authTag:encrypted'
 */
export const encrypt = (text: string): string => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required for encryption');
  }
  
  // Create a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create the cipher using the encryption key and iv
  const cipher = crypto.createCipheriv(
    ALGORITHM, 
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), 
    iv
  );
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return iv, authTag, and encrypted data as a single string
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts a string that was encrypted using the encrypt function
 * @param encryptedText - The encrypted text in format 'iv:authTag:encrypted'
 * @returns The decrypted text
 */
export const decrypt = (encryptedText: string): string => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required for decryption');
  }
  
  // Split the encrypted text into its components
  const parts = encryptedText.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  
  // Convert hex strings back to buffers
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  // Create the decipher
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), 
    iv
  );
  
  // Set the auth tag
  decipher.setAuthTag(authTag);
  
  // Decrypt the data
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Generates a random hex string that can be used as an encryption key
 * @param bytes - The number of bytes to generate (default 32 for AES-256)
 * @returns A hex string of the specified length
 */
export const generateEncryptionKey = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Tests if the current encryption key is valid by encrypting and decrypting a test string
 * @returns True if encryption key is valid, false otherwise
 */
export const testEncryptionKey = (): boolean => {
  try {
    if (!process.env.ENCRYPTION_KEY) {
      return false;
    }
    
    const testString = 'test-encryption-string';
    const encrypted = encrypt(testString);
    const decrypted = decrypt(encrypted);
    
    return testString === decrypted;
  } catch (error) {
    console.error('Encryption key test failed:', error);
    return false;
  }
}; 