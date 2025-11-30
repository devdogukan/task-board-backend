import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseExpirationToMs } from '#src/utils/time.util.js';

describe('Time Util', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('parseExpirationToMs', () => {
        describe('Invalid input validation', () => {
            it('should throw error when expiresIn is null', () => {
                expect(() => parseExpirationToMs(null)).toThrow(
                    'Invalid expiration format',
                );
            });

            it('should throw error when expiresIn is undefined', () => {
                expect(() => parseExpirationToMs(undefined)).toThrow(
                    'Invalid expiration format',
                );
            });

            it('should throw error when expiresIn is not a string', () => {
                expect(() => parseExpirationToMs(123)).toThrow(
                    'Invalid expiration format',
                );
                expect(() => parseExpirationToMs({})).toThrow(
                    'Invalid expiration format',
                );
                expect(() => parseExpirationToMs([])).toThrow(
                    'Invalid expiration format',
                );
                expect(() => parseExpirationToMs(true)).toThrow(
                    'Invalid expiration format',
                );
            });

            it('should throw error when expiresIn is empty string', () => {
                expect(() => parseExpirationToMs('')).toThrow(
                    'Invalid expiration format',
                );
            });

            it('should throw error for invalid format - only number', () => {
                expect(() => parseExpirationToMs('15')).toThrow(
                    'Invalid expiration format: 15',
                );
            });

            it('should throw error for invalid format - only unit', () => {
                expect(() => parseExpirationToMs('d')).toThrow(
                    'Invalid expiration format: d',
                );
            });

            it('should throw error for invalid format - wrong unit', () => {
                expect(() => parseExpirationToMs('15x')).toThrow(
                    'Invalid expiration format: 15x',
                );
                expect(() => parseExpirationToMs('15y')).toThrow(
                    'Invalid expiration format: 15y',
                );
            });

            it('should throw error for invalid format - multiple units', () => {
                expect(() => parseExpirationToMs('15dh')).toThrow(
                    'Invalid expiration format: 15dh',
                );
            });

            it('should throw error for invalid format - spaces', () => {
                expect(() => parseExpirationToMs('15 d')).toThrow(
                    'Invalid expiration format: 15 d',
                );
                expect(() => parseExpirationToMs('15d ')).toThrow(
                    'Invalid expiration format: 15d ',
                );
            });

            it('should throw error for invalid format - decimal numbers', () => {
                expect(() => parseExpirationToMs('15.5d')).toThrow(
                    'Invalid expiration format: 15.5d',
                );
            });

            it('should throw error for invalid format - negative numbers', () => {
                expect(() => parseExpirationToMs('-15d')).toThrow(
                    'Invalid expiration format: -15d',
                );
            });
        });

        describe('Valid format - seconds', () => {
            it('should convert 1 second to milliseconds', () => {
                expect(parseExpirationToMs('1s')).toBe(1000);
            });

            it('should convert 60 seconds to milliseconds', () => {
                expect(parseExpirationToMs('60s')).toBe(60 * 1000);
            });

            it('should convert 30 seconds to milliseconds', () => {
                expect(parseExpirationToMs('30s')).toBe(30 * 1000);
            });
        });

        describe('Valid format - minutes', () => {
            it('should convert 1 minute to milliseconds', () => {
                expect(parseExpirationToMs('1m')).toBe(60 * 1000);
            });

            it('should convert 30 minutes to milliseconds', () => {
                expect(parseExpirationToMs('30m')).toBe(30 * 60 * 1000);
            });

            it('should convert 60 minutes to milliseconds', () => {
                expect(parseExpirationToMs('60m')).toBe(60 * 60 * 1000);
            });
        });

        describe('Valid format - hours', () => {
            it('should convert 1 hour to milliseconds', () => {
                expect(parseExpirationToMs('1h')).toBe(60 * 60 * 1000);
            });

            it('should convert 2 hours to milliseconds', () => {
                expect(parseExpirationToMs('2h')).toBe(2 * 60 * 60 * 1000);
            });

            it('should convert 24 hours to milliseconds', () => {
                expect(parseExpirationToMs('24h')).toBe(24 * 60 * 60 * 1000);
            });
        });

        describe('Valid format - days', () => {
            it('should convert 1 day to milliseconds', () => {
                expect(parseExpirationToMs('1d')).toBe(24 * 60 * 60 * 1000);
            });

            it('should convert 7 days to milliseconds', () => {
                expect(parseExpirationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
            });

            it('should convert 15 days to milliseconds', () => {
                expect(parseExpirationToMs('15d')).toBe(
                    15 * 24 * 60 * 60 * 1000,
                );
            });

            it('should convert 30 days to milliseconds', () => {
                expect(parseExpirationToMs('30d')).toBe(
                    30 * 24 * 60 * 60 * 1000,
                );
            });
        });

        describe('Edge cases', () => {
            it('should handle zero value', () => {
                expect(parseExpirationToMs('0s')).toBe(0);
                expect(parseExpirationToMs('0m')).toBe(0);
                expect(parseExpirationToMs('0h')).toBe(0);
                expect(parseExpirationToMs('0d')).toBe(0);
            });

            it('should handle large numbers', () => {
                expect(parseExpirationToMs('365d')).toBe(
                    365 * 24 * 60 * 60 * 1000,
                );
            });

            it('should return number type', () => {
                const result = parseExpirationToMs('15d');
                expect(typeof result).toBe('number');
            });
        });
    });
});
