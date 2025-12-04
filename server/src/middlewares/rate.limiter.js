import expressRateLimit from 'express-rate-limit';
import { env } from '#src/config/env.js';
import { parseExpirationToMs } from '#src/utils/time.util.js';

const rateLimitConfigs = {
    auth: {
        windowMs: parseExpirationToMs(env.RATE_LIMIT_WINDOW),
        max: parseInt(env.RATE_LIMIT_MAX, 10),
        message: 'Too many authentication attempts, please try again later',
    },
    default: {
        windowMs: parseExpirationToMs(env.RATE_LIMIT_WINDOW),
        max: parseInt(env.RATE_LIMIT_MAX, 10) * 2,
        message: 'Too many requests, please try again later',
    },
    task: {
        windowMs: parseExpirationToMs(env.RATE_LIMIT_WINDOW),
        max: parseInt(env.RATE_LIMIT_MAX, 10) * 3,
        message: 'Too many task requests, please try again later',
    },
    project: {
        windowMs: parseExpirationToMs(env.RATE_LIMIT_WINDOW),
        max: parseInt(env.RATE_LIMIT_MAX, 10) * 3,
        message: 'Too many project requests, please try again later',
    },
    user: {
        windowMs: parseExpirationToMs(env.RATE_LIMIT_WINDOW),
        max: parseInt(env.RATE_LIMIT_MAX, 10) * 2,
        message: 'Too many user requests, please try again later',
    },
    folder: {
        windowMs: parseExpirationToMs(env.RATE_LIMIT_WINDOW),
        max: parseInt(env.RATE_LIMIT_MAX, 10) * 3,
        message: 'Too many folder requests, please try again later',
    },
    column: {
        windowMs: parseExpirationToMs(env.RATE_LIMIT_WINDOW),
        max: parseInt(env.RATE_LIMIT_MAX, 10) * 3,
        message: 'Too many column requests, please try again later',
    },
};

export const rateLimit = (type = 'default') => {
    const config = rateLimitConfigs[type] || rateLimitConfigs.default;

    return expressRateLimit({
        windowMs: config.windowMs,
        max: config.max,
        message: config.message,
        standardHeaders: true,
        legacyHeaders: false,
    });
};
