import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTelegramBotInfo, getTelegramBotLink, getTelegramBotLinkFromToken } from '@/lib/telegram';

describe('Telegram Utilities', () => {
  describe('getTelegramBotLink', () => {
    it('should construct a t.me link from username', () => {
      const link = getTelegramBotLink('MyAwesomeBot');
      expect(link).toBe('https://t.me/MyAwesomeBot');
    });

    it('should remove @ prefix from username', () => {
      const link = getTelegramBotLink('@MyAwesomeBot');
      expect(link).toBe('https://t.me/MyAwesomeBot');
    });
  });

  describe('getTelegramBotInfo', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should fetch bot info from Telegram API', async () => {
      const mockResponse = {
        ok: true,
        result: {
          id: 123456789,
          is_bot: true,
          first_name: 'My Bot',
          username: 'MyAwesomeBot',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const botInfo = await getTelegramBotInfo('123456:ABC-DEF');
      
      expect(botInfo).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bot123456:ABC-DEF/getMe',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should throw error if API returns non-ok status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(getTelegramBotInfo('invalid-token')).rejects.toThrow(
        'Telegram API error: 401 Unauthorized'
      );
    });

    it('should throw error if bot has no username', async () => {
      const mockResponse = {
        ok: true,
        result: {
          id: 123456789,
          is_bot: true,
          first_name: 'My Bot',
          username: '',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(getTelegramBotInfo('123456:ABC-DEF')).rejects.toThrow(
        'Bot does not have a username'
      );
    });

    it('should throw error if API returns ok: false', async () => {
      const mockResponse = {
        ok: false,
        result: null,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await expect(getTelegramBotInfo('123456:ABC-DEF')).rejects.toThrow(
        'Telegram API returned ok: false'
      );
    });
  });

  describe('getTelegramBotLinkFromToken', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should fetch bot info and return t.me link', async () => {
      const mockResponse = {
        ok: true,
        result: {
          id: 123456789,
          is_bot: true,
          first_name: 'My Bot',
          username: 'MyAwesomeBot',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const link = await getTelegramBotLinkFromToken('123456:ABC-DEF');
      
      expect(link).toBe('https://t.me/MyAwesomeBot');
    });

    it('should handle @ prefix in username', async () => {
      const mockResponse = {
        ok: true,
        result: {
          id: 123456789,
          is_bot: true,
          first_name: 'My Bot',
          username: '@MyAwesomeBot',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const link = await getTelegramBotLinkFromToken('123456:ABC-DEF');
      
      expect(link).toBe('https://t.me/MyAwesomeBot');
    });
  });
});
