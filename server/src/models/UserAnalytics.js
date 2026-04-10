import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * UserAnalytics Schema
 * 
 * Stores the computed intelligence layer data for a user.
 * This includes their domain interest vectors, cognitive profiles,
 * and algorithmically recommended tracks.
 */
const UserAnalyticsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Indexed for faster querying by user
    },
    interestVector: {
        type: Map,
        of: Number,
        default: {}
    },
    passionScore: {
        type: Number,
        default: 0
    },
    strengthWeaknessMap: {
        // Using Mixed type as per requirements to allow flexible strength/weakness arrays or objects
        type: Schema.Types.Mixed,
        default: {}
    },
    cognitiveProfile: {
        type: String,
        default: '' // Can store primary trait or serialized profile
    },
    confidenceScore: {
        type: Number,
        default: 0
    },
    recommendedTracks: {
        type: [String],
        default: []
    },
    recommendedCourses: {
        type: [String],
        default: []
    },
    algorithmVersion: {
        type: String,
        default: '1.0.0'
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

export default mongoose.model('UserAnalytics', UserAnalyticsSchema);
