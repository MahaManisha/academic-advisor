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

export const getDiagnosticTest = async (req, res) => {
    try {
        const { domain } = req.body;

        let accessibilityPrefs = {};
        let syllabusUrl = null;
        if (req.user && (req.user.id || req.user.userId)) {
            const user = await User.findById(req.user.id || req.user.userId);
            if (user) {
                accessibilityPrefs = user.accessibilityPreferences || {};
                syllabusUrl = user.syllabusUrl || null;
            }
        }

        const testResponse = await ragService.generateDiagnosticTest(domain, accessibilityPrefs, syllabusUrl);

        res.status(200).json({
            success: true,
            questions: testResponse.questions || []
        });
    } catch (error) {
        console.error('Diagnostic Test Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate test', error: error.message });
    }
};

export const evaluateDiagnosticTest = async (req, res) => {
    try {
        const { domain, questions, answers } = req.body;

        let syllabusUrl = null;
        if (req.user && (req.user.id || req.user.userId)) {
            const user = await User.findById(req.user.id || req.user.userId);
            if (user) syllabusUrl = user.syllabusUrl || null;
        }

        const evaluation = await ragService.evaluateDiagnosticTest(domain, questions, answers, syllabusUrl);

        res.status(200).json({
            success: true,
            evaluation
        });
    } catch (error) {
        console.error('Diagnostic Test Evaluation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to evaluate test', error: error.message });
    }
};
