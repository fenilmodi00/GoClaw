import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/status/route';
import { NextRequest } from 'next/server';
import { getDatabaseService } from '@/lib/database';
import type { Deployment } from '@/db/schema';

/**
 * Unit tests for GET /api/status endpoint
 * 
 * Tests the status API route including:
 * - Valid deployment ID returns correct status and details
 * - Invalid deployment ID format returns 400
 * - Missing deployment ID returns 400
 * - Non-existent deployment ID returns 404
 * - Active deployments include channel-specific connection links
 * - Failed deployments include error message
 * - Database errors return 500
 * - Channel-specific links for Telegram, Discord, and WhatsApp
 * 
 * Requirements: 6.2, 7.1, 7.2, 7.3, 8.4, 8.5, 10.1, 10.3
 */

// Mock the database service
vi.mock('@/lib/database', () => ({
  getDatabaseService: vi.fn(),
}));

describe('GET /api/status', () => {
  const mockGetDeploymentById = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Setup database service mock
    (getDatabaseService as any).mockReturnValue({
      getDeploymentById: mockGetDeploymentById,
    });
  });

  it('should return 400 when deployment ID is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/status');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Deployment ID is required');
  });

  it('should return 400 when deployment ID format is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/status?id=invalid-id');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid deployment ID');
  });

  it('should return 404 when deployment is not found', async () => {
    mockGetDeploymentById.mockResolvedValue(null);
    
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(`http://localhost:3000/api/status?id=${validUuid}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Deployment not found');
    expect(mockGetDeploymentById).toHaveBeenCalledWith(validUuid);
  });

  it('should return pending status with minimal details', async () => {
    const mockDeployment: Partial<Deployment> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      status: 'pending',
      email: 'test@example.com',
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
      channelApiKey: null,
      stripeSessionId: 'cs_test_123',
      akashDeploymentId: null,
      akashLeaseId: null,
      providerUrl: null,
      errorMessage: null,
      stripePaymentIntentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetDeploymentById.mockResolvedValue(mockDeployment);
    
    const request = new NextRequest(`http://localhost:3000/api/status?id=${mockDeployment.id}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('pending');
    expect(data.deploymentId).toBeUndefined();
    expect(data.leaseId).toBeUndefined();
    expect(data.providerUrl).toBeUndefined();
    expect(data.errorMessage).toBeUndefined();
    expect(data.channelLink).toBeUndefined();
  });

  it('should return deploying status with minimal details', async () => {
    const mockDeployment: Partial<Deployment> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      status: 'deploying',
      email: 'test@example.com',
      model: 'gpt-3.2',
      channel: 'discord',
      channelToken: 'discord-bot-token',
      channelApiKey: null,
      stripeSessionId: 'cs_test_123',
      akashDeploymentId: null,
      akashLeaseId: null,
      providerUrl: null,
      errorMessage: null,
      stripePaymentIntentId: 'pi_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetDeploymentById.mockResolvedValue(mockDeployment);
    
    const request = new NextRequest(`http://localhost:3000/api/status?id=${mockDeployment.id}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('deploying');
    expect(data.deploymentId).toBeUndefined();
    expect(data.leaseId).toBeUndefined();
    expect(data.providerUrl).toBeUndefined();
  });

  it('should return active status with all deployment details and Telegram link', async () => {
    const mockDeployment: Partial<Deployment> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      status: 'active',
      email: 'test@example.com',
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
      channelApiKey: null,
      stripeSessionId: 'cs_test_123',
      akashDeploymentId: 'akash-deploy-123',
      akashLeaseId: 'akash-lease-456',
      providerUrl: 'https://provider.akash.network',
      errorMessage: null,
      stripePaymentIntentId: 'pi_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetDeploymentById.mockResolvedValue(mockDeployment);
    
    // Mock Telegram API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        result: {
          id: 123456789,
          is_bot: true,
          first_name: 'Test Bot',
          username: 'TestBot',
        },
      }),
    });
    
    const request = new NextRequest(`http://localhost:3000/api/status?id=${mockDeployment.id}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('active');
    expect(data.deploymentId).toBe('akash-deploy-123');
    expect(data.leaseId).toBe('akash-lease-456');
    expect(data.providerUrl).toBe('https://provider.akash.network');
    expect(data.channelLink).toBe('https://t.me/TestBot');
    expect(data.errorMessage).toBeUndefined();
  });

  it('should return failed status with error message', async () => {
    const mockDeployment: Partial<Deployment> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      status: 'failed',
      email: 'test@example.com',
      model: 'gemini-3-flash',
      channel: 'whatsapp',
      channelToken: 'whatsapp-token',
      channelApiKey: 'whatsapp-api-key',
      stripeSessionId: 'cs_test_123',
      akashDeploymentId: null,
      akashLeaseId: null,
      providerUrl: null,
      errorMessage: 'Akash deployment failed: insufficient funds',
      stripePaymentIntentId: 'pi_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetDeploymentById.mockResolvedValue(mockDeployment);
    
    const request = new NextRequest(`http://localhost:3000/api/status?id=${mockDeployment.id}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('failed');
    expect(data.errorMessage).toBe('Akash deployment failed: insufficient funds');
    expect(data.channelLink).toBeUndefined();
  });

  it('should return 500 when database error occurs', async () => {
    mockGetDeploymentById.mockRejectedValue(new Error('Database connection failed'));
    
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(`http://localhost:3000/api/status?id=${validUuid}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('An error occurred while retrieving deployment status');
  });

  it('should include partial deployment details when available', async () => {
    const mockDeployment: Partial<Deployment> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      status: 'deploying',
      email: 'test@example.com',
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
      channelApiKey: null,
      stripeSessionId: 'cs_test_123',
      akashDeploymentId: 'akash-deploy-123', // Deployment created but no lease yet
      akashLeaseId: null,
      providerUrl: null,
      errorMessage: null,
      stripePaymentIntentId: 'pi_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetDeploymentById.mockResolvedValue(mockDeployment);
    
    const request = new NextRequest(`http://localhost:3000/api/status?id=${mockDeployment.id}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('deploying');
    expect(data.deploymentId).toBe('akash-deploy-123');
    expect(data.leaseId).toBeUndefined();
    expect(data.providerUrl).toBeUndefined();
  });

  it('should return Discord link for active Discord deployments', async () => {
    const mockDeployment: Partial<Deployment> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      status: 'active',
      email: 'test@example.com',
      model: 'gpt-3.2',
      channel: 'discord',
      channelToken: 'discord-bot-token',
      channelApiKey: null,
      stripeSessionId: 'cs_test_123',
      akashDeploymentId: 'akash-deploy-123',
      akashLeaseId: 'akash-lease-456',
      providerUrl: 'https://provider.akash.network',
      errorMessage: null,
      stripePaymentIntentId: 'pi_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetDeploymentById.mockResolvedValue(mockDeployment);
    
    const request = new NextRequest(`http://localhost:3000/api/status?id=${mockDeployment.id}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('active');
    expect(data.channelLink).toBe('https://discord.com/developers/applications');
  });

  it('should return WhatsApp link for active WhatsApp deployments', async () => {
    const mockDeployment: Partial<Deployment> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123',
      status: 'active',
      email: 'test@example.com',
      model: 'gemini-3-flash',
      channel: 'whatsapp',
      channelToken: 'whatsapp-token',
      channelApiKey: 'whatsapp-api-key',
      stripeSessionId: 'cs_test_123',
      akashDeploymentId: 'akash-deploy-123',
      akashLeaseId: 'akash-lease-456',
      providerUrl: 'https://provider.akash.network',
      errorMessage: null,
      stripePaymentIntentId: 'pi_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetDeploymentById.mockResolvedValue(mockDeployment);
    
    const request = new NextRequest(`http://localhost:3000/api/status?id=${mockDeployment.id}`);
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('active');
    expect(data.channelLink).toBe('https://business.whatsapp.com/');
  });
});
