// server/src/modules/career/career.routes.js
import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { predictCareer, getCareerProfile, getRoadmap } from './career.controller.js';

const router = Router();
router.use(authMiddleware);

router.get('/profile',           getCareerProfile);   // GET  /api/career/profile
router.post('/predict',          predictCareer);       // POST /api/career/predict
router.get('/roadmap/:roleIndex', getRoadmap);         // GET  /api/career/roadmap/:idx

export default router;
