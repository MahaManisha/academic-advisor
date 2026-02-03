// server/src/modules/user/user.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import { getAllUsers, getUserStats, updateUserStatus, getStudentProfile } from "./user.controller.js";

const router = Router();

// Only logged-in users
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});


// Admin routes
router.get("/", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/stats", authMiddleware, roleMiddleware("admin"), getUserStats);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateUserStatus
);
router.get(
  "/:id/profile",
  authMiddleware,
  roleMiddleware("admin"),
  getStudentProfile
);

// Only admins welcome message (keep for legacy check)
router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin"
    });
  }
);

export default router;
