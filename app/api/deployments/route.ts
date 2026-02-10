import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deploymentService } from '@/services/deployment/deployment-service';
import { userService } from '@/services/user/user-service';
import { logger } from '@/lib/logger';

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
export async function GET(_request: NextRequest) {
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

    logger.debug('Fetching deployments for user', { clerkUserId });

    // Get user from database
    const user = await userService.getUserByClerkId(clerkUserId);
    
    if (!user) {
      logger.warn('Deployments API: User not found in database', { clerkUserId });
      return NextResponse.json(
        { error: 'User not found. Please complete registration.' },
        { status: 404 }
      );
    }

    // Get all deployments for user
    const deployments = await deploymentService.getUserDeployments(user.id);

    logger.info('Deployments retrieved', { 
      userId: user.id, 
      count: deployments.length 
    });

    // Return deployments without sensitive fields
    const sanitizedDeployments = deployments.map(d => ({
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
