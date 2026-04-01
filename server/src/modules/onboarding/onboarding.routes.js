import { Router } from 'express';
import protect from '../../middlewares/auth.middleware.js';
import * as onboardingController from './onboarding.controller.js';

const router = Router();

const checkVerified = (req, res, next) => {
    if (!req.user.emailVerified) {
        return res.status(403).json({ message: "Email not verified" });
    }
    next();
};

router.get('/questions', protect, checkVerified, onboardingController.getQuestions);
router.post('/submit', protect, checkVerified, onboardingController.submitOnboarding);
router.post('/diagnostic/test', protect, checkVerified, onboardingController.getDiagnosticTest);
router.post('/diagnostic/evaluate', protect, checkVerified, onboardingController.evaluateDiagnosticTest);

export default router;
