import { Server } from 'socket.io';
import { socketAuthMiddleware } from '#src/middlewares/socket.auth.middleware.js';
import { registerTaskHandlers } from '#src/socket/handlers/task.handlers.js';
import logger from '#src/config/logger.js';
import { env } from '#src/config/env.js';

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) {
                    return callback(null, true);
                }
                // In development, allow all origins
                if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
                    return callback(null, true);
                }
                // In production, check against allowed origins
                const allowedOrigins = env.FRONTEND_URL ? [env.FRONTEND_URL] : [];
                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                return callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
        },
    });

    // Authentication middleware
    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user._id} (${socket.user.email})`);

        // Register task handlers
        registerTaskHandlers(io, socket);
    });

    return io;
};

