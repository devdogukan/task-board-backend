import mongoose from 'mongoose';

import { env } from '#src/config/env.js';
import logger from '#src/config/logger.js';

const connectDB = async () => {
    try {
        await mongoose.connect(env.DB_URI);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
    } catch (error) {
        logger.error(`Error disconnecting from MongoDB: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Get session options for Mongoose operations
 * @param {Object|null} session - MongoDB session object
 * @returns {Object} Options object with session if available
 */
const getSessionOptions = (session) => {
    return session ? { session } : {};
};

/**
 * Execute a function within a MongoDB transaction
 * @param {Function} callback - Async function that receives a session parameter
 * @returns {Promise<any>} - Result of the callback function
 */
const withTransaction = async (callback) => {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        // If transactions aren't supported (standalone MongoDB), execute without transaction
        if (error.message && 
            error.message.includes('Transaction numbers are only allowed')) {
            logger.warn('Transactions not supported, executing without transaction');
            // Execute callback without session (pass null as session)
            return await callback(null);
        }
        throw error;
    }
};

export { connectDB, disconnectDB, withTransaction, getSessionOptions };
