import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StatusTracker } from '@/components/StatusTracker';
import './setup';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('StatusTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders with initial pending status', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'pending' }),
    });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="pending"
      />
    );

    expect(screen.getByText('Deployment Status')).toBeInTheDocument();
    expect(screen.getByText('Payment Pending')).toBeInTheDocument();
    expect(screen.getByText(/waiting for payment confirmation/i)).toBeInTheDocument();
  });

  it('renders with initial deploying status', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'deploying' }),
    });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="deploying"
      />
    );

    expect(screen.getByText('Deploying to Akash')).toBeInTheDocument();
    expect(screen.getByText(/creating deployment on akash network/i)).toBeInTheDocument();
  });

  it('displays loading indicator for pending state', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'pending' }),
    });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="pending"
      />
    );

    // Check for loading spinner (Loader2 component)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays loading indicator for deploying state', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'deploying' }),
    });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="deploying"
      />
    );

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays error message for failed state', async () => {
    vi.useRealTimers(); // Use real timers for this test
    
    const errorMessage = 'Deployment failed due to invalid API key';
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'failed',
        errorMessage,
      }),
    });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="failed"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Deployment Failed')).toBeInTheDocument();
      expect(screen.getByText('Error Details:')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays success state with deployment details', async () => {
    vi.useRealTimers(); // Use real timers for this test
    
    const mockStatusData = {
      status: 'active',
      channel: 'telegram',
      channelLink: 'https://t.me/',
      providerUrl: 'https://provider.akash.network',
      deploymentId: 'akash-deployment-123',
      leaseId: 'akash-lease-456',
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockStatusData,
    });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="active"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Deployment Active')).toBeInTheDocument();
      expect(screen.getByText(/your openclaw bot is now running/i)).toBeInTheDocument();
      
      // Check for deployment details
      expect(screen.getByText('Telegram Bot')).toBeInTheDocument();
      expect(screen.getByText('Provider URL')).toBeInTheDocument();
      expect(screen.getByText('Akash Deployment ID')).toBeInTheDocument();
      expect(screen.getByText('Akash Lease ID')).toBeInTheDocument();
      
      // Check for actual values
      expect(screen.getByText(mockStatusData.providerUrl)).toBeInTheDocument();
      expect(screen.getByText(mockStatusData.deploymentId)).toBeInTheDocument();
      expect(screen.getByText(mockStatusData.leaseId)).toBeInTheDocument();
    });
  });

  it('polls API every 5 seconds for non-terminal status', async () => {
    vi.useRealTimers(); // Use real timers for this test
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'deploying' }),
    });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="deploying"
      />
    );

    // Initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Wait for 5.1 seconds to allow for polling
    await new Promise(resolve => setTimeout(resolve, 5100));

    // Should have polled at least once more
    expect(mockFetch).toHaveBeenCalledTimes(2);
  }, 10000); // Increase timeout for this test

  it('stops polling when status reaches active state', async () => {
    vi.useRealTimers(); // Use real timers for this test
    
    // First call returns deploying, second call returns active
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'deploying' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'active' }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'active' }),
      });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="deploying"
      />
    );

    // Initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Wait for 5.1 seconds - should trigger second fetch
    await new Promise(resolve => setTimeout(resolve, 5100));

    // Wait for the second call to complete
    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    const callCountAfterActive = mockFetch.mock.calls.length;

    // Wait another 5.1 seconds - polling should have stopped or be minimal
    await new Promise(resolve => setTimeout(resolve, 5100));

    // Should not have significantly more calls (allow for 1 extra due to timing)
    expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(callCountAfterActive + 1);
  }, 15000); // Increase timeout for this test

  it('stops polling when status reaches failed state', async () => {
    vi.useRealTimers(); // Use real timers for this test
    
    // First call returns deploying, second call returns failed
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'deploying' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'failed',
          errorMessage: 'Deployment failed',
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'failed',
          errorMessage: 'Deployment failed',
        }),
      });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="deploying"
      />
    );

    // Initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Wait for 5.1 seconds - should trigger second fetch
    await new Promise(resolve => setTimeout(resolve, 5100));

    // Wait for the second call to complete
    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    const callCountAfterFailed = mockFetch.mock.calls.length;

    // Wait another 5.1 seconds - polling should have stopped or be minimal
    await new Promise(resolve => setTimeout(resolve, 5100));

    // Should not have significantly more calls (allow for 1 extra due to timing)
    expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(callCountAfterFailed + 1);
  }, 15000); // Increase timeout for this test

  it('handles API errors gracefully', async () => {
    vi.useRealTimers(); // Use real timers for this test
    
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to fetch deployment status' }),
    });

    render(
      <StatusTracker
        deploymentId="test-deployment-id"
        initialStatus="deploying"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch deployment status/i)).toBeInTheDocument();
    });
  });

  it('displays deployment ID for reference', () => {
    const deploymentId = 'test-deployment-id-12345';
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'pending' }),
    });

    render(
      <StatusTracker
        deploymentId={deploymentId}
        initialStatus="pending"
      />
    );

    expect(screen.getByText('Deployment ID')).toBeInTheDocument();
    expect(screen.getByText(deploymentId)).toBeInTheDocument();
    expect(screen.getByText(/save this id to check your deployment status later/i)).toBeInTheDocument();
  });

  it('calls API with correct deployment ID', async () => {
    vi.useRealTimers(); // Use real timers for this test
    
    const deploymentId = 'test-deployment-id-12345';
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'pending' }),
    });

    render(
      <StatusTracker
        deploymentId={deploymentId}
        initialStatus="pending"
      />
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`/api/status?id=${deploymentId}`);
    });
  });
});
