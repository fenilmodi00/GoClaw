import { NextRequest, NextResponse } from 'next/server';
import * as v from 'valibot';
import { StatusQuerySchema } from '@/lib/validation';
import { getDatabaseService } from '@/lib/database';
import { getTelegramBotLinkFromToken } from '@/lib/telegram';

/**
 * Generates a channel-specific connection link based on the channel type.
 * 
 * For Telegram, fetches the actual bot username from Telegram API and returns
 * the direct t.me link. For other channels, returns platform-specific URLs.
 * 
 * @param channel - The channel type (telegram, discord, whatsapp)
 * @param channelToken - The bot token or API key for the channel
 * @returns A connection link or instructions for the specified channel
 * 
 * Requirements: 7.1
 */
async function generateChannelLink(channel: string, channelToken?: string): Promise<string> {
  switch (channel) {
    case 'telegram':
      // For Telegram, fetch the bot username from Telegram API and construct the t.me link
      if (channelToken) {
        try {
          const botLink = await getTelegramBotLinkFromToken(channelToken);
          return botLink;
        } catch (error) {
          console.error('Failed to fetch Telegram bot link:', error);
          // Fallback to base URL if API call fails
          return 'https://t.me/';
        }
      }
      return 'https://t.me/';
    
    case 'discord':
      // For Discord, users need to invite the bot to their server using the
      // OAuth2 URL with the bot's client ID. Since we don't store the client ID,
      // we provide instructions to access the Discord Developer Portal.
      return 'https://discord.com/developers/applications';
    
    case 'whatsapp':
      // For WhatsApp Business API, users need to configure their phone number
      // and connect through the WhatsApp Business Platform.
      return 'https://business.whatsapp.com/';
    
    default:
      return '';
  }
}

/**
 * GET /api/status
 * 
 * Returns the current status and details of a deployment.
 * 
 * Query Parameters:
 * - id: Deployment ID (UUID)
 * 
 * Response:
 * - 200: Success with deployment status and details
 * - 400: Invalid or missing deployment ID
 * - 404: Deployment not found
 * - 500: Database or server error
 * 
 * Requirements: 6.2, 7.1, 7.2, 7.3, 8.4
 */
export async function GET(request: NextRequest) {
  try {
    // Extract deployment ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate deployment ID
    if (!id) {
      return NextResponse.json(
        { error: 'Deployment ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format using Valibot schema
    const validationResult = v.safeParse(StatusQuerySchema, { id });
    
    if (!validationResult.success) {
      const errorMessage = validationResult.issues[0]?.message || 'Invalid deployment ID format';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Query database for deployment record
    const databaseService = getDatabaseService();
    const deployment = await databaseService.getDeploymentById(id);

    // Handle deployment not found
    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Build response based on deployment status
    const response: {
      status: string;
      channel?: string;
      deploymentId?: string;
      leaseId?: string;
      providerUrl?: string;
      errorMessage?: string;
      channelLink?: string;
    } = {
      status: deployment.status,
    };

    // Include channel information
    if (deployment.channel) {
      response.channel = deployment.channel;
    }

    // Include deployment details if available
    if (deployment.akashDeploymentId) {
      response.deploymentId = deployment.akashDeploymentId;
    }

    if (deployment.akashLeaseId) {
      response.leaseId = deployment.akashLeaseId;
    }

    if (deployment.providerUrl) {
      response.providerUrl = deployment.providerUrl;
    }

    // Include error message for failed deployments
    if (deployment.status === 'failed' && deployment.errorMessage) {
      response.errorMessage = deployment.errorMessage;
    }

    // Generate channel-specific connection link for active deployments
    if (deployment.status === 'active') {
      response.channelLink = await generateChannelLink(deployment.channel, deployment.channelToken);
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error('Status API error:', error);

    // Return generic error message to user (don't expose internal details)
    return NextResponse.json(
      { error: 'An error occurred while retrieving deployment status. Please try again later.' },
      { status: 500 }
    );
  }
}
