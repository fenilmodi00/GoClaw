import { describe, it, expect, beforeAll } from 'vitest';
import { EncryptionService } from '../lib/encryption';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeAll(() => {
    // Set a test encryption key (32 bytes = 64 hex characters)
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
    encryptionService = new EncryptionService();
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a simple string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt API keys', () => {
      const apiKey = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';
      const encrypted = encryptionService.encrypt(apiKey);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(apiKey);
    });

    it('should encrypt and decrypt Telegram bot tokens', () => {
      const token = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
      const encrypted = encryptionService.encrypt(token);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(token);
    });

    it('should produce different ciphertext for the same plaintext (unique IV)', () => {
      const plaintext = 'test-api-key';
      const encrypted1 = encryptionService.encrypt(plaintext);
      const encrypted2 = encryptionService.encrypt(plaintext);

      // Different ciphertext due to unique IV
      expect(encrypted1).not.toBe(encrypted2);

      // But both decrypt to the same plaintext
      expect(encryptionService.decrypt(encrypted1)).toBe(plaintext);
      expect(encryptionService.decrypt(encrypted2)).toBe(plaintext);
    });

    it('should handle empty strings', () => {
      const plaintext = '';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(1000);
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = '你好世界 🌍 مرحبا بالعالم';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('encrypted data format', () => {
    it('should produce encrypted data in "iv:ciphertext:authTag" format', () => {
      const plaintext = 'test';
      const encrypted = encryptionService.encrypt(plaintext);

      // Should have exactly 3 parts separated by colons
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);

      // Each part should be a valid hex string
      const [iv, ciphertext, authTag] = parts;
      expect(iv).toMatch(/^[0-9a-f]+$/);
      expect(ciphertext).toMatch(/^[0-9a-f]+$/);
      expect(authTag).toMatch(/^[0-9a-f]+$/);

      // IV should be 12 bytes = 24 hex characters
      expect(iv).toHaveLength(24);

      // Auth tag should be 16 bytes = 32 hex characters (GCM default)
      expect(authTag).toHaveLength(32);
    });
  });

  describe('error handling', () => {
    it('should throw error when decrypting invalid format', () => {
      expect(() => {
        encryptionService.decrypt('invalid-format');
      }).toThrow('Invalid encrypted data format');
    });

    it('should throw error when decrypting with wrong auth tag (tampered data)', () => {
      const plaintext = 'test';
      const encrypted = encryptionService.encrypt(plaintext);
      
      // Tamper with the auth tag
      const parts = encrypted.split(':');
      parts[2] = 'a'.repeat(32); // Replace auth tag with invalid one
      const tampered = parts.join(':');

      expect(() => {
        encryptionService.decrypt(tampered);
      }).toThrow();
    });

    it('should throw error when ENCRYPTION_KEY is not set', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      expect(() => {
        new EncryptionService();
      }).toThrow('ENCRYPTION_KEY environment variable is not set');

      // Restore the key
      process.env.ENCRYPTION_KEY = originalKey;
    });

    it('should throw error when ENCRYPTION_KEY is wrong length', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = 'tooshort';

      expect(() => {
        new EncryptionService();
      }).toThrow('ENCRYPTION_KEY must be a 32-byte hex string');

      // Restore the key
      process.env.ENCRYPTION_KEY = originalKey;
    });
  });
});
