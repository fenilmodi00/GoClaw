import { getDeploymentRepository, type CreateDeploymentInput, type UpdateDeploymentStatusInput, type DeploymentStatus } from '@/db/repositories/deployment-repository';
import type { Deployment } from '@/db/schema';
import { cacheService } from '../cache/cache.service';

/**
 * DeploymentService - Business logic layer for deployment management
 * 
 * Handles deployment creation, status updates, and queries.
 * Uses DeploymentRepository for data access.
 */

export class DeploymentService {
  private deploymentRepository;

  constructor() {
    this.deploymentRepository = getDeploymentRepository();
  }

  /**
   * Creates a new deployment
   */
  async createDeployment(input: CreateDeploymentInput): Promise<Deployment> {
    const clawApiKey = crypto.randomUUID();
    const deployment = await this.deploymentRepository.create({ ...input, clawApiKey });

    // Invalidate cache
    await cacheService.delete(`deployments:${input.userId}`);

    return deployment;
  }

  /**
   * Triggers the actual Akash deployment process
   */
  async deploy(deployment: Deployment): Promise<void> {
    // 1. Update status to deploying
    await this.updateDeploymentStatus(deployment.id, 'deploying');

    try {
      // 2. Call Akash Service
      // We need to fetch the user's plan or default to some deposit amount
      // For now using default $5
      const result = await import('../akash/akash.service').then(m => m.akashService.deployBot({
        akashApiKey: process.env.AKASH_API_KEY!, // Master wallet key for now
        telegramBotToken: deployment.channelToken,
        gatewayToken: deployment.clawApiKey || undefined, // Use generated unique key
        modelId: deployment.model,
      }));

      // 3. Update status to active
      await this.updateDeploymentStatus(deployment.id, 'active', {
        akashDeploymentId: result.dseq,
        providerUrl: result.serviceUrl || undefined,
      });

    } catch (error) {
      console.error('Deployment failed:', error);
      const err = error as Error;
      // 4. Update status to failed
      await this.updateDeploymentStatus(deployment.id, 'failed', {
        errorMessage: err.message
      });
      throw error;
    }
  }

  /**
   * Finds deployment by ID
   */
  async getDeploymentById(id: string): Promise<Deployment | null> {
    return this.deploymentRepository.findById(id);
  }



  /**
   * Gets all deployments for a user
   */
  async getUserDeployments(userId: string): Promise<Deployment[]> {
    const cacheKey = `deployments:${userId}`;
    const cached = await cacheService.get<Deployment[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const deployments = await this.deploymentRepository.findByUserId(userId);

    // Cache for 30 seconds
    await cacheService.set(cacheKey, deployments, 30);

    return deployments;
  }

  /**
   * Checks if user has a pending deployment with same configuration
   * Returns the existing deployment if found, allowing payment link reuse
   */
  async findPendingDuplicate(
    userId: string,
    model: string,
    channel: string,
    channelToken: string
  ): Promise<Deployment | null> {
    return this.deploymentRepository.findPendingDuplicate(
      userId,
      model,
      channel,
      channelToken
    );
  }

  /**
   * Updates deployment status
   */
  async updateDeploymentStatus(
    id: string,
    status: DeploymentStatus,
    details?: UpdateDeploymentStatusInput
  ): Promise<void> {
    await this.deploymentRepository.updateStatus(id, status, details);

    const deployment = await this.getDeploymentById(id);
    if (deployment) {
      await cacheService.delete(`deployments:${deployment.userId}`);
    }
  }
}

// Singleton instance
export const deploymentService = new DeploymentService();
