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
 * Fetches bot information from Telegram Bot API using the bot token.
 * 
 * Uses the getMe endpoint which returns basic information about the bot,
 * including its username which is needed to construct the t.me link.
 * 
 * @param botToken - Telegram bot token (format: 123456789:ABCDEF...)
 * @returns Bot information including username
 * @throws Error if the API call fails or bot has no username
 * 
 * @example
 * ```typescript
 * const botInfo = await getTelegramBotInfo('123456789:ABCDEF...');
 * console.log(botInfo.result.username); // "MyAwesomeBot"
 * ```
 */
export async function getTelegramBotInfo(botToken: string): Promise<TelegramBotInfo> {
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
 * 
 * @param username - Bot username (without @ prefix)
 * @returns Full t.me link to the bot
 * 
 * @example
 * ```typescript
 * const link = getTelegramBotLink('MyAwesomeBot');
 * console.log(link); // "https://t.me/MyAwesomeBot"
 * ```
 */
export function getTelegramBotLink(username: string): string {
  // Remove @ prefix if present
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  return `https://t.me/${cleanUsername}`;
}

/**
 * Fetches bot information and returns the t.me link.
 * 
 * This is a convenience function that combines getTelegramBotInfo
 * and getTelegramBotLink into a single call.
 * 
 * @param botToken - Telegram bot token
 * @returns Full t.me link to the bot
 * @throws Error if the API call fails or bot has no username
 * 
 * @example
 * ```typescript
 * const link = await getTelegramBotLinkFromToken('123456789:ABCDEF...');
 * console.log(link); // "https://t.me/MyAwesomeBot"
 * ```
 */
export async function getTelegramBotLinkFromToken(botToken: string): Promise<string> {
  const botInfo = await getTelegramBotInfo(botToken);
  return getTelegramBotLink(botInfo.result.username);
}
