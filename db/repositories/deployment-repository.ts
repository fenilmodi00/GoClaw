import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq, and, desc } from 'drizzle-orm';
import { deployments, type Deployment, type NewDeployment } from '@/db/schema';
import { getEncryptionService } from '@/lib/encryption';

/**
 * DeploymentRepository - Professional data access layer for deployments
 * 
 * Follows repository pattern for clean separation of concerns.
 * Handles encryption/decryption transparently.
 * Provides type-safe, optimized queries.
 */

export type DeploymentStatus = 'pending' | 'deploying' | 'active' | 'failed';
export type Model = 'claude-opus-4.5' | 'gpt-3.2' | 'gemini-3-flash';
export type Channel = 'telegram' | 'discord' | 'whatsapp';

export interface CreateDeploymentInput {
  id?: string;
  userId: string;
  email: string;
  model: Model;
  channel: Channel;
  channelToken: string;
  channelApiKey?: string;
  stripeSessionId: string;
}

export interface UpdateDeploymentStatusInput {
  akashDeploymentId?: string;
  akashLeaseId?: string;
  providerUrl?: string;
  errorMessage?: string;
  stripePaymentIntentId?: string;
}

export class DeploymentRepository {
  private db;
  private encryptionService;

  constructor() {
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN!,
    });

    this.db = drizzle(client);
    this.encryptionService = getEncryptionService();
  }

  /**
   * Creates a new deployment record
   */
  async create(input: CreateDeploymentInput): Promise<Deployment> {
    const id = input.id || crypto.randomUUID();
    const now = new Date();

    const encryptedChannelToken = this.encryptionService.encrypt(input.channelToken);
    const encryptedChannelApiKey = input.channelApiKey 
      ? this.encryptionService.encrypt(input.channelApiKey)
      : null;

    const newDeployment: NewDeployment = {
      id,
      userId: input.userId,
      email: input.email,
      model: input.model,
      channel: input.channel,
      channelToken: encryptedChannelToken,
      channelApiKey: encryptedChannelApiKey,
      status: 'pending',
      stripeSessionId: input.stripeSessionId,
      stripePaymentIntentId: null,
      akashDeploymentId: null,
      akashLeaseId: null,
      providerUrl: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(deployments).values(newDeployment);

    return {
      ...newDeployment,
      channelToken: input.channelToken,
      channelApiKey: input.channelApiKey || null,
      akashDeploymentId: null,
      akashLeaseId: null,
      providerUrl: null,
      stripePaymentIntentId: null,
      errorMessage: null,
    };
  }

  /**
   * Finds deployment by ID
   */
  async findById(id: string): Promise<Deployment | null> {
    const result = await this.db
      .select()
      .from(deployments)
      .where(eq(deployments.id, id))
      .limit(1);

    return result.length > 0 ? this.decrypt(result[0]) : null;
  }

  /**
   * Finds deployment by Stripe session ID
   */
  async findByStripeSession(sessionId: string): Promise<Deployment | null> {
    const result = await this.db
      .select()
      .from(deployments)
      .where(eq(deployments.stripeSessionId, sessionId))
      .limit(1);

    return result.length > 0 ? this.decrypt(result[0]) : null;
  }

  /**
   * Finds all deployments for a user, ordered by creation date (newest first)
   */
  async findByUserId(userId: string): Promise<Deployment[]> {
    const result = await this.db
      .select()
      .from(deployments)
      .where(eq(deployments.userId, userId))
      .orderBy(desc(deployments.createdAt));

    return result.map(d => this.decrypt(d));
  }

  /**
   * Finds pending deployment with same configuration
   * Used to reuse payment links for identical deployments
   */
  async findPendingDuplicate(
    userId: string,
    model: Model,
    channel: Channel,
    channelToken: string
  ): Promise<Deployment | null> {
    const encryptedToken = this.encryptionService.encrypt(channelToken);
    
    const result = await this.db
      .select()
      .from(deployments)
      .where(
        and(
          eq(deployments.userId, userId),
          eq(deployments.model, model),
          eq(deployments.channel, channel),
          eq(deployments.channelToken, encryptedToken),
          eq(deployments.status, 'pending')
        )
      )
      .limit(1);

    return result.length > 0 ? this.decrypt(result[0]) : null;
  }

  /**
   * Updates deployment status and related fields
   */
  async updateStatus(
    id: string,
    status: DeploymentStatus,
    details?: UpdateDeploymentStatusInput
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
   * Decrypts sensitive fields in a deployment record
   */
  private decrypt(deployment: Deployment): Deployment {
    return {
      ...deployment,
      channelToken: this.encryptionService.decrypt(deployment.channelToken),
      channelApiKey: deployment.channelApiKey 
        ? this.encryptionService.decrypt(deployment.channelApiKey)
        : null,
    };
  }
}

// Singleton instance
let _deploymentRepository: DeploymentRepository | null = null;

export function getDeploymentRepository(): DeploymentRepository {
  if (!_deploymentRepository) {
    _deploymentRepository = new DeploymentRepository();
  }
  return _deploymentRepository;
}
