import { generateSDLTemplate } from './sdl.template';

/**
 * Parameters for generating SDL configuration
 */
export interface SDLParams {
  telegramBotToken: string;
  gatewayToken?: string;
}

/**
 * Parameters for deploying a bot to Akash
 */
export interface DeploymentParams {
  akashApiKey: string;
  telegramBotToken: string;
  gatewayToken?: string;
  depositUsd?: number;
}

/**
 * Result of a successful deployment
 */
export interface DeploymentResult {
  dseq: string;
  provider: string;
  serviceUrl: string | null;
}

/**
 * Akash bid ID structure
 */
export interface BidID {
  owner: string;
  dseq: string;
  gseq: number;
  oseq: number;
  provider: string;
  bseq: number;
}

/**
 * Akash bid from a provider
 */
export interface AkashBid {
  id: BidID;
  state: string;
  price: {
    amount: string;
    denom: string;
  };
  created_at: string;
}

/**
 * Response from Akash deployment creation
 */
export interface AkashDeploymentResponse {
  data: {
    dseq: string;
    manifest: string;
  };
}

/**
 * Bid response wrapper from Akash API
 */
export interface BidResponse {
  bid: AkashBid;
  escrow_account: {
    id: { scope: string; xid: string };
    state: {
      owner: string;
      state: string;
      transferred: { denom: string; amount: string }[];
      settled_at: string;
      funds: { denom: string; amount: string }[];
    };
  };
  isCertificateRequired: boolean;
}

/**
 * Response from fetching bids
 */
export interface BidsResponse {
  data: BidResponse[];
}

/**
 * Lease status information
 */
export interface LeaseStatus {
  forwarded_ports: Record<string, { port: number; externalPort: number; host?: string }[]>;
  ips: Record<string, { IP: string; Port: number; ExternalPort: number; Protocol: string }[]>;
  services: Record<string, {
    name: string;
    available: number;
    total: number;
    uris: string[];
    observed_generation: number;
    replicas: number;
    updated_replicas: number;
    ready_replicas: number;
    available_replicas: number;
  }>;
}

/**
 * Response from Akash lease creation
 */
export interface AkashLeaseResponse {
  data: {
    deployment: {
      id: { owner: string; dseq: string };
      state: string;
      hash: string;
      created_at: string;
    };
    leases: {
      id: BidID;
      state: string;
      price: { denom: string; amount: string };
      created_at: string;
      closed_on: string;
      status: LeaseStatus | null;
    }[];
    escrow_account: {
      id: { scope: string; xid: string };
      state: {
        owner: string;
        state: string;
        transferred: { denom: string; amount: string }[];
        settled_at: string;
        funds: { denom: string; amount: string }[];
      };
    };
  };
}

/**
 * Generates an Akash SDL (Service Definition Language) configuration
 * for deploying an OpenClaw bot with Telegram integration.
 * 
 * The SDL defines:
 * - Container image (ghcr.io/fenilmodi00/openclaw:latest)
 * - Environment variables for AkashML API and Telegram bot
 * - Model: meta-llama/Llama-3.3-70B-Instruct via AkashML
 * - Two exposed ports: 18789 (gateway) and 18790 (bridge)
 * - Resource requirements (1 CPU, 2GB memory, 1GB ephemeral + 5GB persistent storage)
 * - Persistent storage for OpenClaw workspace
 * - Pricing in IBC token
 * 
 * @param params - Configuration parameters including Telegram bot token
 * @returns SDL configuration as a YAML string
 * 
 * @example
 * ```typescript
 * const sdl = generateSDL({
 *   telegramBotToken: '123456:ABC-DEF...',
 *   gatewayToken: '2002'
 * });
 * ```
 */
/**
 * Sanitizes a value before interpolation into SDL YAML templates.
 * Strips characters that could break YAML structure or inject additional env vars.
 *
 * @param value - The raw string value to sanitize
 * @returns Sanitized string safe for SDL interpolation
 */
function sanitizeEnvValue(value: string): string {
  // Remove newlines, carriage returns, and null bytes that could inject YAML
  return value.replace(/[\n\r\0]/g, '');
}

/**
 * Base URL for Akash Console API
 */
const AKASH_CONSOLE_API_BASE = 'https://console-api.akash.network';

/**
 * Maximum number of polling attempts for bids
 */
const MAX_BID_POLL_ATTEMPTS = 20;

/**
 * Polling interval in milliseconds (3 seconds as recommended by Akash docs)
 */
const BID_POLL_INTERVAL_MS = 3000;

/**
 * Maximum timeout for bid polling in milliseconds (60 seconds typical)
 */
const BID_POLL_TIMEOUT_MS = 60 * 1000;

/**
 * Minimum deposit amount in USD (as per Akash Console API requirements)
 */
const MIN_DEPOSIT_USD = 5;

/**
 * AkashService handles all logic related to interacting with the Akash Network,
 * including SDL generation, deployment creation, bid polling, and lease management.
 */
export class AkashService {
  /**
   * Generates the SDL (Stack Definition Language) configuration for Akash deployment.
   * interpolates sensitive tokens and configuration values into the YAML template.
   * 
   * WARNING: The AKASHML_KEY is currently baked into the SDL, which is a security risk.
   * TODO: Move AKASHML_KEY to a separate secret management system or use Akash secrets.
   */
  generateSDL(params: { telegramBotToken: string; gatewayToken?: string }): string {
    const { telegramBotToken, gatewayToken = '2002' } = params;

    // Get AkashML API key from environment
    const akashmlApiKey = process.env.AKASHML_KEY || '';
    if (!akashmlApiKey) {
      console.warn('AKASHML_KEY is not configured in environment');
    }

    // Sanitize values (Requirement 4.3)
    const safeBotToken = sanitizeEnvValue(telegramBotToken);
    const safeGatewayToken = sanitizeEnvValue(gatewayToken);

    return generateSDLTemplate({
      akashmlApiKey,
      safeBotToken,
      safeGatewayToken,
    });
  }

  /**
   * Creates a deployment on Akash Network
   */
  async createDeployment(
    sdl: string,
    apiKey: string,
    depositUsd: number = MIN_DEPOSIT_USD
  ): Promise<AkashDeploymentResponse> {
    if (depositUsd < MIN_DEPOSIT_USD) {
      throw new Error(`Deposit must be at least $${MIN_DEPOSIT_USD} USD`);
    }

    const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/deployments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        data: {
          sdl,
          deposit: depositUsd,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create deployment (${response.status}): ${errorText}`);
    }

    const data: AkashDeploymentResponse = await response.json();
    if (!data.data?.dseq || !data.data?.manifest) {
      throw new Error('Invalid deployment response: missing dseq or manifest');
    }
    return data;
  }

  /**
   * Polls for provider bids on a deployment
   */
  async pollForBids(dseq: string, apiKey: string): Promise<BidResponse[]> {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < MAX_BID_POLL_ATTEMPTS) {
      if (Date.now() - startTime > BID_POLL_TIMEOUT_MS) {
        throw new Error(`Bid polling timed out after ${BID_POLL_TIMEOUT_MS / 1000} seconds`);
      }

      attempt++;
      try {
        const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/bids?dseq=${dseq}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
        });

        if (response.ok) {
          const data: BidsResponse = await response.json();
          if (data.data?.length > 0) return data.data;
        }
      } catch (error) {
        console.error(`Bid polling attempt ${attempt} error:`, error);
      }

      if (attempt < MAX_BID_POLL_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, BID_POLL_INTERVAL_MS));
      }
    }
    throw new Error(`No bids received after ${MAX_BID_POLL_ATTEMPTS} attempts`);
  }

  /**
   * Selects the bid with the lowest price
   */
  selectCheapestBid(bidResponses: BidResponse[]): BidResponse {
    if (!bidResponses?.length) throw new Error('Cannot select bid from empty array');
    return bidResponses.reduce((cheapest, current) => {
      return parseFloat(current.bid.price.amount) < parseFloat(cheapest.bid.price.amount) ? current : cheapest;
    });
  }

  /**
   * Creates a lease with the selected provider
   */
  async createLease(
    manifest: string,
    dseq: string,
    bidResponse: BidResponse,
    apiKey: string
  ): Promise<AkashLeaseResponse> {
    const { id: bidId } = bidResponse.bid;
    const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/leases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        manifest,
        leases: [{ dseq, gseq: bidId.gseq, oseq: bidId.oseq, provider: bidId.provider }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create lease (${response.status}): ${errorText}`);
    }

    const data: AkashLeaseResponse = await response.json();
    if (!data.data?.leases?.length) throw new Error('Invalid lease response: no leases created');
    return data;
  }

  /**
   * Extracts the service URL from lease status
   */
  extractServiceUrl(leaseResponse: AkashLeaseResponse): string | null {
    try {
      const lease = leaseResponse.data.leases[0];
      if (!lease.status) return null;
      for (const serviceName in lease.status.services) {
        const uris = lease.status.services[serviceName].uris;
        if (uris?.length) return uris[0];
      }
    } catch (error) {
      console.error('Error extracting service URL:', error);
    }
    return null;
  }

  /**
   * Closes a deployment and recovers remaining deposit
   */
  async closeDeployment(dseq: string, apiKey: string): Promise<{ success: boolean }> {
    const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/deployments/${dseq}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to close deployment (${response.status}): ${errorText}`);
    }

    return { success: true };
  }

  /**
   * Orchestrates the full deployment flow
   */
  async deployBot(params: DeploymentParams): Promise<DeploymentResult> {
    const { akashApiKey, telegramBotToken, gatewayToken, depositUsd = MIN_DEPOSIT_USD } = params;

    // Step 1: Generate SDL
    const sdl = this.generateSDL({
      telegramBotToken,
      gatewayToken: gatewayToken || '2002'
    });

    // Step 2: Create deployment
    const deploymentResponse = await this.createDeployment(sdl, akashApiKey, depositUsd);
    const { dseq, manifest } = deploymentResponse.data;

    // Step 3: Poll for bids
    const bids = await this.pollForBids(dseq, akashApiKey);

    // Step 4: Select cheapest bid
    const selectedBid = this.selectCheapestBid(bids);
    const provider = selectedBid.bid.id.provider;

    // Step 5: Create lease
    const leaseResponse = await this.createLease(manifest, dseq, selectedBid, akashApiKey);

    // Step 6: Extract service URL
    const serviceUrl = this.extractServiceUrl(leaseResponse);

    return { dseq, provider, serviceUrl };
  }
}

// Lazy-loaded singleton instance
let _akashService: AkashService | null = null;

export function getAkashService(): AkashService {
  if (!_akashService) {
    _akashService = new AkashService();
  }
  return _akashService;
}

// Export singleton proxy
export const akashService = new Proxy({} as AkashService, {
  get(_target, prop) {
    const service = getAkashService();
    return service[prop as keyof AkashService];
  }
});

// Backward compatibility exports
export const generateSDL = (params: SDLParams) => akashService.generateSDL(params);
export const createDeployment = (sdl: string, key: string, dep?: number) => akashService.createDeployment(sdl, key, dep);
export const pollForBids = (dseq: string, key: string) => akashService.pollForBids(dseq, key);
export const selectCheapestBid = (bids: BidResponse[]) => akashService.selectCheapestBid(bids);
export const createLease = (man: string, ds: string, bid: BidResponse, key: string) => akashService.createLease(man, ds, bid, key);
export const extractServiceUrl = (lease: AkashLeaseResponse) => akashService.extractServiceUrl(lease);
export const closeDeployment = (dseq: string, key: string) => akashService.closeDeployment(dseq, key);
export const deployBot = (params: DeploymentParams) => akashService.deployBot(params);

