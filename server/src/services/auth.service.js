import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { User } from '#src/models/index.js';
import { parseExpirationToMs } from '#src/utils/time.util.js';
import { env } from '#src/config/env.js';
import {
    ConflictError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from '#src/utils/errors/index.js';

// Constants
const SALT_ROUNDS = 10;

// Helper Functions
const generateTokens = (userId) => {
    const token = jwt.sign({ id: userId }, env.JWT_SECRET, {
        expiresIn: parseExpirationToMs(env.JWT_EXPIRES_IN),
    });
    const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
        expiresIn: parseExpirationToMs(env.JWT_REFRESH_EXPIRES_IN),
    });
    return { token, refreshToken };
};

const sanitizeUser = (user) => {
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

// Service Functions
export const register = async (userData) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new ConflictError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    const user = await User.create({
        ...userData,
        password: hashedPassword,
    });

    return sanitizeUser(user);
};

export const login = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new BadRequestError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new BadRequestError('Invalid email or password');
    }

    const tokens = generateTokens(user._id);
    const sanitizedUser = sanitizeUser(user);

    return {
        user: sanitizedUser,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
    };
};

export const refreshToken = async (oldRefreshToken) => {
    if (!oldRefreshToken) {
        throw new UnauthorizedError('Refresh token is not provided');
    }

    let decoded;
    try {
        decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const tokens = generateTokens(user._id);
    const sanitizedUser = sanitizeUser(user);

    return {
        user: sanitizedUser,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
    };
};

export { sanitizeUser, generateTokens };

