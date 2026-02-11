import { getDeploymentRepository, type CreateDeploymentInput, type UpdateDeploymentStatusInput, type DeploymentStatus } from '@/db/repositories/deployment-repository';
import type { Deployment } from '@/db/schema';

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
    return this.deploymentRepository.create(input);
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
    return this.deploymentRepository.findByUserId(userId);
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
    return this.deploymentRepository.updateStatus(id, status, details);
  }
}

// Singleton instance
let _deploymentService: DeploymentService | null = null;

export function getDeploymentService(): DeploymentService {
  if (!_deploymentService) {
    _deploymentService = new DeploymentService();
  }
  return _deploymentService;
}

// Export singleton proxy
export const deploymentService = new Proxy({} as DeploymentService, {
  get(_target, prop) {
    const service = getDeploymentService();
    return service[prop as keyof DeploymentService];
  }
});
