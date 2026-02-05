import * as onboardingService from './onboarding.service.js';

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
