const mongoose = require('mongoose');

const uvgSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },

        // Sum of all product vectors user interacted with
        sumVector: {
            type: [Number],
            required: true,
            default: () => new Array(768).fill(0)
        },
        
        totalWeight: {
            type: Number,
            required: true,
            default: 0
        },

        // for analytics
        interactionCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const userVectorGrowth = mongoose.model('userVectorGrowth', uvgSchema);

module.exports = userVectorGrowth;