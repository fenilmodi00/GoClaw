import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deploymentService } from '@/services';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/middleware/rate-limit';
import { getOrCreateUserFromClerk } from '@/lib/user-utils';

/**
 * GET /api/deployments
 * 
 * Returns all deployments for the authenticated user.
 * 
 * Response:
 * - 200: Success with array of deployments
 * - 401: User not authenticated
 * - 404: User not found in database
 * - 500: Server error
 */
export async function GET() {
  try {
    // Get authenticated user from Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      logger.warn('Deployments API: User not authenticated');
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Rate limit: 30 requests per user per 60 seconds
    const rateLimitResult = await rateLimit(`deployments:${clerkUserId}`, 30, 60_000);
    if (!rateLimitResult.success) {
      logger.warn('Deployments API: Rate limit exceeded', { clerkUserId });
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)) } }
      );
    }

    logger.debug('Fetching deployments for user', { clerkUserId });

    // Get or create user from Clerk
    const { user } = await getOrCreateUserFromClerk(clerkUserId);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get or create user account.' },
        { status: 500 }
      );
    }

    // Get all deployments for user
    const deployments = await deploymentService.getUserDeployments(user.id);

    logger.info('Deployments retrieved', {
      userId: user.id,
      count: deployments.length
    });

    // Return deployments without sensitive fields
    const sanitizedDeployments = deployments.map((d) => ({
      id: d.id,
      model: d.model,
      channel: d.channel,
      status: d.status,
      akashDeploymentId: d.akashDeploymentId,
      akashLeaseId: d.akashLeaseId,
      providerUrl: d.providerUrl,
      errorMessage: d.errorMessage,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    return NextResponse.json({
      deployments: sanitizedDeployments,
    });

  } catch (error) {
    logger.error('Deployments API error', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
