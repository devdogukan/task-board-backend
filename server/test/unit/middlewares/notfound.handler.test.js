import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import middleware
import { notFoundHandler } from '#src/middlewares/notfound.handler.js';

describe('Not Found Handler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            originalUrl: '/api/nonexistent',
        };

        res = {
            status: vi.fn().mockReturnThis(),
        };

        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
    });

    it('should set 404 status code', () => {
        notFoundHandler(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should create error with correct message including originalUrl', () => {
        notFoundHandler(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Not Found - /api/nonexistent');
    });

    it('should pass error to next middleware', () => {
        notFoundHandler(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle different originalUrl values', () => {
        req.originalUrl = '/api/users/123/invalid';

        notFoundHandler(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Not Found - /api/users/123/invalid');
    });
});

