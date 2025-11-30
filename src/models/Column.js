import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        orderIndex: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true },
);

const Column = mongoose.model('Column', columnSchema);

export default Column;
