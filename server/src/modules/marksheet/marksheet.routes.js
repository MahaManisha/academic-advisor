// server/src/modules/marksheet/marksheet.routes.js
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  getMarksheets,
  addMarksheet,
  deleteMarksheet,
  analyzeMarksheetById,
  analyzeSubject,
  extractFromImage,
  extractFromText
} from "./marksheet.controller.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/",                               getMarksheets);          // GET  /api/marksheets
router.post("/",                              addMarksheet);           // POST /api/marksheets
router.post("/extract",                       extractFromImage);       // POST /api/marksheets/extract
router.post("/extract-text",                  extractFromText);        // POST /api/marksheets/extract-text
router.delete("/:id",                         deleteMarksheet);        // DEL  /api/marksheets/:id
router.post("/:id/analyze",                   analyzeMarksheetById);   // POST /api/marksheets/:id/analyze
router.post("/:id/subject/:subjectIndex/analyze", analyzeSubject);    // POST /api/marksheets/:id/subject/:idx/analyze

export default router;
