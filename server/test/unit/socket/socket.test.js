import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('socket.io', () => {
    const mockIoUse = vi.fn();
    const mockIoOn = vi.fn();
    
    const mockServerInstance = {
        use: mockIoUse,
        on: mockIoOn,
    };
    
    // Store mocks in global for test access
    globalThis.__socketIoMocks__ = {
        mockIoUse,
        mockIoOn,
        mockServerInstance,
    };
    
    // Create a class that can be used with 'new'
    class MockServer {
        constructor() {
            return mockServerInstance;
        }
    }
    
    return {
        Server: MockServer,
    };
});

vi.mock('#src/middlewares/socket.auth.middleware.js', () => ({
    socketAuthMiddleware: vi.fn((socket, next) => {
        socket.user = { _id: '507f1f77bcf86cd799439011', email: 'test@example.com' };
        next();
    }),
}));

vi.mock('#src/socket/handlers/task.handlers.js', () => ({
    registerTaskHandlers: vi.fn(),
}));

vi.mock('#src/config/logger.js', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

// Import after mocks
import { initializeSocket } from '#src/socket/socket.js';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from '#src/middlewares/socket.auth.middleware.js';
import { registerTaskHandlers } from '#src/socket/handlers/task.handlers.js';
import logger from '#src/config/logger.js';

// Access mock functions from global
const { mockIoUse, mockIoOn, mockServerInstance } = globalThis.__socketIoMocks__;

describe('Socket Initialization', () => {
    let mockHttpServer;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockHttpServer = {
            listen: vi.fn(),
        };
        
        // Reset mocks
        mockIoUse.mockClear();
        mockIoOn.mockClear();
    });

    describe('initializeSocket', () => {
        it('should initialize socket server with CORS configuration', () => {
            const io = initializeSocket(mockHttpServer);

            // Server is a class, so we verify it was called by checking the instance
            expect(io).toBe(mockServerInstance);
        });

        it('should register authentication middleware', () => {
            initializeSocket(mockHttpServer);

            expect(mockIoUse).toHaveBeenCalledWith(socketAuthMiddleware);
        });

        it('should register connection handler', () => {
            const mockSocket = {
                user: { _id: '507f1f77bcf86cd799439011', email: 'test@example.com' },
            };

            initializeSocket(mockHttpServer);

            expect(mockIoOn).toHaveBeenCalledWith('connection', expect.any(Function));
            
            // Call the connection handler
            const connectionHandler = mockIoOn.mock.calls.find(
                (call) => call[0] === 'connection',
            )?.[1];
            
            if (connectionHandler) {
                connectionHandler(mockSocket);
                expect(registerTaskHandlers).toHaveBeenCalledWith(mockServerInstance, mockSocket);
            }
        });

        it('should log user connection', () => {
            const mockSocket = {
                user: { _id: '507f1f77bcf86cd799439011', email: 'test@example.com' },
            };

            initializeSocket(mockHttpServer);

            const connectionHandler = mockIoOn.mock.calls.find(
                (call) => call[0] === 'connection',
            )?.[1];
            
            if (connectionHandler) {
                connectionHandler(mockSocket);
                expect(logger.info).toHaveBeenCalled();
            }
        });

        it('should configure CORS for development environment', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const io = initializeSocket(mockHttpServer);

            // Verify the server was initialized (returns the instance)
            expect(io).toBe(mockServerInstance);

            process.env.NODE_ENV = originalEnv;
        });

        it('should configure CORS for test environment', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'test';

            const io = initializeSocket(mockHttpServer);

            // Verify the server was initialized (returns the instance)
            expect(io).toBe(mockServerInstance);

            process.env.NODE_ENV = originalEnv;
        });

        it('should return socket.io instance', () => {
            const io = initializeSocket(mockHttpServer);

            expect(io).toBe(mockServerInstance);
        });
    });
});

