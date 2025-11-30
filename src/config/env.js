import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

function getEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export const env = {
    PORT: getEnv('PORT'),
    NODE_ENV: getEnv('NODE_ENV'),

    DB_URI: getEnv('DB_URI'),

    FRONTEND_URL: getEnv('FRONTEND_URL'),

    JWT_SECRET: getEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN'),
    JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
    JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN'),

    RATE_LIMIT_WINDOW: getEnv('RATE_LIMIT_WINDOW'),
    RATE_LIMIT_MAX: getEnv('RATE_LIMIT_MAX'),
};
