import jwt from 'jsonwebtoken';

import logger from '#src/config/logger.js';
import ApiResponse from '#src/utils/response.util.js';
import { env } from '#src/config/env.js';
import { User } from '#src/models/index.js';
import { UnauthorizedError, NotFoundError } from '#src/utils/errors/index.js';

export const authMiddleware = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        logger.error('Bearer token is not provided');
        return next(new UnauthorizedError('Bearer token is not provided'));
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            logger.error(`User not found: ${decoded.id}`);
            return next(new NotFoundError('User not found'));
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error(`Invalid token: ${error.message}`);
        return next(error);
    }
};
