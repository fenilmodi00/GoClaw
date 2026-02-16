import { generateSDLTemplate } from './sdl.template';
import { isRetryableAkashError, isProviderUnavailableError, type DeploymentDetails } from '@/lib/akash-utils';
import { AkashAllProvidersFailedError, AkashCertificateError } from '@/lib/errors';
import { getProviderBlacklistRepository } from '@/db/repositories/blacklist-repository';

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
 * - Container image (ghcr.io/fenilmodi00/openclaw-docker:main-0a3827a)
 * - Environment variables for AkashML API and Telegram bot
 * - Model: MiniMaxAI/MiniMax-M2.5 via AkashML
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
  // Remove newlines, carriage returns, and null bytes
  const clean = value.replace(/[\n\r\0]/g, '');
  // Escape double quotes and backslashes for YAML double-quoted string
  return clean.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Base URL for Akash Console API
 */
const AKASH_CONSOLE_API_BASE = process.env.AKASH_CONSOLE_API_URL || 'https://console-api.akash.network';

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
 * Maximum retries for lease creation
 */
const LEASE_MAX_RETRIES = 3;

/**
 * Base delay for lease retry (exponential backoff)
 */
const LEASE_RETRY_BASE_DELAY_MS = 2000;

/**
 * Timeout for provider health check
 */
const PROVIDER_HEALTH_CHECK_TIMEOUT = 10000;

/**
 * AkashService handles all logic related to interacting with the Akash Network,
 * including SDL generation, deployment creation, bid polling, and lease management.
 */
export class AkashService {
  /**
   * Generates the SDL (Stack Definition Language) configuration for Akash deployment.
   * interpolates sensitive tokens and configuration values into the YAML template.
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
   * Creates a lease with the selected provider (with retry logic)
   */
  async createLease(
    manifest: string,
    dseq: string,
    bidResponse: BidResponse,
    apiKey: string
  ): Promise<AkashLeaseResponse> {
    const { id: bidId } = bidResponse.bid;
    const provider = bidId.provider;
    let lastError: Error;

    for (let attempt = 1; attempt <= LEASE_MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/leases`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            manifest,
            leases: [{ dseq, gseq: bidId.gseq, oseq: bidId.oseq, provider }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          if ([429, 503, 504].includes(response.status) && attempt < LEASE_MAX_RETRIES) {
            const delay = LEASE_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
            console.warn(`Provider ${provider} returned ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${LEASE_MAX_RETRIES})`);
            lastError = new Error(`HTTP ${response.status}: ${errorText}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new Error(`Failed to create lease (${response.status}): ${errorText}`);
        }

        const data: AkashLeaseResponse = await response.json();
        if (!data.data?.leases?.length) throw new Error('Invalid lease response: no leases created');
        return data;
      } catch (error) {
        lastError = error as Error;
        
        if (isRetryableAkashError(lastError) && attempt < LEASE_MAX_RETRIES) {
          const delay = LEASE_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(`Retryable error for provider ${provider}: ${lastError.message}, retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw lastError;
      }
    }

    throw lastError!;
  }

  /**
   * Checks if a provider is healthy by making a request to their status endpoint
   */
  async checkProviderHealth(providerUri: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PROVIDER_HEALTH_CHECK_TIMEOUT);

      const response = await fetch(`${providerUri}/status`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      const err = error as Error;
      console.warn(`Provider health check failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Gets provider details from Akash API
   */
  async getProviderDetails(providerAddress: string, apiKey: string): Promise<{ uri: string; status: string } | null> {
    try {
      const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/providers/${providerAddress}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        console.warn(`Failed to get provider details for ${providerAddress}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return {
        uri: data.data?.uri || `https://${providerAddress}:8443`,
        status: data.data?.status || 'unknown',
      };
    } catch (error) {
      console.warn(`Error getting provider details for ${providerAddress}:`, error);
      return null;
    }
  }

  /**
   * Checks if a valid certificate exists, creates one if not
   */
  async ensureCertificate(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AkashCertificateError(`Failed to create certificate: ${errorText}`);
      }

      return true;
    } catch (error) {
      if (error instanceof AkashCertificateError) {
        throw error;
      }
      const err = error as Error;
      if (err.message.includes('already exists')) {
        return true;
      }
      throw new AkashCertificateError(err.message);
    }
  }

  /**
    * Gets deployment details
    */
  async getDeploymentDetails(dseq: string, apiKey: string): Promise<DeploymentDetails | null> {
    try {
      const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/deployments/${dseq}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json() as DeploymentDetails;
    } catch (error) {
      console.error(`Error getting deployment details for ${dseq}:`, error);
      return null;
    }
  }

  /**
   * Sorts bids by price (cheapest first)
   */
  sortBidsByPrice(bidResponses: BidResponse[]): BidResponse[] {
    if (!bidResponses?.length) return [];
    return [...bidResponses].sort((a, b) => 
      parseFloat(a.bid.price.amount) - parseFloat(b.bid.price.amount)
    );
  }

  /**
   * Filters out blacklisted providers from bids
   */
  async filterBlacklistedBids(bidResponses: BidResponse[]): Promise<BidResponse[]> {
    const blacklistRepo = getProviderBlacklistRepository();
    const blacklistedProviders = await blacklistRepo.getAllBlacklistedProviders();
    
    if (blacklistedProviders.size === 0) {
      return bidResponses;
    }

    const filtered = bidResponses.filter(bid => {
      const provider = bid.bid.id.provider;
      if (blacklistedProviders.has(provider)) {
        console.log(`Skipping blacklisted provider: ${provider}`);
        return false;
      }
      return true;
    });

    console.log(`Filtered out ${bidResponses.length - filtered.length} blacklisted provider(s)`);
    return filtered;
  }

  /**
   * Tries to create a lease with multiple providers until one succeeds
   */
  async tryAllBidsUntilSuccess(
    manifest: string,
    dseq: string,
    bids: BidResponse[],
    apiKey: string
  ): Promise<{ leaseResponse: AkashLeaseResponse; provider: string }> {
    const sortedBids = this.sortBidsByPrice(bids);
    const failedProviders: string[] = [];
    let lastError: Error = new Error('All providers failed');

    for (let i = 0; i < sortedBids.length; i++) {
      const bid = sortedBids[i];
      const provider = bid.bid.id.provider;
      
      console.log(`Trying provider ${i + 1}/${sortedBids.length}: ${provider} (price: ${bid.bid.price.amount} ${bid.bid.price.denom})`);

      try {
        const providerDetails = await this.getProviderDetails(provider, apiKey);
        
        if (providerDetails) {
          console.log(`Checking health of provider ${provider} at ${providerDetails.uri}`);
          const isHealthy = await this.checkProviderHealth(providerDetails.uri);
          
          if (!isHealthy) {
            console.warn(`Provider ${provider} failed health check, proceeding anyway...`);
          }
        }

        const leaseResponse = await this.createLease(manifest, dseq, bid, apiKey);
        
        console.log(`Successfully created lease with provider ${provider}`);
        return { leaseResponse, provider };
      } catch (error) {
        lastError = error as Error;
        failedProviders.push(provider);
        
        if (isProviderUnavailableError(lastError)) {
          console.warn(`Provider ${provider} unavailable: ${lastError.message}, trying next provider...`);
          continue;
        }
        
        if (!isRetryableAkashError(lastError)) {
          console.error(`Non-retryable error from provider ${provider}: ${lastError.message}`);
          throw lastError;
        }
        
        console.warn(`Error with provider ${provider}: ${lastError.message}, trying next provider...`);
      }
    }

    throw new AkashAllProvidersFailedError(
      failedProviders, 
      lastError?.message || 'All providers failed',
      dseq
    );
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
   * Orchestrates the full deployment flow with robust error handling
   */
  async deployBot(params: DeploymentParams): Promise<DeploymentResult> {
    const { akashApiKey, telegramBotToken, gatewayToken, depositUsd = MIN_DEPOSIT_USD } = params;

    try {
      // Step 1: Ensure valid certificate exists
      console.log('Ensuring valid certificate exists...');
      await this.ensureCertificate(akashApiKey);

      // Step 2: Generate SDL
      const sdl = this.generateSDL({
        telegramBotToken,
        gatewayToken: gatewayToken || '2002'
      });

      // Step 3: Create deployment
      console.log('Creating deployment on Akash...');
      const deploymentResponse = await this.createDeployment(sdl, akashApiKey, depositUsd);
      const { dseq, manifest } = deploymentResponse.data;
      console.log(`Deployment created with dseq: ${dseq}`);

      // Step 4: Poll for bids
      console.log('Waiting for provider bids...');
      const bids = await this.pollForBids(dseq, akashApiKey);
      console.log(`Received ${bids.length} bid(s)`);

      // Step 5: Filter out blacklisted providers
      const validBids = await this.filterBlacklistedBids(bids);
      if (validBids.length === 0) {
        throw new AkashAllProvidersFailedError(
          bids.map(b => b.bid.id.provider),
          'All available providers are blacklisted',
          dseq
        );
      }
      console.log(`Proceeding with ${validBids.length} valid provider(s)`);

      // Step 6: Try all bids until one succeeds (with health checks and retries)
      console.log('Attempting to create lease with providers...');
      const { leaseResponse, provider } = await this.tryAllBidsUntilSuccess(
        manifest,
        dseq,
        validBids,
        akashApiKey
      );

      // Step 6: Extract service URL
      const serviceUrl = this.extractServiceUrl(leaseResponse);
      console.log(`Deployment successful! Provider: ${provider}, Service URL: ${serviceUrl}`);

      return { dseq, provider, serviceUrl };
    } catch (error) {
      console.error('Deployment failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const akashService = new AkashService();

// Backward compatibility exports
export const generateSDL = (params: SDLParams) => akashService.generateSDL(params);
export const createDeployment = (sdl: string, key: string, dep?: number) => akashService.createDeployment(sdl, key, dep);
export const pollForBids = (dseq: string, key: string) => akashService.pollForBids(dseq, key);
export const selectCheapestBid = (bids: BidResponse[]) => akashService.selectCheapestBid(bids);
export const sortBidsByPrice = (bids: BidResponse[]) => akashService.sortBidsByPrice(bids);
export const createLease = (man: string, ds: string, bid: BidResponse, key: string) => akashService.createLease(man, ds, bid, key);
export const extractServiceUrl = (lease: AkashLeaseResponse) => akashService.extractServiceUrl(lease);
export const closeDeployment = (dseq: string, key: string) => akashService.closeDeployment(dseq, key);
export const deployBot = (params: DeploymentParams) => akashService.deployBot(params);
export const checkProviderHealth = (uri: string) => akashService.checkProviderHealth(uri);
export const getProviderDetails = (address: string, key: string) => akashService.getProviderDetails(address, key);
export const ensureCertificate = (key: string) => akashService.ensureCertificate(key);
export const getDeploymentDetails = (dseq: string, key: string) => akashService.getDeploymentDetails(dseq, key);
export const tryAllBidsUntilSuccess = (manifest: string, dseq: string, bids: BidResponse[], key: string) => 
  akashService.tryAllBidsUntilSuccess(manifest, dseq, bids, key);
export const filterBlacklistedBids = (bids: BidResponse[]) => akashService.filterBlacklistedBids(bids);

