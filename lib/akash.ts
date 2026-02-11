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
export function generateSDL(params: SDLParams): string {
  const { telegramBotToken, gatewayToken = '2002' } = params;

  // Get AkashML API key from environment
  const akashmlApiKey = process.env.AKASHML_KEY || '';
  
  if (!akashmlApiKey) {
    throw new Error('AKASHML_KEY environment variable is required');
  }

  // Generate SDL based on new OpenClaw requirements
  const sdl = `version: "2.0"

services:
  openclaw:
    image: ghcr.io/fenilmodi00/openclaw:latest
    expose:
      - port: 18789
        as: 80
        to:
          - global: true
      - port: 18790
        as: 8080
        to:
          - global: true
    env:
      - HOME=/home/node
      - TERM=xterm-256color
      - MODEL_ID=meta-llama/Llama-3.3-70B-Instruct
      - BASE_URL=https://api.akashml.com/v1
      - API_KEY=${akashmlApiKey}
      - API_PROTOCOL=openai-completions
      - CONTEXT_WINDOW=200000
      - MAX_TOKENS=8192
      - WORKSPACE=/home/node/.openclaw/workspace
      - OPENCLAW_GATEWAY_TOKEN=${gatewayToken}
      - OPENCLAW_GATEWAY_BIND=lan
      - OPENCLAW_GATEWAY_PORT=18789
      - OPENCLAW_BRIDGE_PORT=18790
      - TELEGRAM_BOT_TOKEN=${telegramBotToken}
      - TELEGRAM_ENABLED=true
    params:
      storage:
        openclaw-data:
          mount: /home/node/.openclaw
          readOnly: false

profiles:
  compute:
    openclaw:
      resources:
        cpu:
          units: 1.5
        memory:
          size: 3Gi
        storage:
          - size: 2Gi
          - name: openclaw-data
            size: 10Gi
            attributes:
              persistent: true
              class: beta3
  
  placement:
    akash:
      pricing:
        openclaw:
          denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
          amount: 1000

deployment:
  openclaw:
    akash:
      profile: openclaw
      count: 1
`;

  return sdl;
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
 * Creates a deployment on Akash Network using the provided SDL configuration.
 * Uses the Akash Console Managed Wallet API with minimum $5 deposit.
 * 
 * @param sdl - SDL configuration string
 * @param apiKey - User's Akash Console API key (from console.akash.network)
 * @param depositUsd - Deposit amount in USD (minimum $5, recommended $5-10 for testing)
 * @returns Deployment response with dseq and manifest
 * @throws Error if deployment creation fails
 */
export async function createDeployment(
  sdl: string,
  apiKey: string,
  depositUsd: number = MIN_DEPOSIT_USD
): Promise<AkashDeploymentResponse> {
  if (depositUsd < MIN_DEPOSIT_USD) {
    throw new Error(`Deposit must be at least $${MIN_DEPOSIT_USD} USD`);
  }

  try {
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
  } catch (error) {
    console.error('Error creating Akash deployment:', error);
    throw new Error(`Akash deployment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Polls for provider bids on a deployment with fixed interval polling.
 * 
 * Implements polling strategy as recommended by Akash Console API docs:
 * - Poll interval: 3 seconds
 * - Max attempts: 20 (60 seconds total)
 * - Returns as soon as bids are available
 * 
 * @param dseq - Akash deployment sequence ID
 * @param apiKey - User's Akash Console API key
 * @returns Array of bid responses from providers
 * @throws Error if polling times out or fails
 */
export async function pollForBids(
  dseq: string,
  apiKey: string
): Promise<BidResponse[]> {
  const startTime = Date.now();
  let attempt = 0;

  console.log(`Starting bid polling for dseq: ${dseq}`);

  while (attempt < MAX_BID_POLL_ATTEMPTS) {
    // Check timeout
    if (Date.now() - startTime > BID_POLL_TIMEOUT_MS) {
      throw new Error(`Bid polling timed out after ${BID_POLL_TIMEOUT_MS / 1000} seconds`);
    }

    attempt++;
    console.log(`Checking for bids (attempt ${attempt}/${MAX_BID_POLL_ATTEMPTS})...`);

    try {
      const response = await fetch(
        `${AKASH_CONSOLE_API_BASE}/v1/bids?dseq=${dseq}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Bid polling attempt ${attempt} failed (${response.status}): ${errorText}`);
      } else {
        const data: BidsResponse = await response.json();

        // If we have bids, return them
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          console.log(`✅ Found ${data.data.length} bid(s) on attempt ${attempt}`);
          return data.data;
        }
      }
    } catch (error) {
      console.error(`Bid polling attempt ${attempt} error:`, error);
    }

    // Wait before next attempt (except on last attempt)
    if (attempt < MAX_BID_POLL_ATTEMPTS) {
      console.log(`Waiting ${BID_POLL_INTERVAL_MS / 1000}s before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, BID_POLL_INTERVAL_MS));
    }
  }

  throw new Error(`No bids received after ${MAX_BID_POLL_ATTEMPTS} attempts (${BID_POLL_TIMEOUT_MS / 1000}s)`);
}

/**
 * Selects the bid with the lowest price from an array of bid responses.
 * 
 * @param bidResponses - Array of provider bid responses
 * @returns The bid response with the lowest price
 * @throws Error if bids array is empty
 */
export function selectCheapestBid(bidResponses: BidResponse[]): BidResponse {
  if (!bidResponses || bidResponses.length === 0) {
    throw new Error('Cannot select bid from empty array');
  }

  return bidResponses.reduce((cheapest, current) => {
    const cheapestPrice = parseFloat(cheapest.bid.price.amount);
    const currentPrice = parseFloat(current.bid.price.amount);
    return currentPrice < cheapestPrice ? current : cheapest;
  });
}

/**
 * Creates a lease with the selected provider.
 * 
 * @param manifest - Deployment manifest from createDeployment response
 * @param dseq - Deployment sequence ID
 * @param bidResponse - Selected bid response
 * @param apiKey - User's Akash Console API key
 * @returns Lease response with deployment and lease details
 * @throws Error if lease creation fails
 */
export async function createLease(
  manifest: string,
  dseq: string,
  bidResponse: BidResponse,
  apiKey: string
): Promise<AkashLeaseResponse> {
  try {
    const { id: bidId } = bidResponse.bid;

    const response = await fetch(`${AKASH_CONSOLE_API_BASE}/v1/leases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        manifest,
        leases: [
          {
            dseq,
            gseq: bidId.gseq,
            oseq: bidId.oseq,
            provider: bidId.provider,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create lease (${response.status}): ${errorText}`);
    }

    const data: AkashLeaseResponse = await response.json();
    
    if (!data.data?.leases || data.data.leases.length === 0) {
      throw new Error('Invalid lease response: no leases created');
    }

    return data;
  } catch (error) {
    console.error('Error creating Akash lease:', error);
    throw new Error(`Akash lease creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts the service URL from lease status.
 * The URL is typically available in the lease status after deployment is running.
 * 
 * @param leaseResponse - Lease response from createLease
 * @returns Service URL where the deployment is accessible, or null if not yet available
 */
export function extractServiceUrl(leaseResponse: AkashLeaseResponse): string | null {
  try {
    const lease = leaseResponse.data.leases[0];
    
    if (!lease.status) {
      return null;
    }

    // Extract URIs from services
    const services = lease.status.services;
    for (const serviceName in services) {
      const service = services[serviceName];
      if (service.uris && service.uris.length > 0) {
        return service.uris[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting service URL:', error);
    return null;
  }
}

/**
 * Polls for the deployment to become active and retrieve the service URL.
 * After lease creation, it may take time for the deployment to start and expose URLs.
 * 
 * Note: This function attempts to poll for service URL but may not work with current API.
 * The service URL might be available immediately in the lease response or require
 * additional time for the deployment to become active.
 * 
 * @param leaseResponse - Initial lease response
 * @param maxAttempts - Maximum polling attempts (default: 20)
 * @returns Service URL where the deployment is accessible, or null if not available
 */
export async function waitForServiceUrl(
  leaseResponse: AkashLeaseResponse
): Promise<string | null> {
  console.log(`Checking for service URL...`);

  // First check if URL is already available
  const url = extractServiceUrl(leaseResponse);
  if (url) {
    console.log(`✅ Service URL available: ${url}`);
    return url;
  }

  // If not available, inform user that deployment is starting
  console.log(`Service URL not immediately available. Deployment may still be starting.`);
  console.log(`Check console.akash.network for deployment status.`);
  
  return null;
}

/**
 * Closes a deployment and recovers remaining deposit.
 * 
 * @param dseq - Deployment sequence ID
 * @param apiKey - User's Akash Console API key
 * @returns Success status
 * @throws Error if deployment closure fails
 */
export async function closeDeployment(
  dseq: string,
  apiKey: string
): Promise<{ success: boolean }> {
  try {
    console.log(`Closing deployment ${dseq}...`);

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

    await response.json();
    console.log(`✅ Deployment closed successfully`);
    console.log(`   Remaining deposit will be refunded to your account`);

    return { success: true };
  } catch (error) {
    console.error('Error closing Akash deployment:', error);
    throw new Error(`Akash deployment closure failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Orchestrates the full deployment flow for an OpenClaw bot to Akash Network.
 * 
 * This function performs the following steps:
 * 1. Generates SDL configuration with Telegram bot token
 * 2. Creates deployment on Akash with specified deposit
 * 3. Polls for provider bids (3s intervals, up to 60s)
 * 4. Selects the cheapest bid
 * 5. Creates a lease with the selected provider
 * 6. Attempts to retrieve the service URL
 * 
 * @param params - Deployment parameters including Telegram bot token and Akash API key
 * @returns Deployment result with dseq, provider, and service URL (if available)
 * @throws Error if any step in the deployment process fails
 * 
 * @example
 * ```typescript
 * const result = await deployBot({
 *   akashApiKey: 'akt_...',
 *   telegramBotToken: '123456:ABC-DEF...',
 *   gatewayToken: '2002',
 *   depositUsd: 5
 * });
 * console.log(`Deployed with dseq: ${result.dseq}`);
 * console.log(`Provider: ${result.provider}`);
 * if (result.serviceUrl) {
 *   console.log(`Service URL: ${result.serviceUrl}`);
 * }
 * ```
 */
export async function deployBot(params: DeploymentParams): Promise<DeploymentResult> {
  const { akashApiKey, telegramBotToken, gatewayToken, depositUsd = MIN_DEPOSIT_USD } = params;

  try {
    console.log('🚀 Starting Akash deployment orchestration...');
    console.log(`Model: meta-llama/Llama-3.3-70B-Instruct (via AkashML)`);
    console.log(`Channel: Telegram`);
    console.log(`Deposit: ${depositUsd} USD`);

    // Step 1: Generate SDL
    console.log('\n📝 Generating SDL configuration...');
    const sdl = generateSDL({
      telegramBotToken,
      gatewayToken,
    });

    // Step 2: Create deployment
    console.log('\n🔨 Creating deployment on Akash Network...');
    const deploymentResponse = await createDeployment(sdl, akashApiKey, depositUsd);
    const { dseq, manifest } = deploymentResponse.data;
    console.log(`✅ Deployment created with dseq: ${dseq}`);

    // Step 3: Poll for bids
    console.log('\n⏳ Polling for provider bids...');
    const bids = await pollForBids(dseq, akashApiKey);
    console.log(`✅ Received ${bids.length} bid(s)`);

    // Step 4: Select cheapest bid
    console.log('\n💰 Selecting cheapest bid...');
    const selectedBid = selectCheapestBid(bids);
    const provider = selectedBid.bid.id.provider;
    const price = selectedBid.bid.price;
    console.log(`✅ Selected bid from provider: ${provider}`);
    console.log(`   Price: ${price.amount} ${price.denom}`);

    // Step 5: Create lease
    console.log('\n📜 Creating lease with selected provider...');
    const leaseResponse = await createLease(manifest, dseq, selectedBid, akashApiKey);
    console.log(`✅ Lease created successfully`);
    console.log(`   State: ${leaseResponse.data.deployment.state}`);

    // Step 6: Extract service URL
    console.log('\n🌐 Extracting service URL...');
    const serviceUrl = extractServiceUrl(leaseResponse);

    if (serviceUrl) {
      console.log(`✅ Service URL: ${serviceUrl}`);
    } else {
      console.log(`⚠️ Service URL not yet available (check console.akash.network)`);
    }

    console.log('\n✅ Deployment orchestration completed!');
    console.log(`\n📊 Deployment Summary:`);
    console.log(`   DSEQ: ${dseq}`);
    console.log(`   Provider: ${provider}`);
    console.log(`   Model: meta-llama/Llama-3.3-70B-Instruct`);
    console.log(`   Channel: Telegram`);
    if (serviceUrl) {
      console.log(`   Service URL: ${serviceUrl}`);
    } else {
      console.log(`   Service URL: Not yet available (check console.akash.network)`);
    }

    return {
      dseq,
      provider,
      serviceUrl,
    };
  } catch (error) {
    console.error('\n❌ Deployment orchestration failed:', error);
    throw error;
  }
}

