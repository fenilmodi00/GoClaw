import { inngest, deploymentEvents } from '@/lib/inngest/client';
import { getDeploymentRepository } from '@/db/repositories/deployment-repository';
import { akashService } from '@/services/akash/akash.service';
import { cacheService } from '@/services/cache/cache.service';
import { config } from '@/config';

interface DeploymentJobData {
  deploymentId: string;
  channelToken: string;
  gatewayToken?: string;
  attempt?: number;
  failedDseqs?: string[];
}

type DeploymentSuccessResult = {
  dseq: string;
  leaseId: string;
  provider: string;
  serviceUrl: string | null;
};

type DeploymentStepResult = 
  | { success: true; result: DeploymentSuccessResult }
  | { success: false; error: string; dseq?: string };

async function updateDeploymentStatus(
  deploymentId: string,
  status: 'pending' | 'deploying' | 'active' | 'failed',
  details?: {
    akashDeploymentId?: string;
    akashLeaseId?: string;
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
    const attempt = (event.data as DeploymentJobData).attempt ?? 1;
    const failedDseqs = (event.data as DeploymentJobData).failedDseqs ?? [];
    const MAX_ATTEMPTS = 3;
    
    try {
      const akashApiKey = config.akash.apiKey;
      if (!akashApiKey) {
        throw new Error('AKASH_API_KEY environment variable is not configured');
      }

      await step.run('update-status-deploying', async () => {
        await updateDeploymentStatus(deploymentId, 'deploying');
      });

      console.log(`Starting Akash deployment attempt ${attempt}/${MAX_ATTEMPTS}`);

      let deploymentResult: DeploymentSuccessResult | null = null;
      
      const deploymentResultStep: DeploymentStepResult = await step.run('deploy-bot', async () => {
        try {
          const result = await akashService.deployBot({
            akashApiKey,
            telegramBotToken: channelToken,
            gatewayToken,
          });
          
          return { success: true as const, result };
        } catch (error) {
          const err = error as Error & { dseq?: string };
          return { 
            success: false as const, 
            error: err.message,
            dseq: (err as Error & { dseq?: string }).dseq 
          };
        }
      });

      if (!deploymentResultStep.success) {
        const err = new Error(deploymentResultStep.error) as Error & { dseq?: string };
        if (deploymentResultStep.dseq) {
          err.dseq = deploymentResultStep.dseq;
        }
        throw err;
      }

      deploymentResult = deploymentResultStep.result;

      const cleanupDseqs = [...new Set(failedDseqs)].filter((dseq) => dseq !== deploymentResult!.dseq);
      if (cleanupDseqs.length > 0) {
        await step.run('cleanup-failed-deployments', async () => {
          for (const dseq of cleanupDseqs) {
            try {
              console.log(`Cleaning up failed deployment: ${dseq}`);
              await akashService.closeDeployment(dseq, akashApiKey);
              console.log(`Successfully closed failed deployment: ${dseq}`);
            } catch (cleanupError) {
              console.warn(`Failed to close failed deployment ${dseq}:`, cleanupError);
            }
          }
        });
      }

      await step.run('cleanup-zombie-deployments', async () => {
        const zombieCleanup = await akashService.closeZombieDeployments(akashApiKey, deploymentResult!.dseq);
        if (zombieCleanup.closed.length > 0) {
          console.log(`Closed ${zombieCleanup.closed.length} zombie deployment(s): ${zombieCleanup.closed.join(', ')}`);
        }
        if (zombieCleanup.failed.length > 0) {
          console.warn(`Failed to close ${zombieCleanup.failed.length} zombie deployment(s): ${zombieCleanup.failed.join(' | ')}`);
        }
      });

      await step.run('update-status-active', async () => {
        await updateDeploymentStatus(deploymentId, 'active', {
          akashDeploymentId: deploymentResult!.dseq,
          akashLeaseId: deploymentResult!.leaseId,
          providerUrl: deploymentResult!.serviceUrl || deploymentResult!.provider,
        });
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
      const err = error as Error & { dseq?: string };

      const nextFailedDseqs = [...failedDseqs];
      if (err.dseq) {
        nextFailedDseqs.push(err.dseq);
      }

      if (attempt < MAX_ATTEMPTS) {
        await step.run('update-status-retrying', async () => {
          await updateDeploymentStatus(deploymentId, 'deploying', {
            errorMessage: `Attempt ${attempt} failed: ${err.message}`,
          });
        });

        await step.run('schedule-retry', async () => {
          await inngest.send({
            name: deploymentEvents.DEPLOYMENT_STARTED,
            data: {
              deploymentId,
              channelToken,
              gatewayToken,
              attempt: attempt + 1,
              failedDseqs: [...new Set(nextFailedDseqs)],
            },
          });
        });

        return { success: false, deploymentId, scheduledRetry: true };
      }

      await step.run('update-status-failed', async () => {
        await updateDeploymentStatus(deploymentId, 'failed', {
          errorMessage: `All ${MAX_ATTEMPTS} attempts failed: ${err.message}`,
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

      return { success: false, deploymentId, scheduledRetry: false };
    }
  }
);

export const inngestFunctions = [deploymentJob];
