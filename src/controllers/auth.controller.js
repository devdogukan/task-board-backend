import * as authService from '#src/services/auth.service.js';
import ApiResponse from '#src/utils/response.util.js';
import { parseExpirationToMs } from '#src/utils/time.util.js';
import { env } from '#src/config/env.js';

const setRefreshTokenCookie = (res, refreshToken) => {
    const maxAge = parseExpirationToMs(env.JWT_REFRESH_EXPIRES_IN);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
    });
};

// Controllers
export const register = async (req, res, next) => {
    try {
        const userData = req.body;
        const user = await authService.register(userData);
        return ApiResponse.success(
            201,
            'User registered successfully',
            user,
        ).send(res);
    } catch (error) {
        return next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token, refreshToken } = await authService.login(
            email,
            password,
        );

        setRefreshTokenCookie(res, refreshToken);

        const userResponseData = { user, token: token };
        return ApiResponse.success(
            200,
            'User logged in successfully',
            userResponseData,
        ).send(res);
    } catch (error) {
        return next(error);
    }
};

export const logout = async (req, res) => {
    res.clearCookie('refreshToken');
    return ApiResponse.success(200, 'User logged out successfully').send(res);
};

export const refreshToken = async (req, res, next) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        const { user, token, refreshToken: newRefreshToken } =
            await authService.refreshToken(oldRefreshToken);

        setRefreshTokenCookie(res, newRefreshToken);

        const userResponseData = { user, token: token };
        return ApiResponse.success(
            200,
            'Token refreshed successfully',
            userResponseData,
        ).send(res);
    } catch (error) {
        return next(error);
    }
};

export const getCurrentUser = async (req, res) => {
    const user = req.user;
    return ApiResponse.success(200, 'User fetched successfully', user).send(res);
};
