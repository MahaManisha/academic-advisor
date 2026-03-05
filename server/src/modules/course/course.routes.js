import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    generateAIMissions,
    generateVideoAssessment
} from "./course.controller.js";

const router = Router();

// Public read access might be needed for students, but for now we focus on Admin Mgmt
// We'll protect everything for safety first, then open up if needed.

router.get("/", getAllCourses); // Allow all logged in users to see courses? Or just admin/students? Let's keep it open for now for Student View later.
router.post("/generate", authMiddleware, generateAIMissions);
router.post("/:id/assessment", authMiddleware, generateVideoAssessment);
router.get("/:id", getCourseById);

// Course creation available to all auth users (to save AI courses)
router.post("/", authMiddleware, createCourse);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateCourse);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCourse);

export default router;
