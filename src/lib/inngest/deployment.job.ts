import { inngest, deploymentEvents } from '@/lib/inngest/client';
import { getDeploymentRepository } from '@/db/repositories/deployment-repository';
import { akashService } from '@/services/akash/akash.service';
import { cacheService } from '@/services/cache/cache.service';
import { config } from '@/config';

interface DeploymentJobData {
  deploymentId: string;
  channelToken: string;
  gatewayToken?: string;
}

async function updateDeploymentStatus(
  deploymentId: string,
  status: 'pending' | 'deploying' | 'active' | 'failed',
  details?: {
    akashDeploymentId?: string;
    providerUrl?: string;
    errorMessage?: string;
  }
) {
  const repo = getDeploymentRepository();
  await repo.updateStatus(deploymentId, status, details);
  
  const deployment = await repo.findById(deploymentId);
  if (deployment) {
    await cacheService.delete(`deployments:${deployment.userId}`);
  }
}

export const deploymentJob = inngest.createFunction(
  { id: 'deployment-job', name: 'Deploy Bot to Akash' },
  { event: deploymentEvents.DEPLOYMENT_STARTED },
  async ({ event, step }) => {
    const { deploymentId, channelToken, gatewayToken } = event.data as DeploymentJobData;
    
    try {
      const akashApiKey = config.akash.apiKey;
      if (!akashApiKey) {
        throw new Error('AKASH_API_KEY environment variable is not configured');
      }

      await step.run('update-status-deploying', async () => {
        await updateDeploymentStatus(deploymentId, 'deploying');
      });

      await step.run('deploy-bot', async () => {
        const result = await akashService.deployBot({
          akashApiKey,
          telegramBotToken: channelToken,
          gatewayToken,
        });
        
        return result;
      });

      await step.run('update-status-active', async () => {
        const deployment = await getDeploymentRepository().findById(deploymentId);
        if (!deployment) {
          throw new Error(`Deployment ${deploymentId} not found`);
        }
        
        const repo = getDeploymentRepository();
        await repo.updateStatus(deploymentId, 'active', {
          akashDeploymentId: deployment.akashDeploymentId || undefined,
          providerUrl: deployment.providerUrl || undefined,
        });
        
        await cacheService.delete(`deployments:${deployment.userId}`);
      });

      await step.run('send-completed-event', async () => {
        await inngest.send({
          name: deploymentEvents.DEPLOYMENT_COMPLETED,
          data: {
            deploymentId,
            status: 'active',
          },
        });
      });

      return { success: true, deploymentId };
    } catch (error) {
      const err = error as Error;
      
      await step.run('update-status-failed', async () => {
        await updateDeploymentStatus(deploymentId, 'failed', {
          errorMessage: err.message,
        });
      });

      await step.run('send-failed-event', async () => {
        await inngest.send({
          name: deploymentEvents.DEPLOYMENT_FAILED,
          data: {
            deploymentId,
            error: err.message,
          },
        });
      });

      throw error;
    }
  }
);

export const inngestFunctions = [deploymentJob];
