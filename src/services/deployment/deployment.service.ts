import { getDeploymentRepository, type CreateDeploymentInput, type UpdateDeploymentStatusInput, type DeploymentStatus } from '@/db/repositories/deployment-repository';
import type { Deployment } from '@/db/schema';
import { cacheService } from '../cache/cache.service';
import { inngest, deploymentEvents } from '@/lib/inngest/client';
import { config } from '@/config';

export class DeploymentService {
  private deploymentRepository;

  constructor() {
    this.deploymentRepository = getDeploymentRepository();
  }

  async createDeployment(input: CreateDeploymentInput): Promise<Deployment> {
    const clawApiKey = crypto.randomUUID();
    const deployment = await this.deploymentRepository.create({ ...input, clawApiKey });

    try {
      await cacheService.delete(`deployments:${input.userId}`);
    } catch (err) {
      console.warn('Failed to invalidate deployment cache:', err);
    }

    return deployment;
  }

  async deploy(deployment: Deployment): Promise<void> {
    await this.updateDeploymentStatus(deployment.id, 'deploying');

    try {
      await inngest.send({
        name: deploymentEvents.DEPLOYMENT_STARTED,
        data: {
          deploymentId: deployment.id,
          channelToken: deployment.channelToken,
          gatewayToken: undefined,
        },
      });
    } catch (error) {
      console.error('Failed to trigger deployment job:', error);
      await this.updateDeploymentStatus(deployment.id, 'failed', {
        errorMessage: error instanceof Error ? error.message : 'Failed to start deployment job',
      });
      throw error;
    }
  }

  async getDeploymentById(id: string): Promise<Deployment | null> {
    return this.deploymentRepository.findById(id);
  }

  async getUserDeployments(userId: string): Promise<Deployment[]> {
    const cacheKey = `deployments:${userId}`;

    try {
      const cached = await cacheService.get<Deployment[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      console.warn('Cache read failed, falling back to database:', err);
    }

    const deployments = await this.deploymentRepository.findByUserId(userId);

    try {
      await cacheService.set(cacheKey, deployments, config.cache.deploymentTtlSeconds);
    } catch (err) {
      console.warn('Failed to cache deployments:', err);
    }

    return deployments;
  }

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

  async updateDeploymentStatus(
    id: string,
    status: DeploymentStatus,
    details?: UpdateDeploymentStatusInput
  ): Promise<void> {
    await this.deploymentRepository.updateStatus(id, status, details);

    const deployment = await this.getDeploymentById(id);
    if (deployment) {
      try {
        await cacheService.delete(`deployments:${deployment.userId}`);
      } catch (err) {
        console.warn('Failed to invalidate deployment cache:', err);
      }
    }
  }
}

export const deploymentService = new DeploymentService();
