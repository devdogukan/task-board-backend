import http from 'http';
import app from '#src/app.js';

import { env } from '#src/config/env.js';
import { connectDB, disconnectDB } from '#src/config/database.js';
import logger from '#src/config/logger.js';
import { initializeSocket } from '#src/socket/socket.js';

let server;

(async () => {
    try {
        await connectDB();
        
        // Create HTTP server
        server = http.createServer(app);
        
        // Initialize Socket.io
        const io = initializeSocket(server);
        
        // Make io available to app if needed
        app.set('io', io);
        
        server.listen(env.PORT, () => {
            logger.info(
                `Server is running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`,
            );
        });
    } catch (error) {
        logger.error('Error starting the server', error);
        process.exit(1);
    }
})();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    
    if (server) {
        server.close(() => {
            logger.info('HTTP server closed');
        });
    }
    
    await disconnectDB();
    logger.info('Server is shutting down...');
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
