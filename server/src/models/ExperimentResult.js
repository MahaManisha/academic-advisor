const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ExperimentResult Schema
 * 
 * Stores A/B/C/D comparison metrics across different recommendation
 * algorithm variants to analyze and optimize results.
 */
const ExperimentResultSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    experimentId: {
        type: String,
        required: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    variants: [{
        variantId: {
            type: String,
            required: true, // e.g. "V1", "V2", "V3", "V4"
            enum: ["V1", "V2", "V3", "V4"]
        },
        algorithmUsed: {
            type: String,
            required: true // e.g. "Rule-based only", "Hybrid (Analytics + RAG + LLM)"
        },
        recommendationOutput: {
            type: Schema.Types.Mixed // Whatever was generated for this variant
        },
        metrics: {
            userFeedbackScore: {
                type: Number,
                default: 0 // Captured later, usually 1-5 or 0-100
            },
            engagementScore: {
                type: Number,
                default: 0 // Real-time engagement signals (time spent, clicks)
            },
            recommendationConfidence: {
                type: Number,
                default: 0 // The internal confidence metric reported by the algorithm itself
            },
            completionRate: {
                type: Number,
                default: 0 // Percentage representation of tasks/courses completed following the prompt
            }
        }
    }]
});

module.exports = mongoose.model('ExperimentResult', ExperimentResultSchema);
