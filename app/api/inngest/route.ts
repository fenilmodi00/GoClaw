import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { deploymentJob } from '@/lib/inngest/deployment.job';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [deploymentJob],
});
