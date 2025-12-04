import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },

        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            required: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        status: {
            type: String,
            enum: ['active', 'archived', 'completed'],
            default: 'active',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
