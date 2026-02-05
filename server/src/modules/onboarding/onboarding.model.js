import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    proficiency: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, { _id: false });

const onboardingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    domain: {
        type: String,
        required: true
    },
    year: {
        type: String, // Storing as String to match User model (e.g., "First Year" or "1")
        required: true
    },
    subjects: [subjectSchema],
    interests: [{
        type: String
    }],
    careerGoal: {
        type: String
    },
    learningStyle: {
        type: String,
        enum: ['visual', 'auditory', 'reading/writing', 'kinesthetic', 'hands-on', 'theoretical']
        // flexible enum or remove enum if strict validation not needed yet
    },
    selfAssessment: {
        coding: { type: Number, min: 1, max: 5 },
        problemSolving: { type: Number, min: 1, max: 5 },
        math: { type: Number, min: 1, max: 5 }
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Onboarding', onboardingSchema);
