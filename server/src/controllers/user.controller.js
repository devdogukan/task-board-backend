import * as userService from '#src/services/user.service.js';
import ApiResponse from '#src/utils/response.util.js';

export const getUserById = async (req, res, next) => {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    return ApiResponse.success(200, 'User fetched successfully', user).send(
        res,
    );
};

export const updateUser = async (req, res, next) => {
    const userId = req.params.id;
    const userData = req.body;
    const user = await userService.updateUser(userId, userData);
    return ApiResponse.success(200, 'User updated successfully', user).send(
        res,
    );
};

export const deleteUser = async (req, res, next) => {
    const userId = req.params.id;
    await userService.deleteUser(userId);
    return ApiResponse.success(200, 'User deleted successfully').send(res);
};

export const getAllUsers = async (req, res, next) => {
    try {
        // Use validatedQuery if available, otherwise use query
        const queryParams = req.validatedQuery || req.query;
        const users = await userService.getAllUsers(queryParams);
        return ApiResponse.success(200, 'Users fetched successfully', users).send(
            res,
        );
    } catch (error) {
        return next(error);
    }
};
