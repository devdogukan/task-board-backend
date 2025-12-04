import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
    },
    { timestamps: true, versionKey: false },
);

const User = mongoose.model('User', userSchema);

export default User;
