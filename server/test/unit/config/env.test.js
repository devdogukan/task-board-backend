import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock dotenv to prevent it from loading .env.test file
vi.mock('dotenv', () => ({
    config: vi.fn(),
}));

describe('Env Config', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        // Reset environment variables
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    describe('env object', () => {
        beforeEach(() => {
            // Set all required environment variables
            process.env.NODE_ENV = 'test';
            process.env.PORT = '3000';
            process.env.DB_URI = 'mongodb://localhost:27017/test';
            process.env.FRONTEND_URL = 'http://localhost:3000';
            process.env.JWT_SECRET = 'test-secret';
            process.env.JWT_EXPIRES_IN = '15d';
            process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
            process.env.JWT_REFRESH_EXPIRES_IN = '30d';
            process.env.RATE_LIMIT_WINDOW = '15m';
            process.env.RATE_LIMIT_MAX = '100';
        });

        it('should load all required environment variables', async () => {
            // Clear module cache and re-import
            vi.resetModules();
            const { env } = await import('#src/config/env.js');

            expect(env.PORT).toBe('3000');
            expect(env.NODE_ENV).toBe('test');
            expect(env.DB_URI).toBe('mongodb://localhost:27017/test');
            expect(env.FRONTEND_URL).toBe('http://localhost:3000');
            expect(env.JWT_SECRET).toBe('test-secret');
            expect(env.JWT_EXPIRES_IN).toBe('15d');
            expect(env.JWT_REFRESH_SECRET).toBe('test-refresh-secret');
            expect(env.JWT_REFRESH_EXPIRES_IN).toBe('30d');
            expect(env.RATE_LIMIT_WINDOW).toBe('15m');
            expect(env.RATE_LIMIT_MAX).toBe('100');
        });

        it('should throw error when PORT is missing', async () => {
            const portValue = process.env.PORT;
            delete process.env.PORT;

            vi.resetModules();

            let errorThrown = false;
            try {
                await import('#src/config/env.js');
            } catch (error) {
                errorThrown = true;
                expect(error.message).toContain('Environment variable PORT is not set');
            }
            
            // Restore for cleanup
            if (portValue) process.env.PORT = portValue;
            expect(errorThrown).toBe(true);
        });

        it('should throw error when DB_URI is missing', async () => {
            const dbUriValue = process.env.DB_URI;
            delete process.env.DB_URI;

            vi.resetModules();

            let errorThrown = false;
            try {
                await import('#src/config/env.js');
            } catch (error) {
                errorThrown = true;
                expect(error.message).toContain('Environment variable DB_URI is not set');
            }
            
            if (dbUriValue) process.env.DB_URI = dbUriValue;
            expect(errorThrown).toBe(true);
        });

        it('should throw error when JWT_SECRET is missing', async () => {
            const jwtSecretValue = process.env.JWT_SECRET;
            delete process.env.JWT_SECRET;

            vi.resetModules();

            let errorThrown = false;
            try {
                await import('#src/config/env.js');
            } catch (error) {
                errorThrown = true;
                expect(error.message).toContain('Environment variable JWT_SECRET is not set');
            }
            
            if (jwtSecretValue) process.env.JWT_SECRET = jwtSecretValue;
            expect(errorThrown).toBe(true);
        });

        it('should throw error when NODE_ENV is missing', async () => {
            const nodeEnvValue = process.env.NODE_ENV;
            delete process.env.NODE_ENV;

            vi.resetModules();

            let errorThrown = false;
            try {
                await import('#src/config/env.js');
            } catch (error) {
                errorThrown = true;
                expect(error.message).toContain('Environment variable NODE_ENV is not set');
            }
            
            if (nodeEnvValue) process.env.NODE_ENV = nodeEnvValue;
            expect(errorThrown).toBe(true);
        });

        it('should throw error when FRONTEND_URL is missing', async () => {
            const frontendUrlValue = process.env.FRONTEND_URL;
            delete process.env.FRONTEND_URL;

            vi.resetModules();

            let errorThrown = false;
            try {
                await import('#src/config/env.js');
            } catch (error) {
                errorThrown = true;
                expect(error.message).toContain('Environment variable FRONTEND_URL is not set');
            }
            
            if (frontendUrlValue) process.env.FRONTEND_URL = frontendUrlValue;
            expect(errorThrown).toBe(true);
        });
    });
});
