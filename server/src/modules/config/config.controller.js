import SystemConfig from "./config.model.js";

// Default Onboarding Config
const defaultOnboarding = {
    focusAreas: [
        { id: 'academic', title: 'Boost GPA', desc: 'Master course material' },
        { id: 'career', title: 'Career Prep', desc: 'Build job-ready skills' },
        { id: 'research', title: 'Research', desc: 'Deep theoretical dive' }
    ],
    learningModes: [
        { id: 'visual', label: 'Visual', desc: 'Videos, Diagrams, Slides' },
        { id: 'hands-on', label: 'Hands-on', desc: 'Projects, Labs, Coding' },
        { id: 'reading', label: 'Theory', desc: 'Textbooks, Papers, Notes' }
    ],
    showExperienceSlider: true
};

export const getOnboardingConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne({ key: 'onboarding' });
        if (!config) {
            // Create default if missing
            config = await SystemConfig.create({ key: 'onboarding', value: defaultOnboarding });
        }
        res.json({ success: true, data: config.value });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateOnboardingConfig = async (req, res) => {
    try {
        const config = await SystemConfig.findOneAndUpdate(
            { key: 'onboarding' },
            { value: req.body },
            { new: true, upsert: true }
        );
        res.json({ success: true, data: config.value });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
