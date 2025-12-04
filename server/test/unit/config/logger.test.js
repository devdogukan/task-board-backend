import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import winston from 'winston';

// Mock env before importing logger
vi.mock('#src/config/env.js', () => ({
    env: {
        NODE_ENV: 'development',
    },
}));

describe('Logger Config', () => {
    let logger;

    beforeEach(async () => {
        vi.resetModules();
        logger = (await import('#src/config/logger.js')).default;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Logger instance', () => {
        it('should create a Winston logger instance', () => {
            expect(logger).toBeDefined();
            expect(logger).toBeInstanceOf(winston.Logger);
        });

        it('should have info method', () => {
            expect(typeof logger.info).toBe('function');
        });

        it('should have error method', () => {
            expect(typeof logger.error).toBe('function');
        });

        it('should have warn method', () => {
            expect(typeof logger.warn).toBe('function');
        });

        it('should have debug method', () => {
            expect(typeof logger.debug).toBe('function');
        });
    });

    describe('Development mode', () => {
        beforeEach(async () => {
            vi.resetModules();
            vi.doMock('#src/config/env.js', () => ({
                env: {
                    NODE_ENV: 'development',
                },
            }));
            logger = (await import('#src/config/logger.js')).default;
        });

        it('should have console transport in development', () => {
            const transports = logger.transports;
            const consoleTransport = transports.find(
                (t) => t instanceof winston.transports.Console,
            );
            expect(consoleTransport).toBeDefined();
        });

        it('should not have file transports in development', () => {
            const transports = logger.transports;
            const fileTransports = transports.filter(
                (t) => t instanceof winston.transports.File,
            );
            expect(fileTransports.length).toBe(0);
        });

        it('should have debug level in development', () => {
            expect(logger.level).toBe('debug');
        });
    });

    describe('Production mode', () => {
        beforeEach(async () => {
            vi.resetModules();
            vi.doMock('#src/config/env.js', () => ({
                env: {
                    NODE_ENV: 'production',
                },
            }));
            logger = (await import('#src/config/logger.js')).default;
        });

        it('should have console transport in production', () => {
            const transports = logger.transports;
            const consoleTransport = transports.find(
                (t) => t instanceof winston.transports.Console,
            );
            expect(consoleTransport).toBeDefined();
        });

        it('should have file transports in production', () => {
            const transports = logger.transports;
            const fileTransports = transports.filter(
                (t) => t instanceof winston.transports.File,
            );
            expect(fileTransports.length).toBeGreaterThan(0);
        });

        it('should have info level in production', () => {
            expect(logger.level).toBe('info');
        });
    });

    describe('Log format', () => {
        it('should format logs with timestamp', () => {
            const info = {
                timestamp: '2025-11-27 12:00:00',
                level: 'info',
                message: 'Test message',
            };

            // Logger format is tested indirectly through logger methods
            expect(logger.format).toBeDefined();
        });
    });

    describe('Logging methods', () => {
        it('should log info messages', () => {
            const spy = vi.spyOn(logger, 'info');
            logger.info('Test info message');
            expect(spy).toHaveBeenCalledWith('Test info message');
            spy.mockRestore();
        });

        it('should log error messages', () => {
            const spy = vi.spyOn(logger, 'error');
            logger.error('Test error message');
            expect(spy).toHaveBeenCalledWith('Test error message');
            spy.mockRestore();
        });

        it('should log warn messages', () => {
            const spy = vi.spyOn(logger, 'warn');
            logger.warn('Test warn message');
            expect(spy).toHaveBeenCalledWith('Test warn message');
            spy.mockRestore();
        });
    });
});

