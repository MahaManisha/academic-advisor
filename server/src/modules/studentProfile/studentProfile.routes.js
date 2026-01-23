import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  getMyProfile,
  updateMyProfile
} from "./studentProfile.controller.js";

const router = Router();

router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);

export default router;
