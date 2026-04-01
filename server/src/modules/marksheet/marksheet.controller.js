// server/src/modules/marksheet/marksheet.controller.js
import User from "../user/user.model.js";
import { analyzeMarksheetWithAI, analyzeSubjectCreditsWithAI } from "./marksheet.ai.service.js";

// ─── GET all marksheets for the logged-in student ────────────────────────────
export const getMarksheets = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("marksheets fullName department degreeType year domain");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, marksheets: user.marksheets || [] });
  } catch (err) {
    next(err);
  }
};

// ─── ADD / UPLOAD a marksheet ─────────────────────────────────────────────────
export const addMarksheet = async (req, res, next) => {
  try {
    const { semester, year, subjects, cgpa, sgpa, totalCredits, creditsEarned } = req.body;

    if (!semester || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: "Semester and at least one subject are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newSheet = {
      semester,
      year,
      subjects,
      cgpa,
      sgpa,
      totalCredits,
      creditsEarned,
      uploadedAt: new Date(),
      aiAnalysis: null
    };

    user.marksheets.push(newSheet);
    await user.save();

    const saved = user.marksheets[user.marksheets.length - 1];
    res.status(201).json({ success: true, marksheet: saved });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE a marksheet ───────────────────────────────────────────────────────
export const deleteMarksheet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.marksheets = user.marksheets.filter(m => m._id.toString() !== id);
    await user.save();
    res.json({ success: true, message: "Marksheet deleted." });
  } catch (err) {
    next(err);
  }
};

// ─── AI: Analyse an entire marksheet ─────────────────────────────────────────
export const analyzeMarksheetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const sheet = user.marksheets.id(id);
    if (!sheet) return res.status(404).json({ message: "Marksheet not found" });

    const studentContext = {
      name: user.fullName,
      department: user.department || user.domain,
      degree: user.degreeType,
      year: user.year
    };

    const analysis = await analyzeMarksheetWithAI(sheet, studentContext);

    // Cache the analysis back in the DB
    sheet.aiAnalysis = analysis;
    await user.save();

    res.json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
};

// ─── AI: Analyse a single subject by credits ─────────────────────────────────
export const analyzeSubject = async (req, res, next) => {
  try {
    const { id, subjectIndex } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const sheet = user.marksheets.id(id);
    if (!sheet) return res.status(404).json({ message: "Marksheet not found" });

    const idx = parseInt(subjectIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= sheet.subjects.length) {
      return res.status(404).json({ message: "Subject index out of range." });
    }

    const subject = sheet.subjects[idx];

    const studentContext = {
      department: user.department || user.domain,
      degree: user.degreeType,
      year: user.year
    };

    const advice = await analyzeSubjectCreditsWithAI(subject, studentContext);
    res.json({ success: true, advice });
  } catch (err) {
    next(err);
  }
};
