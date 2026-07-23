// server/src/modules/career/career.routes.js
import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { predictCareer, getCareerProfile, getRoadmap } from './career.controller.js';
import { submitAcademicFoundation, getAcademicFoundation } from './academicProfile.controller.js';
import { submitCareerInterest, getCareerInterest } from './careerInterest.controller.js';
import { submitLearningBehaviour, getLearningBehaviour } from './learningBehaviour.controller.js';
import { submitCognitiveBehaviour, getCognitiveBehaviour } from './cognitiveBehaviour.controller.js';
import { submitCareerCompatibility, getCareerCompatibility } from './careerCompatibility.controller.js';
import { submitAcademicDna, getAcademicDna } from './academicDna.controller.js';

const router = Router();
router.use(authMiddleware);

// Mission 1: Academic Foundation (No AI / LLM)
router.get('/mission-1', getAcademicFoundation);
router.post('/mission-1', submitAcademicFoundation);

// Mission 2: Career Interest Discovery (AHP Math - No AI / LLM)
router.get('/mission-2', getCareerInterest);
router.post('/mission-2', submitCareerInterest);

// Mission 3: Learning Behaviour Profiling (Fuzzy Logic Engine - No AI / LLM)
router.get('/mission-3', getLearningBehaviour);
router.post('/mission-3', submitLearningBehaviour);

// Mission 4: Cognitive & Behaviour Discovery (Telemetry & Vector - No AI / LLM)
router.get('/mission-4', getCognitiveBehaviour);
router.post('/mission-4', submitCognitiveBehaviour);

// Mission 5: Career Compatibility Analysis (Multi-Vector Synthesis Engine - No AI / LLM)
router.get('/mission-5', getCareerCompatibility);
router.post('/mission-5', submitCareerCompatibility);

// Mission 6: Academic DNA Generation (Permanent Profile Synthesis - No AI / LLM)
router.get('/mission-6', getAcademicDna);
router.post('/mission-6', submitAcademicDna);

router.get('/profile',           getCareerProfile);   // GET  /api/career/profile
router.post('/predict',          predictCareer);       // POST /api/career/predict
router.get('/roadmap/:roleIndex', getRoadmap);         // GET  /api/career/roadmap/:idx

export default router;






