import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        columnId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Column',
            required: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        orderIndex: {
            type: Number,
            required: true,
            default: 0,
        },
        assignees: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        dueDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

taskSchema.virtual('users', {
    ref: 'User',
    localField: 'assignees',
    foreignField: '_id',
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
