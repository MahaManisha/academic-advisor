// server/src/modules/marksheet/marksheet.controller.js
import User from "../user/user.model.js";
import UserAnalytics from "../../models/UserAnalytics.js";
import { 
  analyzeMarksheetWithAI, 
  analyzeSubjectCreditsWithAI, 
  extractMarksheetFromImageWithAI,
  extractMarksheetFromPdfTextWithAI 
} from "./marksheet.ai.service.js";

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

    const analysis = await analyzeMarksheetWithAI(sheet, studentContext).catch(err => {
       console.error("Groq AI Error:", err);
       throw new Error("AI provider is currently busy. Please try again.");
    });

    // Cache the analysis back in the DB
    sheet.aiAnalysis = analysis;
    
    // Extract Expertise Domain if present
    const domainMatch = analysis.match(/EXPERT DOMAIN:\s*(.+)/i);
    const learningMatch = analysis.match(/LEARNING SUGGESTIONS:\s*([\s\S]*?)(?=\n[A-Z\s]+:|$)/i);
    
    if (domainMatch && domainMatch[1]) {
      const expertDomain = domainMatch[1].trim();
      let recommendedCourses = [];
      
      if (learningMatch && learningMatch[1]) {
        recommendedCourses = learningMatch[1].trim().split('\n')
          .map(line => line.replace(/^[-*•\d.]+\s*/, '').trim())
          .filter(line => line.length > 3);
      }
      
      console.log("Found Expert Domain:", expertDomain);
      console.log("Found Learning Suggestions:", recommendedCourses);

      // Perform updates concurrently to speed up response
      await Promise.all([
        UserAnalytics.findOneAndUpdate(
          { userId: user._id },
          { 
            $pull: { 
              recommendedTracks: expertDomain,
              recommendedCourses: { $in: recommendedCourses }
            } 
          },
          { upsert: true }
        ).then(() => 
          UserAnalytics.findOneAndUpdate(
            { userId: user._id },
            { 
              $push: { 
                recommendedTracks: { $each: [expertDomain], $position: 0 },
                recommendedCourses: { $each: recommendedCourses, $position: 0 }
              },
              $set: { cognitiveProfile: `Expert in ${expertDomain}` }
            }
          )
        ),
        User.findByIdAndUpdate(user._id, { domain: expertDomain })
      ]);
    }

    await user.save();
    console.log("Analysis saved successfully for sheet:", id);
    res.json({ success: true, analysis });
  } catch (err) {
    console.error("Detailed AI Analysis Error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Analysis failed due to a server error." 
    });
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
    // Ensure credits are present for analysis
    const subjectWithMeta = {
      ...subject.toObject(),
      credits: subject.credits || 3
    };

    const studentContext = {
      department: user.department || user.domain,
      degree: user.degreeType,
      year: user.year
    };

    const advice = await analyzeSubjectCreditsWithAI(subjectWithMeta, studentContext);
    res.json({ success: true, advice });
  } catch (err) {
    next(err);
  }
};

// ─── AI: Extract structured data from image ──────────────────────────────────
export const extractFromImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "Base64 image data is required." });
    }

    const data = await extractMarksheetFromImageWithAI(image);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Image Extraction Error:", err);
    res.status(500).json({ message: "AI Extraction failed: " + err.message });
  }
};

// ─── AI: Extract structured data from Text ───────────────────────────────────
export const extractFromText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required." });
    }

    const data = await extractMarksheetFromPdfTextWithAI(text);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Text Extraction Error:", err);
    res.status(500).json({ message: "AI Analysis failed: " + err.message });
  }
};
