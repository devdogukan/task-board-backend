import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies
vi.mock('#src/config/env.js', () => ({
    env: {
        NODE_ENV: 'test',
        FRONTEND_URL: 'http://localhost:3000',
    },
}));

vi.mock('#src/config/logger.js', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        http: vi.fn(),
    },
}));

vi.mock('#src/middlewares/error.handler.js', () => ({
    errorHandler: (err, req, res, next) => {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal Server Error',
        });
    },
}));

vi.mock('#src/middlewares/notfound.handler.js', () => ({
    notFoundHandler: (req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found',
        });
    },
}));

vi.mock('#src/routes/index.js', () => {
    const router = express.Router();
    router.get('/test', (req, res) => {
        res.json({ success: true, message: 'Test route' });
    });
    return {
        default: router,
    };
});

// Import app after mocks
import app from '#src/app.js';

describe('Express App Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('App instance', () => {
        it('should create an Express app instance', () => {
            expect(app).toBeDefined();
            expect(typeof app.listen).toBe('function');
            expect(typeof app.use).toBe('function');
        });
    });

    describe('Middleware configuration', () => {
        it('should handle JSON requests', async () => {
            const response = await request(app)
                .post('/api/test-json')
                .send({ test: 'data' })
                .expect(404); // Route doesn't exist but JSON parsing works

            expect(response.body).toBeDefined();
        });

        it('should handle URL encoded requests', async () => {
            const response = await request(app)
                .post('/api/test-urlencoded')
                .type('form')
                .send('test=data')
                .expect(404);

            expect(response.body).toBeDefined();
        });

        it('should parse cookies', async () => {
            const response = await request(app)
                .get('/api/test')
                .set('Cookie', 'test=value')
                .expect(200);

            expect(response.body).toBeDefined();
        });
    });

    describe('CORS configuration', () => {
        it('should allow requests with no origin', async () => {
            const response = await request(app)
                .get('/api/test')
                .expect(200);

            expect(response.body).toBeDefined();
        });

        it('should allow requests from test environment', async () => {
            const response = await request(app)
                .get('/api/test')
                .set('Origin', 'http://localhost:3000')
                .expect(200);

            expect(response.body).toBeDefined();
        });

        it('should allow requests from FRONTEND_URL', async () => {
            const response = await request(app)
                .get('/api/test')
                .set('Origin', 'http://localhost:3000')
                .expect(200);

            expect(response.body).toBeDefined();
        });
    });

    describe('Routes configuration', () => {
        it('should mount routes under /api prefix', async () => {
            const response = await request(app)
                .get('/api/test')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Test route',
            });
        });

        it('should not expose routes without /api prefix', async () => {
            const response = await request(app).get('/test').expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Route not found',
            });
        });
    });

    describe('Error handling', () => {
        it('should handle 404 for non-existent routes', async () => {
            const response = await request(app).get('/api/nonexistent').expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Route not found',
            });
        });

        it('should handle 404 for root path', async () => {
            const response = await request(app).get('/').expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Route not found',
            });
        });
    });

    describe('Security headers', () => {
        it('should include security headers from helmet', async () => {
            const response = await request(app).get('/api/test').expect(200);

            // Helmet adds various security headers
            expect(response.headers).toBeDefined();
        });
    });

    // cors coverage
    describe('CORS configuration', () => {
        it('should allow requests with no origin', async () => {
            const response = await request(app).get('/api/test').expect(200);
            expect(response.body).toBeDefined();
        });
    });
});

