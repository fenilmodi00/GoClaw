import { describe, it, expect } from 'vitest';
import { AkashService } from './akash.service';

describe('AkashService', () => {
    const service = new AkashService();

    describe('generateSDL', () => {
        it('should generate SDL with sanitized values and model ID', () => {
            const params = {
                telegramBotToken: '123456:ABC-DEF',
                gatewayToken: 'test-gateway-token',
                modelId: 'MiniMaxAI/MiniMax-M2.5'
            };

            const sdl = service.generateSDL(params);

            expect(sdl).toContain('TELEGRAM_BOT_TOKEN=123456:ABC-DEF');
            expect(sdl).toContain('OPENCLAW_GATEWAY_TOKEN=test-gateway-token');
            expect(sdl).toContain('MODEL_ID=MiniMaxAI/MiniMax-M2.5');
            expect(sdl).toContain('image: ghcr.io/anomalyco/openclaw:latest');
            // Port 18790 and OPENCLAW_BRIDGE_PORT should not be present
            expect(sdl).not.toContain('port: 18790');
            expect(sdl).not.toContain('OPENCLAW_BRIDGE_PORT');
        });

        it('should use default model when modelId is not provided', () => {
            const params = {
                telegramBotToken: '123456:ABC-DEF'
            };

            const sdl = service.generateSDL(params);

            expect(sdl).toContain('MODEL_ID=MiniMaxAI/MiniMax-M2.5');
        });

        it('should escape special characters in tokens', () => {
            const params = {
                telegramBotToken: '123456:ABC"DEF\\GHI',
                gatewayToken: 'token',
                modelId: 'test/model'
            };

            const sdl = service.generateSDL(params);

            // Expect escaped quotes and backslashes
            expect(sdl).toContain('TELEGRAM_BOT_TOKEN=123456:ABC\\"DEF\\\\GHI');
        });
    });
});
