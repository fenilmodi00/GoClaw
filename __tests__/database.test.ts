import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService, type CreateDeploymentData } from '@/lib/database';

/**
 * Unit tests for DatabaseService
 * 
 * Tests core database operations including:
 * - Creating deployments with encrypted credentials
 * - Updating deployment status with timestamp updates
 * - Retrieving deployments by ID and Stripe session
 * - Decryption of sensitive fields on retrieval
 * 
 * NOTE: These tests require a real database connection.
 * Set up your test database credentials in .env before running.
 * 
 * Requirements: 8.2, 8.3
 */

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  const createdDeploymentIds: string[] = [];

  beforeEach(() => {
    // Skip tests if database is not configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[username]')) {
      console.warn('⚠️  Skipping database tests: DATABASE_URL not configured');
      return;
    }

    // Create a new database service instance for each test
    dbService = new DatabaseService();
  });

  afterEach(async () => {
    // Clean up test data after each test
    // Note: In production, you should use a separate test database
    // For now, we track created IDs for manual cleanup if needed
  });

  describe('createDeployment', () => {
    it('should create a deployment with encrypted credentials', async () => {
      if (!dbService) return; // Skip if database not configured

      const testData: CreateDeploymentData = {
        email: 'test@example.com',
        telegramToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        akashApiKey: 'test-akash-key',
        llmProvider: 'openai',
        llmApiKey: 'sk-test-key',
        stripeSessionId: `cs_test_${Date.now()}_1`,
      };

      const deployment = await dbService.createDeployment(testData);
      createdDeploymentIds.push(deployment.id);

      // Verify deployment was created with correct data
      expect(deployment.id).toBeDefined();
      expect(deployment.email).toBe(testData.email);
      expect(deployment.telegramToken).toBe(testData.telegramToken); // Should be decrypted in return
      expect(deployment.akashApiKey).toBe(testData.akashApiKey); // Should be decrypted in return
      expect(deployment.llmProvider).toBe(testData.llmProvider);
      expect(deployment.llmApiKey).toBe(testData.llmApiKey); // Should be decrypted in return
      expect(deployment.stripeSessionId).toBe(testData.stripeSessionId);
      expect(deployment.status).toBe('pending');
      expect(deployment.createdAt).toBeInstanceOf(Date);
      expect(deployment.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for different deployments', async () => {
      if (!dbService) return; // Skip if database not configured

      const testData: CreateDeploymentData = {
        email: 'test@example.com',
        telegramToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        akashApiKey: 'test-akash-key',
        llmProvider: 'openai',
        llmApiKey: 'sk-test-key',
        stripeSessionId: `cs_test_${Date.now()}_unique_1`,
      };

      const deployment1 = await dbService.createDeployment(testData);
      createdDeploymentIds.push(deployment1.id);
      
      const testData2: CreateDeploymentData = {
        ...testData,
        stripeSessionId: `cs_test_${Date.now()}_unique_2`,
      };
      const deployment2 = await dbService.createDeployment(testData2);
      createdDeploymentIds.push(deployment2.id);

      // Verify IDs are unique
      expect(deployment1.id).not.toBe(deployment2.id);
    });
  });

  describe('updateDeploymentStatus', () => {
    it('should update deployment status and timestamp', async () => {
      if (!dbService) return; // Skip if database not configured

      // Create a test deployment
      const testData: CreateDeploymentData = {
        email: 'test@example.com',
        telegramToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        akashApiKey: 'test-akash-key',
        llmProvider: 'openai',
        llmApiKey: 'sk-test-key',
        stripeSessionId: `cs_test_${Date.now()}_update_1`,
      };

      const deployment = await dbService.createDeployment(testData);
      createdDeploymentIds.push(deployment.id);
      const originalUpdatedAt = deployment.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update the status
      await dbService.updateDeploymentStatus(deployment.id, 'deploying');

      // Retrieve the updated deployment
      const updated = await dbService.getDeploymentById(deployment.id);

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('deploying');
      expect(updated!.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should update deployment with additional details', async () => {
      if (!dbService) return; // Skip if database not configured

      // Create a test deployment
      const testData: CreateDeploymentData = {
        email: 'test@example.com',
        telegramToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        akashApiKey: 'test-akash-key',
        llmProvider: 'openai',
        llmApiKey: 'sk-test-key',
        stripeSessionId: `cs_test_${Date.now()}_update_2`,
      };

      const deployment = await dbService.createDeployment(testData);
      createdDeploymentIds.push(deployment.id);

      // Update with deployment details
      await dbService.updateDeploymentStatus(deployment.id, 'active', {
        akashDeploymentId: 'akash-deploy-123',
        akashLeaseId: 'akash-lease-456',
        providerUrl: 'https://provider.akash.network',
      });

      // Retrieve the updated deployment
      const updated = await dbService.getDeploymentById(deployment.id);

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('active');
      expect(updated!.akashDeploymentId).toBe('akash-deploy-123');
      expect(updated!.akashLeaseId).toBe('akash-lease-456');
      expect(updated!.providerUrl).toBe('https://provider.akash.network');
    });

    it('should update deployment with error message on failure', async () => {
      if (!dbService) return; // Skip if database not configured

      // Create a test deployment
      const testData: CreateDeploymentData = {
        email: 'test@example.com',
        telegramToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        akashApiKey: 'test-akash-key',
        llmProvider: 'openai',
        llmApiKey: 'sk-test-key',
        stripeSessionId: `cs_test_${Date.now()}_update_3`,
      };

      const deployment = await dbService.createDeployment(testData);
      createdDeploymentIds.push(deployment.id);

      // Update with error
      await dbService.updateDeploymentStatus(deployment.id, 'failed', {
        errorMessage: 'Akash deployment failed: insufficient funds',
      });

      // Retrieve the updated deployment
      const updated = await dbService.getDeploymentById(deployment.id);

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('failed');
      expect(updated!.errorMessage).toBe('Akash deployment failed: insufficient funds');
    });
  });

  describe('getDeploymentById', () => {
    it('should retrieve deployment by ID with decrypted fields', async () => {
      if (!dbService) return; // Skip if database not configured

      const testData: CreateDeploymentData = {
        email: 'test@example.com',
        telegramToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        akashApiKey: 'test-akash-key',
        llmProvider: 'openai',
        llmApiKey: 'sk-test-key',
        stripeSessionId: `cs_test_${Date.now()}_get_1`,
      };

      const created = await dbService.createDeployment(testData);
      createdDeploymentIds.push(created.id);
      const retrieved = await dbService.getDeploymentById(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.email).toBe(testData.email);
      expect(retrieved!.telegramToken).toBe(testData.telegramToken);
      expect(retrieved!.akashApiKey).toBe(testData.akashApiKey);
      expect(retrieved!.llmApiKey).toBe(testData.llmApiKey);
    });

    it('should return null for non-existent deployment ID', async () => {
      if (!dbService) return; // Skip if database not configured

      const retrieved = await dbService.getDeploymentById('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('getDeploymentByStripeSession', () => {
    it('should retrieve deployment by Stripe session ID', async () => {
      if (!dbService) return; // Skip if database not configured

      const testData: CreateDeploymentData = {
        email: 'test@example.com',
        telegramToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        akashApiKey: 'test-akash-key',
        llmProvider: 'openai',
        llmApiKey: 'sk-test-key',
        stripeSessionId: `cs_test_${Date.now()}_stripe_1`,
      };

      const created = await dbService.createDeployment(testData);
      createdDeploymentIds.push(created.id);
      const retrieved = await dbService.getDeploymentByStripeSession(testData.stripeSessionId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.stripeSessionId).toBe(testData.stripeSessionId);
      expect(retrieved!.telegramToken).toBe(testData.telegramToken);
    });

    it('should return null for non-existent Stripe session ID', async () => {
      if (!dbService) return; // Skip if database not configured

      const retrieved = await dbService.getDeploymentByStripeSession('non-existent-session');
      expect(retrieved).toBeNull();
    });
  });
});
