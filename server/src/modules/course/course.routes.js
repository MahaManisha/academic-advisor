import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} from "./course.controller.js";

const router = Router();

// Public read access might be needed for students, but for now we focus on Admin Mgmt
// We'll protect everything for safety first, then open up if needed.

router.get("/", getAllCourses); // Allow all logged in users to see courses? Or just admin/students? Let's keep it open for now for Student View later.
router.get("/:id", getCourseById);

// Admin Only
router.post("/", authMiddleware, roleMiddleware("admin"), createCourse);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateCourse);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCourse);

export default router;
