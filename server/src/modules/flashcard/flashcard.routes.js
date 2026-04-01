import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
    generateFlashcards,
    getMyFlashcardSets,
    getFlashcardSet
} from "./flashcard.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/generate", generateFlashcards);
router.get("/", getMyFlashcardSets);
router.get("/:id", getFlashcardSet);

export default router;
