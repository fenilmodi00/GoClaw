import { Inngest } from 'inngest';
import { config } from '@/config';

export const inngest = new Inngest({
  id: 'goclaw',
  signingKey: config.inngest.signingKey,
  eventKey: config.inngest.eventKey,
});

export const deploymentEvents = {
  DEPLOYMENT_STARTED: 'deployment/started',
  DEPLOYMENT_COMPLETED: 'deployment/completed',
  DEPLOYMENT_FAILED: 'deployment/failed',
} as const;
