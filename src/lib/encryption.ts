import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * EncryptionService provides AES-256-GCM encryption and decryption for sensitive data.
 * 
 * Key features:
 * - Uses AES-256-GCM for authenticated encryption
 * - Generates unique IV (Initialization Vector) for each encryption operation
 * - Stores IV with ciphertext in format: "iv:ciphertext" (both hex-encoded)
 * - Reads encryption key from ENCRYPTION_KEY environment variable
 * 
 * Requirements: 3.1, 3.2
 */
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    // Convert hex string to buffer (expecting 32-byte hex string = 64 hex characters)
    this.key = Buffer.from(encryptionKey, 'hex');

    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be a 32-byte hex string (64 hex characters)');
    }
  }

  /**
   * Encrypts plaintext using AES-256-GCM with a unique IV.
   * 
   * @param plaintext - The string to encrypt
   * @returns Encrypted string in format "iv:ciphertext:authTag" (all hex-encoded)
   */
  encrypt(plaintext: string): string {
    // Generate a unique 12-byte IV for this encryption operation
    const iv = randomBytes(12);

    // Create cipher with AES-256-GCM
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    // Encrypt the plaintext
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    // Get the authentication tag (GCM provides authenticated encryption)
    const authTag = cipher.getAuthTag();

    // Return format: "iv:ciphertext:authTag" (all hex-encoded)
    return `${iv.toString('hex')}:${ciphertext}:${authTag.toString('hex')}`;
  }

  /**
   * Decrypts ciphertext that was encrypted with the encrypt() method.
   * 
   * @param encryptedData - Encrypted string in format "iv:ciphertext:authTag"
   * @returns Decrypted plaintext string
   * @throws Error if decryption fails (wrong key, corrupted data, or tampered data)
   */
  decrypt(encryptedData: string): string {
    // Parse the encrypted data format: "iv:ciphertext:authTag"
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format. Expected "iv:ciphertext:authTag"');
    }

    const [ivHex, ciphertext, authTagHex] = parts;

    // Convert hex strings back to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Create decipher with AES-256-GCM
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    
    // Set the authentication tag for verification
    decipher.setAuthTag(authTag);

    // Decrypt the ciphertext
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }
}

// Lazy-loaded singleton instance for use throughout the application
let _encryptionService: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
  if (!_encryptionService) {
    _encryptionService = new EncryptionService();
  }
  return _encryptionService;
}
