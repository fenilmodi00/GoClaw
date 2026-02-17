import { generateSDLTemplate } from './sdl.template';
import { isRetryableAkashError, isProviderUnavailableError, type DeploymentDetails } from '@/lib/akash-utils';
import { AkashAllProvidersFailedError, AkashCertificateError } from '@/lib/errors';
import { getProviderBlacklistRepository } from '@/db/repositories/blacklist-repository';
import { config } from '@/config';

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
const AKASH_CONSOLE_API_BASE = config.akash.apiBaseUrl;

/**
 * Maximum number of polling attempts for bids
 */
const MAX_BID_POLL_ATTEMPTS = config.akash.maxBidPollAttempts;

/**
 * Polling interval in milliseconds (3 seconds as recommended by Akash docs)
 */
const BID_POLL_INTERVAL_MS = config.akash.bidPollIntervalMs;

/**
 * Maximum timeout for bid polling in milliseconds (60 seconds typical)
 */
const BID_POLL_TIMEOUT_MS = config.akash.bidPollTimeoutMs;

/**
 * Minimum deposit amount in USD (as per Akash Console API requirements)
 */
const MIN_DEPOSIT_USD = config.akash.minDepositUsd;

/**
 * Maximum retries for lease creation
 */
const LEASE_MAX_RETRIES = config.akash.leaseMaxRetries;

/**
 * Base delay for lease retry (exponential backoff)
 */
const LEASE_RETRY_BASE_DELAY_MS = config.akash.leaseRetryBaseDelayMs;

/**
 * Timeout for provider health check
 */
const PROVIDER_HEALTH_CHECK_TIMEOUT = config.akash.providerHealthCheckTimeout;

/**
 * Circuit breaker options for Akash API calls
 */

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

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

    return withRetry(async () => {
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
    }, 3, 2000);
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
   * Checks for existing valid certificates
   */
  async listCertificates(apiKey: string): Promise<{ certificates: Array<{ id: number; state: string }> } | null> {
    try {
      const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/certificates`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      return await response.json() as { certificates: Array<{ id: number; state: string }> };
    } catch (error) {
      console.warn('Error listing certificates:', error);
      return null;
    }
  }

  /**
   * Checks if a valid certificate exists, creates one if not
   * Note: Certificates are optional in Akash Console API - deployment works without them
   */
  async ensureCertificate(apiKey: string): Promise<boolean> {
    try {
      // First, try to list existing certificates
      const certList = await this.listCertificates(apiKey);
      
      if (certList?.certificates) {
        // Check if there's a valid certificate
        const validCert = certList.certificates.find(cert => cert.state === 'valid');
        if (validCert) {
          console.log('Found valid certificate, using existing certificate');
          return true;
        }
      }

      // No valid certificate found, try to create one
      console.log('No valid certificate found, attempting to create new certificate...');
      
      const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        console.log('Certificate created successfully');
        return true;
      }

      const errorText = await response.text();
      
      // Check if response is HTML (API error page)
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        console.warn('Certificate API returned HTML (may indicate cert already exists or API issue)');
        
        // Verify by listing certificates again
        const certListAfter = await this.listCertificates(apiKey);
        if (certListAfter?.certificates?.some(cert => cert.state === 'valid')) {
          console.log('Certificate exists and is valid');
          return true;
        }
        
        // Certificate is optional - log warning and continue
        console.warn('Certificate creation/verification failed, but certificates are optional - continuing without certificate');
        return true;
      }

      // Try to parse as JSON error
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.includes('already exists') || errorJson.message?.includes('already exists')) {
          return true;
        }
      } catch {
        // Not JSON
      }

      // Certificate is optional - log warning and continue
      console.warn(`Certificate creation returned error (continuing without certificate): ${errorText.substring(0, 200)}`);
      return true;
    } catch (error) {
      // Certificate is optional - log error but don't fail
      console.warn('Certificate handling failed (continuing without certificate):', error);
      return true;
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
export const createDeployment = (sdl: string, apiKey: string, depositUsd?: number) => akashService.createDeployment(sdl, apiKey, depositUsd);
export const pollForBids = (dseq: string, apiKey: string) => akashService.pollForBids(dseq, apiKey);
export const selectCheapestBid = (bids: BidResponse[]) => akashService.selectCheapestBid(bids);
export const sortBidsByPrice = (bids: BidResponse[]) => akashService.sortBidsByPrice(bids);
export const createLease = (manifest: string, dseq: string, bid: BidResponse, apiKey: string) => akashService.createLease(manifest, dseq, bid, apiKey);
export const extractServiceUrl = (lease: AkashLeaseResponse) => akashService.extractServiceUrl(lease);
export const closeDeployment = (dseq: string, apiKey: string) => akashService.closeDeployment(dseq, apiKey);
export const deployBot = (params: DeploymentParams) => akashService.deployBot(params);
export const checkProviderHealth = (providerUri: string) => akashService.checkProviderHealth(providerUri);
export const getProviderDetails = (providerAddress: string, apiKey: string) => akashService.getProviderDetails(providerAddress, apiKey);
export const ensureCertificate = (apiKey: string) => akashService.ensureCertificate(apiKey);
export const getDeploymentDetails = (dseq: string, apiKey: string) => akashService.getDeploymentDetails(dseq, apiKey);
export const tryAllBidsUntilSuccess = (manifest: string, dseq: string, bids: BidResponse[], apiKey: string) => 
  akashService.tryAllBidsUntilSuccess(manifest, dseq, bids, apiKey);
export const filterBlacklistedBids = (bids: BidResponse[]) => akashService.filterBlacklistedBids(bids);

