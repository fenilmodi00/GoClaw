/**
 * Telegram Bot API utilities
 * 
 * Provides functions to interact with the Telegram Bot API,
 * including fetching bot information and constructing bot links.
 */

/**
 * Response from Telegram Bot API getMe endpoint
 */
export interface TelegramBotInfo {
  ok: boolean;
  result: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
  };
}

/**
 * TelegramService handles all interactions with the Telegram Bot API.
 */
export class TelegramService {
  /**
   * Fetches bot information from Telegram Bot API using the bot token.
   * 
   * Uses the getMe endpoint which returns basic information about the bot.
   */
  async getBotInfo(botToken: string): Promise<TelegramBotInfo> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getMe`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
      }

      const data: TelegramBotInfo = await response.json();

      if (!data.ok) {
        throw new Error('Telegram API returned ok: false');
      }

      if (!data.result.username) {
        throw new Error('Bot does not have a username');
      }

      return data;
    } catch (error) {
      console.error('Error fetching Telegram bot info:', error);
      throw new Error(
        `Failed to fetch bot information: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Constructs a Telegram bot link from a bot username.
   */
  getBotLink(username: string): string {
    // Remove @ prefix if present
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
    return `https://t.me/${cleanUsername}`;
  }

  /**
   * Fetches bot information and returns the t.me link.
   */
  async getBotLinkFromToken(botToken: string): Promise<string> {
    const botInfo = await this.getBotInfo(botToken);
    return this.getBotLink(botInfo.result.username);
  }
}

// Singleton instance
export const telegramService = new TelegramService();

// For backward compatibility or specific functional use cases
export const getTelegramBotInfo = (token: string) => telegramService.getBotInfo(token);
export const getTelegramBotLink = (username: string) => telegramService.getBotLink(username);
export const getTelegramBotLinkFromToken = (token: string) => telegramService.getBotLinkFromToken(token);
