import { Router } from "express";
import { register, login, verify, resend } from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verify);
router.post("/resend-otp", resend);

export default router;
