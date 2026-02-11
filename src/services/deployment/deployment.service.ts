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
