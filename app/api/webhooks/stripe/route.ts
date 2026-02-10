import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe';
import { deploymentService } from '@/services/deployment/deployment-service';
import { 
  generateSDL, 
  createDeployment, 
  pollForBids, 
  selectCheapestBid, 
  createLease,
  extractServiceUrl
} from '@/lib/akash';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 * 
 * Handles Stripe webhook events for payment processing.
 * 
 * This endpoint:
 * 1. Verifies the webhook signature to ensure authenticity
 * 2. Processes checkout.session.completed events
 * 3. Updates deployment status to "deploying"
 * 4. Triggers async Akash deployment (non-blocking)
 * 5. Returns 200 OK quickly (< 5s to avoid Stripe timeout)
 * 
 * Requirements: 3.4, 3.5, 3.6, 5.1
 */
export async function POST(request: NextRequest) {
  logger.info('Stripe webhook received');
  
  try {
    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    logger.debug('Webhook details', { bodyLength: body.length, hasSignature: !!signature });

    if (!signature) {
      logger.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature (Requirement 2.5)
    let event: Stripe.Event;
    try {
      logger.debug('Verifying webhook signature');
      event = stripeService.verifyWebhookSignature(body, signature);
      logger.info('Webhook signature verified', { eventType: event.type, eventId: event.id });
    } catch (error) {
      logger.error('Webhook signature verification failed', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Process checkout.session.completed events (Requirement 3.4)
    if (event.type === 'checkout.session.completed') {
      logger.info('Processing checkout.session.completed event');
      
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract session details
      const sessionId = session.id;
      const paymentIntentId = session.payment_intent as string;
      const deploymentId = session.metadata?.deploymentId;

      logger.debug('Session details', { sessionId, paymentIntentId, deploymentId });

      // Handle deployment payment
      if (!deploymentId) {
        logger.error('Missing deploymentId in session metadata');
        return NextResponse.json(
          { error: 'Missing deployment ID' },
          { status: 400 }
        );
      }

      logger.debug('Finding deployment by session ID', { sessionId });

      // Find deployment by session ID
      const deployment = await deploymentService.getDeploymentByStripeSession(sessionId);

      if (!deployment) {
        logger.error('Deployment not found', { sessionId });
        return NextResponse.json(
          { error: 'Deployment not found' },
          { status: 404 }
        );
      }

      logger.info('Deployment found', { 
        deploymentId: deployment.id, 
        email: deployment.email,
        model: deployment.model,
        channel: deployment.channel,
        status: deployment.status
      });

      // Update deployment status to "deploying" (Requirement 3.6)
      logger.debug('Updating deployment status to deploying');
      await deploymentService.updateDeploymentStatus(
        deployment.id,
        'deploying',
        {
          stripePaymentIntentId: paymentIntentId,
        }
      );

      logger.info('Deployment status updated to deploying');

      // Trigger async Akash deployment (non-blocking) (Requirement 5.1)
      logger.info('Triggering async Akash deployment', { deploymentId: deployment.id });
      processDeployment(deployment.id).catch((error) => {
        logger.error('Background deployment processing failed', error);
      });

      logger.info('Async deployment triggered');
    } else {
      logger.debug('Ignoring event type', { eventType: event.type });
    }

    // Return 200 OK quickly (< 5s for Stripe timeout)
    logger.info('Webhook processed successfully');
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    logger.error('Webhook processing error', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Processes the Akash deployment asynchronously.
 * 
 * This function runs in the background after the webhook response is sent.
 * It orchestrates the full deployment flow:
 * 1. Retrieves the deployment record
 * 2. Decrypts channel token and API key
 * 3. Generates SDL configuration
 * 4. Creates deployment on Akash Network
 * 5. Polls for provider bids
 * 6. Selects the lowest price bid
 * 7. Creates lease with selected provider
 * 8. Extracts service URL
 * 9. On success: updates status to "active" with deployment details
 * 10. On failure: updates status to "failed" with error message
 * 
 * Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9
 */
async function processDeployment(deploymentId: string): Promise<void> {
  try {
    logger.info('Starting Akash deployment process', { deploymentId });

    // Step 1: Retrieve deployment record with decrypted credentials (Requirement 5.1)
    logger.debug('Retrieving deployment record');
    const deployment = await deploymentService.getDeploymentById(deploymentId);

    if (!deployment) {
      logger.error('Deployment not found during processing', { deploymentId });
      return;
    }

    logger.info('Deployment record retrieved', {
      email: deployment.email,
      model: deployment.model,
      channel: deployment.channel,
      status: deployment.status
    });

    // Get Akash API key from environment
    logger.debug('Validating Akash API key');
    const akashApiKey = process.env.AKASH_API_KEY;
    if (!akashApiKey) {
      throw new Error('AKASH_API_KEY environment variable is not configured');
    }
    logger.debug('Akash API key validated');

    // Step 2: Credentials are already decrypted by databaseService.getDeploymentById()
    const telegramBotToken = deployment.channelToken;

    logger.debug('Telegram bot token decrypted');

    // Step 3: Generate SDL configuration (Requirement 5.2)
    logger.debug('Generating SDL configuration');
    const sdl = generateSDL({
      telegramBotToken,
      gatewayToken: '2002', // Fixed gateway token
    });
    logger.debug('SDL configuration generated', { sdlLength: sdl.length });

    // Step 4: Create deployment on Akash Network (Requirement 5.3)
    logger.info('Creating deployment on Akash Network');
    const deploymentResponse = await createDeployment(sdl, akashApiKey, 5);
    const { dseq, manifest } = deploymentResponse.data;
    logger.info('Deployment created', { dseq, manifestLength: manifest.length });

    // Step 5: Poll for provider bids (Requirement 5.4)
    logger.info('Polling for provider bids');
    const bids = await pollForBids(dseq, akashApiKey);
    logger.info('Received bids', { bidCount: bids.length });

    // Step 6: Select the lowest price bid (Requirement 5.5)
    logger.debug('Selecting cheapest bid');
    const selectedBid = selectCheapestBid(bids);
    const provider = selectedBid.bid.id.provider;
    const price = selectedBid.bid.price;
    logger.info('Selected bid', { provider, price: `${price.amount} ${price.denom}` });

    // Step 7: Create lease with selected provider (Requirement 5.6)
    logger.info('Creating lease with provider', { provider, dseq });
    const leaseResponse = await createLease(manifest, dseq, selectedBid, akashApiKey);
    const leaseId = leaseResponse.data.leases[0].id;
    logger.info('Lease created', { 
      leaseId: `${leaseId.dseq}-${leaseId.gseq}-${leaseId.oseq}`,
      state: leaseResponse.data.deployment.state
    });

    // Step 8: Extract service URL
    logger.debug('Extracting service URL');
    const serviceUrl = extractServiceUrl(leaseResponse);
    const providerUrl = serviceUrl || `https://console.akash.network/deployments/${dseq}`;

    if (serviceUrl) {
      logger.info('Service URL available', { serviceUrl });
    } else {
      logger.warn('Service URL not yet available', { consoleUrl: providerUrl });
    }

    // Step 9: Update status to "active" with deployment details (Requirements 5.7, 5.8)
    logger.debug('Updating deployment status to active');
    await deploymentService.updateDeploymentStatus(
      deploymentId,
      'active',
      {
        akashDeploymentId: dseq,
        akashLeaseId: `${leaseId.dseq}-${leaseId.gseq}-${leaseId.oseq}`,
        providerUrl,
      }
    );

    logger.info('Deployment completed successfully', {
      deploymentId,
      dseq,
      provider,
      model: deployment.model,
      channel: deployment.channel,
      providerUrl,
      serviceUrl
    });

  } catch (error) {
    logger.error('Deployment failed', error);

    // Step 10: Update status to "failed" with error message (Requirement 5.9)
    const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';
    
    try {
      await deploymentService.updateDeploymentStatus(
        deploymentId,
        'failed',
        {
          errorMessage,
        }
      );
      logger.info('Deployment marked as failed', { deploymentId });
    } catch (dbError) {
      logger.error('Failed to update deployment status', dbError);
    }
  }
}
