import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { deployments, type Deployment, type NewDeployment } from '@/db/schema';
import { getEncryptionService } from './encryption';

/**
 * DatabaseService handles all database operations for deployment records.
 * 
 * Key features:
 * - Encrypts sensitive fields (channelToken, channelApiKey) before storage
 * - Decrypts sensitive fields on retrieval
 * - Auto-updates updated_at timestamp on modifications
 * - Provides type-safe database operations using Drizzle ORM
 * 
 * Requirements: 8.2, 8.3
 */

export type DeploymentStatus = 'pending' | 'deploying' | 'active' | 'failed';
export type Model = 'claude-opus-4.5' | 'gpt-3.2' | 'gemini-3-flash';
export type Channel = 'telegram' | 'discord' | 'whatsapp';

export interface CreateDeploymentData {
  id?: string; // Optional pre-generated ID
  userId: string; // Required - user ID from users table
  email: string;
  model: Model;
  channel: Channel;
  channelToken: string;
  channelApiKey?: string;
  stripeSessionId: string;
}

export interface StatusUpdateDetails {
  akashDeploymentId?: string;
  akashLeaseId?: string;
  providerUrl?: string;
  errorMessage?: string;
  stripePaymentIntentId?: string;
}

export class DatabaseService {
  private db;
  private encryptionService;

  constructor() {
    // Initialize database client
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN!,
    });

    this.db = drizzle(client);
    this.encryptionService = getEncryptionService();
  }

  /**
   * Creates a new deployment record in the database.
   * 
   * Generates a unique UUID for the deployment ID.
   * Encrypts sensitive fields before storage.
   * Sets initial status to "pending".
   * Sets created_at and updated_at timestamps to current time.
   * 
   * @param data - Deployment configuration data
   * @returns The created deployment record (with decrypted sensitive fields)
   * 
   * Requirements: 8.2 (unique ID generation)
   */
  async createDeployment(data: CreateDeploymentData): Promise<Deployment> {
    // Generate unique UUID for deployment (or use provided ID)
    const id = data.id || crypto.randomUUID();
    const now = new Date();

    // Encrypt sensitive fields
    const encryptedChannelToken = this.encryptionService.encrypt(data.channelToken);
    const encryptedChannelApiKey = data.channelApiKey 
      ? this.encryptionService.encrypt(data.channelApiKey)
      : null;

    // Create deployment record
    const newDeployment: NewDeployment = {
      id,
      userId: data.userId,
      email: data.email,
      model: data.model,
      channel: data.channel,
      channelToken: encryptedChannelToken,
      channelApiKey: encryptedChannelApiKey,
      status: 'pending',
      stripeSessionId: data.stripeSessionId,
      stripePaymentIntentId: null,
      akashDeploymentId: null,
      akashLeaseId: null,
      providerUrl: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };

    // Insert into database
    await this.db.insert(deployments).values(newDeployment);

    // Return the created deployment with decrypted fields
    return {
      ...newDeployment,
      channelToken: data.channelToken,
      channelApiKey: data.channelApiKey || null,
      akashDeploymentId: null,
      akashLeaseId: null,
      providerUrl: null,
      stripePaymentIntentId: null,
      errorMessage: null,
    };
  }

  /**
   * Updates the status of a deployment record.
   * 
   * Automatically updates the updated_at timestamp.
   * Optionally updates additional fields like deployment IDs, provider URL, or error message.
   * 
   * @param id - Deployment ID
   * @param status - New deployment status
   * @param details - Optional additional fields to update
   * 
   * Requirements: 8.3 (auto-update updated_at timestamp)
   */
  async updateDeploymentStatus(
    id: string,
    status: DeploymentStatus,
    details?: StatusUpdateDetails
  ): Promise<void> {
    const updateData: Partial<NewDeployment> = {
      status,
      updatedAt: new Date(),
      ...details,
    };

    await this.db
      .update(deployments)
      .set(updateData)
      .where(eq(deployments.id, id));
  }

  /**
   * Retrieves a deployment record by its ID.
   * 
   * Decrypts sensitive fields before returning.
   * 
   * @param id - Deployment ID
   * @returns The deployment record with decrypted sensitive fields, or null if not found
   */
  async getDeploymentById(id: string): Promise<Deployment | null> {
    const result = await this.db
      .select()
      .from(deployments)
      .where(eq(deployments.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const deployment = result[0];
    return this.decryptDeployment(deployment);
  }

  /**
   * Retrieves a deployment record by its Stripe session ID.
   * 
   * Used during webhook processing to find the deployment associated with a payment.
   * Decrypts sensitive fields before returning.
   * 
   * @param sessionId - Stripe checkout session ID
   * @returns The deployment record with decrypted sensitive fields, or null if not found
   */
  async getDeploymentByStripeSession(sessionId: string): Promise<Deployment | null> {
    const result = await this.db
      .select()
      .from(deployments)
      .where(eq(deployments.stripeSessionId, sessionId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const deployment = result[0];
    return this.decryptDeployment(deployment);
  }

  /**
   * Decrypts sensitive fields in a deployment record.
   * 
   * @param deployment - Deployment record with encrypted fields
   * @returns Deployment record with decrypted fields
   */
  private decryptDeployment(deployment: Deployment): Deployment {
    return {
      ...deployment,
      channelToken: this.encryptionService.decrypt(deployment.channelToken),
      channelApiKey: deployment.channelApiKey 
        ? this.encryptionService.decrypt(deployment.channelApiKey)
        : null,
    };
  }
}

// Lazy-loaded singleton instance
let _databaseService: DatabaseService | null = null;

export function getDatabaseService(): DatabaseService {
  if (!_databaseService) {
    _databaseService = new DatabaseService();
  }
  return _databaseService;
}

// Export a singleton instance for use throughout the application
export const databaseService = new Proxy({} as DatabaseService, {
  get(_target, prop) {
    const service = getDatabaseService();
    return service[prop as keyof DatabaseService];
  }
});
