import * as onboardingService from './onboarding.service.js';
import * as ragService from './onboarding.rag.service.js';
import User from '../user/user.model.js';

export const getQuestions = async (req, res) => {
    try {
        const data = await onboardingService.getOnboardingQuestions(req.user.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Onboarding Questions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch onboarding questions',
            error: error.message
        });
    }
};

export const submitOnboarding = async (req, res) => {
    try {
        const result = await onboardingService.submitOnboarding(req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Onboarding completed successfully',
            data: result
        });
    } catch (error) {
        console.error('Onboarding Submit Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit onboarding data',
            error: error.message
        });
    }
};

export const getAdaptiveQuestion = async (req, res) => {
    try {
        const { domain, difficulty, previousAnalysis } = req.body;
        // Default difficulty if not provided is 3
        const level = difficulty || 3;

        let accessibilityPrefs = {};
        if (req.user && (req.user.id || req.user.userId)) {
            const user = await User.findById(req.user.id || req.user.userId);
            if (user && user.accessibilityPreferences) {
                accessibilityPrefs = user.accessibilityPreferences;
            }
        }

        const question = await ragService.generateAdaptiveQuestion(domain, level, previousAnalysis, accessibilityPrefs);

        res.status(200).json({
            success: true,
            question,
            difficulty: level
        });
    } catch (error) {
        console.error('Adaptive Question Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate question', error: error.message });
    }
};

export const evaluateAdaptiveAnswer = async (req, res) => {
    try {
        const { domain, question, answer } = req.body;

        const evaluation = await ragService.evaluateAdaptiveAnswer(domain, question, answer);

        // Dynamically adjust difficulty based on performance
        let nextDifficulty = question.difficulty;
        if (evaluation.score >= 0.8) nextDifficulty = Math.min(5, nextDifficulty + 1);
        else if (evaluation.score <= 0.4) nextDifficulty = Math.max(1, nextDifficulty - 1);

        res.status(200).json({
            success: true,
            evaluation,
            nextDifficulty
        });
    } catch (error) {
        console.error('Adaptive Evaluation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to evaluate answer', error: error.message });
    }
};
