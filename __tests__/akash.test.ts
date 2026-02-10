import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSDL, selectCheapestBid, createDeployment, createLease, extractServiceUrl, pollForBids, deployBot } from '../lib/akash';
import type { BidResponse } from '../lib/akash';

describe('generateSDL', () => {
  it('should generate valid SDL for Claude Opus 4.5 with Telegram', () => {
    const sdl = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
      channelApiKey: 'sk-ant-test-key',
    });

    expect(sdl).toContain('version: "2.0"');
    expect(sdl).toContain('image: ghcr.io/openclaw/openclaw:latest');
    expect(sdl).toContain('MODEL=claude-opus-4.5');
    expect(sdl).toContain('CHANNEL=telegram');
    expect(sdl).toContain('CHANNEL_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
    expect(sdl).toContain('CHANNEL_API_KEY=sk-ant-test-key');
  });

  it('should generate valid SDL for GPT 3.2 with Discord', () => {
    const sdl = generateSDL({
      model: 'gpt-3.2',
      channel: 'discord',
      channelToken: 'discord-bot-token',
      channelApiKey: 'sk-proj-openai-key',
    });

    expect(sdl).toContain('MODEL=gpt-3.2');
    expect(sdl).toContain('CHANNEL=discord');
    expect(sdl).toContain('CHANNEL_TOKEN=discord-bot-token');
    expect(sdl).toContain('CHANNEL_API_KEY=sk-proj-openai-key');
  });

  it('should generate valid SDL for Gemini 3 Flash with WhatsApp', () => {
    const sdl = generateSDL({
      model: 'gemini-3-flash',
      channel: 'whatsapp',
      channelToken: 'whatsapp-token',
      channelApiKey: 'google-api-key',
    });

    expect(sdl).toContain('MODEL=gemini-3-flash');
    expect(sdl).toContain('CHANNEL=whatsapp');
    expect(sdl).toContain('CHANNEL_TOKEN=whatsapp-token');
    expect(sdl).toContain('CHANNEL_API_KEY=google-api-key');
  });

  it('should generate SDL without optional API key', () => {
    const sdl = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF',
    });

    expect(sdl).toContain('MODEL=claude-opus-4.5');
    expect(sdl).toContain('CHANNEL=telegram');
    expect(sdl).toContain('CHANNEL_TOKEN=123456:ABC-DEF');
    expect(sdl).not.toContain('CHANNEL_API_KEY');
  });

  it('should include all required SDL sections', () => {
    const sdl = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF',
    });

    // Check for all major SDL sections
    expect(sdl).toContain('services:');
    expect(sdl).toContain('profiles:');
    expect(sdl).toContain('compute:');
    expect(sdl).toContain('placement:');
    expect(sdl).toContain('deployment:');
  });

  it('should include correct resource specifications', () => {
    const sdl = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF',
    });

    expect(sdl).toContain('cpu:');
    expect(sdl).toContain('units: 2');
    expect(sdl).toContain('memory:');
    expect(sdl).toContain('size: 4Gi');
    expect(sdl).toContain('storage:');
    expect(sdl).toContain('size: 2Gi');
    expect(sdl).toContain('size: 10Gi');
    expect(sdl).toContain('persistent: "true"');
  });

  it('should include correct network exposure settings', () => {
    const sdl = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF',
    });

    expect(sdl).toContain('expose:');
    expect(sdl).toContain('port: 8080');
    expect(sdl).toContain('as: 80');
    expect(sdl).toContain('global: true');
  });

  it('should include correct pricing configuration', () => {
    const sdl = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF',
    });

    expect(sdl).toContain('pricing:');
    expect(sdl).toContain('denom: uakt');
    expect(sdl).toContain('amount: 1000');
  });

  it('should properly handle special characters in environment variables', () => {
    const sdl = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF_special-chars',
      channelApiKey: 'sk-proj-test123',
    });

    expect(sdl).toContain('CHANNEL_TOKEN=123456:ABC-DEF_special-chars');
    expect(sdl).toContain('CHANNEL_API_KEY=sk-proj-test123');
  });

  it('should generate different SDL for different models', () => {
    const sdlClaude = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF',
    });
    const sdlGPT = generateSDL({
      model: 'gpt-3.2',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF',
    });
    const sdlGemini = generateSDL({
      model: 'gemini-3-flash',
      channel: 'telegram',
      channelToken: '123456:ABC-DEF',
    });

    // Each should be unique due to different model values
    expect(sdlClaude).not.toBe(sdlGPT);
    expect(sdlClaude).not.toBe(sdlGemini);
    expect(sdlGPT).not.toBe(sdlGemini);
  });

  it('should generate different SDL for different channels', () => {
    const sdlTelegram = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: 'token1',
    });
    const sdlDiscord = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'discord',
      channelToken: 'token2',
    });
    const sdlWhatsApp = generateSDL({
      model: 'claude-opus-4.5',
      channel: 'whatsapp',
      channelToken: 'token3',
    });

    // Each should be unique due to different channel values
    expect(sdlTelegram).not.toBe(sdlDiscord);
    expect(sdlTelegram).not.toBe(sdlWhatsApp);
    expect(sdlDiscord).not.toBe(sdlWhatsApp);
  });
});

describe('selectCheapestBid', () => {
  it('should select the bid with the lowest price', () => {
    const bids: BidResponse[] = [
      {
        bid: {
          id: { owner: 'owner1', dseq: '1', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
          state: 'open',
          price: { amount: '1000', denom: 'uakt' },
          created_at: '2024-01-01',
        },
        escrow_account: {
          id: { scope: 'deployment', xid: '1' },
          state: {
            owner: 'owner1',
            state: 'open',
            transferred: [],
            settled_at: '2024-01-01',
            funds: [],
          },
        },
        isCertificateRequired: false,
      },
      {
        bid: {
          id: { owner: 'owner2', dseq: '1', gseq: 1, oseq: 1, provider: 'provider2', bseq: 2 },
          state: 'open',
          price: { amount: '500', denom: 'uakt' },
          created_at: '2024-01-01',
        },
        escrow_account: {
          id: { scope: 'deployment', xid: '1' },
          state: {
            owner: 'owner2',
            state: 'open',
            transferred: [],
            settled_at: '2024-01-01',
            funds: [],
          },
        },
        isCertificateRequired: false,
      },
      {
        bid: {
          id: { owner: 'owner3', dseq: '1', gseq: 1, oseq: 1, provider: 'provider3', bseq: 3 },
          state: 'open',
          price: { amount: '750', denom: 'uakt' },
          created_at: '2024-01-01',
        },
        escrow_account: {
          id: { scope: 'deployment', xid: '1' },
          state: {
            owner: 'owner3',
            state: 'open',
            transferred: [],
            settled_at: '2024-01-01',
            funds: [],
          },
        },
        isCertificateRequired: false,
      },
    ];

    const cheapest = selectCheapestBid(bids);
    expect(cheapest.bid.id.provider).toBe('provider2');
    expect(cheapest.bid.price.amount).toBe('500');
  });

  it('should handle single bid', () => {
    const bids: BidResponse[] = [
      {
        bid: {
          id: { owner: 'owner1', dseq: '1', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
          state: 'open',
          price: { amount: '1000', denom: 'uakt' },
          created_at: '2024-01-01',
        },
        escrow_account: {
          id: { scope: 'deployment', xid: '1' },
          state: {
            owner: 'owner1',
            state: 'open',
            transferred: [],
            settled_at: '2024-01-01',
            funds: [],
          },
        },
        isCertificateRequired: false,
      },
    ];

    const cheapest = selectCheapestBid(bids);
    expect(cheapest.bid.id.provider).toBe('provider1');
  });

  it('should throw error for empty bid array', () => {
    expect(() => selectCheapestBid([])).toThrow('Cannot select bid from empty array');
  });

  it('should handle bids with same price', () => {
    const bids: BidResponse[] = [
      {
        bid: {
          id: { owner: 'owner1', dseq: '1', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
          state: 'open',
          price: { amount: '500', denom: 'uakt' },
          created_at: '2024-01-01',
        },
        escrow_account: {
          id: { scope: 'deployment', xid: '1' },
          state: {
            owner: 'owner1',
            state: 'open',
            transferred: [],
            settled_at: '2024-01-01',
            funds: [],
          },
        },
        isCertificateRequired: false,
      },
      {
        bid: {
          id: { owner: 'owner2', dseq: '1', gseq: 1, oseq: 1, provider: 'provider2', bseq: 2 },
          state: 'open',
          price: { amount: '500', denom: 'uakt' },
          created_at: '2024-01-01',
        },
        escrow_account: {
          id: { scope: 'deployment', xid: '1' },
          state: {
            owner: 'owner2',
            state: 'open',
            transferred: [],
            settled_at: '2024-01-01',
            funds: [],
          },
        },
        isCertificateRequired: false,
      },
    ];

    const cheapest = selectCheapestBid(bids);
    // Should return the first one when prices are equal
    expect(cheapest.bid.id.provider).toBe('provider1');
  });

  it('should handle decimal prices', () => {
    const bids: BidResponse[] = [
      {
        bid: {
          id: { owner: 'owner1', dseq: '1', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
          state: 'open',
          price: { amount: '1000.5', denom: 'uakt' },
          created_at: '2024-01-01',
        },
        escrow_account: {
          id: { scope: 'deployment', xid: '1' },
          state: {
            owner: 'owner1',
            state: 'open',
            transferred: [],
            settled_at: '2024-01-01',
            funds: [],
          },
        },
        isCertificateRequired: false,
      },
      {
        bid: {
          id: { owner: 'owner2', dseq: '1', gseq: 1, oseq: 1, provider: 'provider2', bseq: 2 },
          state: 'open',
          price: { amount: '999.9', denom: 'uakt' },
          created_at: '2024-01-01',
        },
        escrow_account: {
          id: { scope: 'deployment', xid: '1' },
          state: {
            owner: 'owner2',
            state: 'open',
            transferred: [],
            settled_at: '2024-01-01',
            funds: [],
          },
        },
        isCertificateRequired: false,
      },
    ];

    const cheapest = selectCheapestBid(bids);
    expect(cheapest.bid.id.provider).toBe('provider2');
  });
});

describe('createDeployment', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should make correct API call to Akash Console API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          dseq: 'test-deployment-123',
          manifest: 'test-manifest',
        },
      }),
    });
    global.fetch = mockFetch;

    const sdl = 'version: "2.0"...';
    const apiKey = 'test-api-key';

    const result = await createDeployment(sdl, apiKey, 5);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://console-api.akash.network/v1/deployments',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'test-api-key',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          data: {
            sdl,
            deposit: 5,
          },
        }),
      })
    );

    expect(result.data.dseq).toBe('test-deployment-123');
    expect(result.data.manifest).toBe('test-manifest');
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });
    global.fetch = mockFetch;

    await expect(createDeployment('sdl', 'bad-key')).rejects.toThrow('Akash deployment creation failed');
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    await expect(createDeployment('sdl', 'key')).rejects.toThrow('Akash deployment creation failed');
  });

  it('should enforce minimum deposit', async () => {
    await expect(createDeployment('sdl', 'key', 3)).rejects.toThrow('Deposit must be at least $5 USD');
  });
});

describe('createLease', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should make correct API call to create lease', async () => {
    const mockBidResponse: BidResponse = {
      bid: {
        id: { owner: 'owner1', dseq: '123', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
        state: 'open',
        price: { amount: '1000', denom: 'uakt' },
        created_at: '2024-01-01',
      },
      escrow_account: {
        id: { scope: 'deployment', xid: '123' },
        state: {
          owner: 'owner1',
          state: 'open',
          transferred: [],
          settled_at: '2024-01-01',
          funds: [],
        },
      },
      isCertificateRequired: false,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          deployment: {
            id: { owner: 'owner1', dseq: '123' },
            state: 'active',
            hash: 'hash123',
            created_at: '2024-01-01',
          },
          leases: [
            {
              id: mockBidResponse.bid.id,
              state: 'active',
              price: { denom: 'uakt', amount: '1000' },
              created_at: '2024-01-01',
              closed_on: '',
              status: null,
            },
          ],
          escrow_account: mockBidResponse.escrow_account,
        },
      }),
    });
    global.fetch = mockFetch;

    const result = await createLease('test-manifest', '123', mockBidResponse, 'test-api-key');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://console-api.akash.network/v1/leases',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'test-api-key',
          'Content-Type': 'application/json',
        }),
      })
    );

    expect(result.data.leases).toHaveLength(1);
    expect(result.data.leases[0].state).toBe('active');
  });

  it('should handle lease creation errors', async () => {
    const mockBidResponse: BidResponse = {
      bid: {
        id: { owner: 'owner1', dseq: '123', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
        state: 'open',
        price: { amount: '1000', denom: 'uakt' },
        created_at: '2024-01-01',
      },
      escrow_account: {
        id: { scope: 'deployment', xid: '123' },
        state: {
          owner: 'owner1',
          state: 'open',
          transferred: [],
          settled_at: '2024-01-01',
          funds: [],
        },
      },
      isCertificateRequired: false,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Invalid bid',
    });
    global.fetch = mockFetch;

    await expect(createLease('manifest', '123', mockBidResponse, 'key')).rejects.toThrow('Akash lease creation failed');
  });
});

describe('pollForBids', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return bids on first successful attempt', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            bid: {
              id: { owner: 'owner1', dseq: '123', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
              state: 'open',
              price: { amount: '1000', denom: 'uakt' },
              created_at: '2024-01-01',
            },
            escrow_account: {
              id: { scope: 'deployment', xid: '123' },
              state: {
                owner: 'owner1',
                state: 'open',
                transferred: [],
                settled_at: '2024-01-01',
                funds: [],
              },
            },
            isCertificateRequired: false,
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const bids = await pollForBids('123', 'test-api-key');

    expect(bids).toHaveLength(1);
    expect(bids[0].bid.id.provider).toBe('provider1');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry until bids are available', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: [
            {
              bid: {
                id: { owner: 'owner1', dseq: '123', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
                state: 'open',
                price: { amount: '1000', denom: 'uakt' },
                created_at: '2024-01-01',
              },
              escrow_account: {
                id: { scope: 'deployment', xid: '123' },
                state: {
                  owner: 'owner1',
                  state: 'open',
                  transferred: [],
                  settled_at: '2024-01-01',
                  funds: [],
                },
              },
              isCertificateRequired: false,
            },
          ],
        }),
      });
    });
    global.fetch = mockFetch;

    const bids = await pollForBids('123', 'test-api-key');

    expect(bids).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  }, 30000); // Increase timeout for this test

  it('should handle API errors during polling', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 2) {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: async () => 'Server error',
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: [
            {
              bid: {
                id: { owner: 'owner1', dseq: '123', gseq: 1, oseq: 1, provider: 'provider1', bseq: 1 },
                state: 'open',
                price: { amount: '1000', denom: 'uakt' },
                created_at: '2024-01-01',
              },
              escrow_account: {
                id: { scope: 'deployment', xid: '123' },
                state: {
                  owner: 'owner1',
                  state: 'open',
                  transferred: [],
                  settled_at: '2024-01-01',
                  funds: [],
                },
              },
              isCertificateRequired: false,
            },
          ],
        }),
      });
    });
    global.fetch = mockFetch;

    const bids = await pollForBids('123', 'test-api-key');
    expect(bids).toHaveLength(1);
  }, 30000);
});

describe('deployBot', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error if deployment creation fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });
    global.fetch = mockFetch;

    await expect(deployBot({
      akashApiKey: 'bad-key',
      model: 'claude-opus-4.5',
      channel: 'telegram',
      channelToken: '123456:ABC',
      channelApiKey: 'sk-test',
    })).rejects.toThrow();
  });
});
