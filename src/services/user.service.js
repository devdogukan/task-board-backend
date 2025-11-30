import { User } from '#src/models/index.js';
import { NotFoundError } from '#src/utils/errors/index.js';

export const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
};

export const updateUser = async (userId, userData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: userData },
        { new: true, runValidators: true },
    );
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
};

export const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
};

export const getAllUsers = async (queryParams = {}) => {
    // Handle pagination if provided
    const { page, limit } = queryParams;
    const query = User.find({});

    if (page && limit) {
        const skip = (page - 1) * limit;
        query.skip(skip).limit(parseInt(limit));
    }

    const users = await query;
    return users;
};

