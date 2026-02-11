import { describe, it, expect, vi } from 'vitest';
import { AkashService } from './akash.service';

describe('AkashService', () => {
    const service = new AkashService();

    describe('generateSDL', () => {
        it('should generate SDL with sanitized values', () => {
            const params = {
                telegramBotToken: '123456:ABC-DEF',
                gatewayToken: 'test-gateway-token'
            };

            const sdl = service.generateSDL(params);

            expect(sdl).toContain('TELEGRAM_BOT_TOKEN="123456:ABC-DEF"');
            expect(sdl).toContain('OPENCLAW_GATEWAY_TOKEN="test-gateway-token"');
            expect(sdl).toContain('image: ghcr.io/fenilmodi00/openclaw:latest');
        });

        it('should escape special characters in tokens', () => {
            const params = {
                telegramBotToken: '123456:ABC"DEF\\GHI',
                gatewayToken: 'token'
            };

            const sdl = service.generateSDL(params);

            // Expect escaped quotes and backslashes
            expect(sdl).toContain('TELEGRAM_BOT_TOKEN="123456:ABC\\"DEF\\\\GHI"');
        });
    });
});
