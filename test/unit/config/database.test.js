import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { connectDB, disconnectDB } from '#src/config/database.js';
import logger from '#src/config/logger.js';

// Mock dependencies
vi.mock('#src/config/env.js', () => ({
    env: {
        DB_URI: 'mongodb://test-uri',
    },
}));

vi.mock('#src/config/logger.js', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock mongoose - factory içinde mock fonksiyonları tanımla
vi.mock('mongoose', async () => {
    const actual = await vi.importActual('mongoose');
    const mockConnect = vi.fn();
    const mockDisconnect = vi.fn();
    return {
        ...actual,
        default: {
            ...actual.default,
            connect: mockConnect,
            disconnect: mockDisconnect,
            __mocks: {
                connect: mockConnect,
                disconnect: mockDisconnect,
            },
        },
    };
});

// Mock process.exit
const originalExit = process.exit;
const mockExit = vi.fn();

describe('Database Config', () => {
    let mockConnect, mockDisconnect;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockExit.mockClear();
        process.exit = mockExit;

        // Get mock functions from mongoose
        const mongooseModule = await import('mongoose');
        mockConnect = mongooseModule.default.connect;
        mockDisconnect = mongooseModule.default.disconnect;
    });

    afterEach(() => {
        process.exit = originalExit;
        vi.restoreAllMocks();
    });

    describe('connectDB', () => {
        it('should connect to MongoDB successfully and log info', async () => {
            mockConnect.mockResolvedValue(undefined);

            await connectDB();

            expect(mockConnect).toHaveBeenCalledWith('mongodb://test-uri');
            expect(logger.info).toHaveBeenCalledWith('Connected to MongoDB');
            expect(logger.error).not.toHaveBeenCalled();
            expect(mockExit).not.toHaveBeenCalled();
        });

        it('should handle connection error and exit process', async () => {
            const error = new Error('Connection failed');
            mockConnect.mockRejectedValue(error);

            await connectDB();

            expect(mockConnect).toHaveBeenCalledWith('mongodb://test-uri');
            expect(logger.error).toHaveBeenCalledWith(
                'Error connecting to MongoDB: Connection failed',
            );
            expect(logger.info).not.toHaveBeenCalled();
            expect(mockExit).toHaveBeenCalledWith(1);
        });
    });

    describe('disconnectDB', () => {
        it('should disconnect from MongoDB successfully and log info', async () => {
            mockDisconnect.mockResolvedValue(undefined);

            await disconnectDB();

            expect(mockDisconnect).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('Disconnected from MongoDB');
            expect(logger.error).not.toHaveBeenCalled();
            expect(mockExit).not.toHaveBeenCalled();
        });

        it('should handle disconnection error and exit process', async () => {
            const error = new Error('Disconnection failed');
            mockDisconnect.mockRejectedValue(error);

            await disconnectDB();

            expect(mockDisconnect).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(
                'Error disconnecting from MongoDB: Disconnection failed',
            );
            expect(logger.info).not.toHaveBeenCalled();
            expect(mockExit).toHaveBeenCalledWith(1);
        });
    });
});
