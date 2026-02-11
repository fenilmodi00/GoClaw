import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
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
    let user = await userService.getUserByClerkId(clerkUserId);
    
    if (!user) {
      logger.info('User not found in database, creating user automatically');
      
      // Get user email from Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkUserId);
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

      if (!userEmail) {
        logger.error('Deployments API: User email not found');
        return NextResponse.json(
          { error: 'User email not found. Please update your profile.' },
          { status: 400 }
        );
      }

      // Check if email exists with different Clerk ID (user was deleted and recreated)
      const existingUserByEmail = await userService.getUserByEmail(userEmail);
      if (existingUserByEmail) {
        logger.warn('User with same email exists but different Clerk ID, using existing user', {
          oldClerkId: existingUserByEmail.clerkUserId,
          newClerkId: clerkUserId
        });
        user = existingUserByEmail;
      } else {
        // Create new user
        user = await userService.createUserFromClerk(clerkUserId, userEmail);
        logger.info('User created automatically', { userId: user.id });
      }
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
