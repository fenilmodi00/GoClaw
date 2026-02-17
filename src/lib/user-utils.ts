import { userService } from '@/services';
import { clerkClient } from '@clerk/nextjs/server';
import { logger } from './logger';

export interface GetOrCreateUserResult {
  user: Awaited<ReturnType<typeof userService.getUserByClerkId>>;
  isNew: boolean;
}

export async function getOrCreateUserFromClerk(clerkUserId: string): Promise<GetOrCreateUserResult> {
  let user = await userService.getUserByClerkId(clerkUserId);

  if (!user) {
    logger.info('User not found in database, creating user automatically');

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      logger.error('User email not found in Clerk');
      throw new Error('User email not found. Please update your profile.');
    }

    const existingUserByEmail = await userService.getUserByEmail(userEmail);
    if (existingUserByEmail) {
      logger.warn('User with same email exists but different Clerk ID, using existing user', {
        oldClerkId: existingUserByEmail.clerkUserId,
        newClerkId: clerkUserId
      });
      user = existingUserByEmail;
    } else {
      user = await userService.createUserFromClerk(clerkUserId, userEmail);
      logger.info('User created automatically', { userId: user.id });
    }
  }

  return { user, isNew: !user };
}
