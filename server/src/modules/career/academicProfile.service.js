// server/src/modules/career/academicProfile.service.js
import AcademicProfile from "./academicProfile.model.js";
import User from "../user/user.model.js";
import { updateProgress } from "../gamification/gamification.service.js";


/**
 * Generate a normalized 16-dimensional Academic Profile Vector
 * Purely deterministic - NO AI / LLM models used.
 */
export const generateAcademicVector = (data) => {
  const {
    degree = "",
    department = "",
    currentYear = 1,
    currentSemester = 1,
    expectedGraduation = 2026,
    cgpa = null,
    backlogs = 0,
    programmingExperience = "Beginner",
    knownLanguages = [],
    completedProjects = [],
    certifications = [],
    syllabusUrl = "",
    syllabusPdfPath = ""
  } = data;

  // 1. Degree Category Score
  const degLower = degree.toLowerCase();
  let degScore = 0.5;
  if (degLower.includes("b.tech") || degLower.includes("b.e")) degScore = 0.8;
  else if (degLower.includes("m.tech") || degLower.includes("m.e")) degScore = 0.95;
  else if (degLower.includes("bca") || degLower.includes("b.sc")) degScore = 0.7;
  else if (degLower.includes("mca") || degLower.includes("m.sc")) degScore = 0.85;
  else if (degLower.includes("phd") || degLower.includes("doctor")) degScore = 1.0;

  // 2. Department Alignment Score
  const deptLower = department.toLowerCase();
  let deptScore = 0.5;
  if (deptLower.includes("computer") || deptLower.includes("software") || deptLower.includes("ai") || deptLower.includes("data")) {
    deptScore = 1.0;
  } else if (deptLower.includes("electric") || deptLower.includes("electron") || deptLower.includes("info")) {
    deptScore = 0.85;
  } else if (deptLower.includes("mechanic") || deptLower.includes("civil") || deptLower.includes("aero")) {
    deptScore = 0.65;
  }

  // 3. Year Normalized
  const yearNorm = Math.min(1.0, currentYear / 4.0);

  // 4. Semester Normalized
  const semNorm = Math.min(1.0, currentSemester / 8.0);

  // 5. Graduation Horizon (Years remaining relative to current year)
  const currentCalYear = new Date().getFullYear();
  const yearsLeft = Math.max(0, expectedGraduation - currentCalYear);
  const gradHorizon = Math.max(0.0, Math.min(1.0, 1.0 - (yearsLeft / 5.0)));

  // 6. CGPA Normalized
  const cgpaNorm = cgpa !== null && !isNaN(cgpa) ? Math.min(1.0, Math.max(0.0, Number(cgpa) / 10.0)) : 0.0;

  // 7. Backlog Health Index (1.0 = No backlogs, decays with count)
  const backlogHealth = Math.max(0.0, 1.0 - (Number(backlogs || 0) * 0.2));

  // 8. Programming Experience Level
  const expMap = { None: 0.0, Beginner: 0.33, Intermediate: 0.67, Advanced: 1.0 };
  const expScore = expMap[programmingExperience] !== undefined ? expMap[programmingExperience] : 0.33;

  // 9. Language Stack Diversity Score
  const langScore = Math.min(1.0, (knownLanguages?.length || 0) / 6.0);

  // 10. Completed Projects Score
  const projScore = Math.min(1.0, (completedProjects?.length || 0) / 4.0);

  // 11. Certifications Score
  const certScore = Math.min(1.0, (certifications?.length || 0) / 3.0);

  // 12. Syllabus Spec Score
  const syllabusScore = (syllabusUrl || syllabusPdfPath) ? 1.0 : 0.0;

  // 13. Core Languages Flag (Python/JS/C++/Java presence)
  const coreLangs = ["javascript", "python", "java", "c++", "c", "typescript", "go", "rust"];
  const hasCore = knownLanguages.some(l => coreLangs.includes(l.toLowerCase()));
  const coreLangScore = hasCore ? 1.0 : 0.5;

  // 14. Project Detail Complexity Factor
  let projDetailLen = 0;
  if (Array.isArray(completedProjects)) {
    projDetailLen = completedProjects.reduce((acc, p) => acc + (p.description?.length || p.title?.length || 0), 0);
  }
  const projDetailScore = Math.min(1.0, projDetailLen / 150.0);

  // 15. Overall Academic Standing Index
  const standingIndex = cgpaNorm > 0 ? (cgpaNorm * 0.7 + backlogHealth * 0.3) : backlogHealth * 0.8;

  // 16. Profile Completeness Score
  let optionalCount = 0;
  if (cgpa !== null) optionalCount++;
  if (backlogs !== undefined) optionalCount++;
  if (certifications?.length > 0) optionalCount++;
  if (syllabusUrl || syllabusPdfPath) optionalCount++;
  const completenessScore = 0.5 + (optionalCount / 4.0) * 0.5;

  const vector = [
    degScore,
    deptScore,
    yearNorm,
    semNorm,
    gradHorizon,
    cgpaNorm,
    backlogHealth,
    expScore,
    langScore,
    projScore,
    certScore,
    syllabusScore,
    coreLangScore,
    projDetailScore,
    standingIndex,
    completenessScore
  ].map(v => Number(v.toFixed(4)));

  return vector;
};

/**
 * Validate Mission 1 Academic Background Input
 */
export const validateAcademicData = (data) => {
  const errors = [];

  if (!data.collegeName?.trim()) errors.push("College Name is required.");
  if (!data.university?.trim()) errors.push("University is required.");
  if (!data.degree?.trim()) errors.push("Degree is required.");
  if (!data.department?.trim()) errors.push("Department is required.");
  if (!data.currentYear || isNaN(data.currentYear) || data.currentYear < 1) errors.push("Current Year must be a valid positive number.");
  if (!data.currentSemester || isNaN(data.currentSemester) || data.currentSemester < 1) errors.push("Current Semester must be a valid positive number.");
  if (!data.expectedGraduation || isNaN(data.expectedGraduation)) errors.push("Expected Graduation Year is required.");
  
  if (!data.programmingExperience || !["None", "Beginner", "Intermediate", "Advanced"].includes(data.programmingExperience)) {
    errors.push("Programming Experience must be one of: None, Beginner, Intermediate, Advanced.");
  }

  if (!Array.isArray(data.knownLanguages) || data.knownLanguages.length === 0) {
    errors.push("At least one Known Programming Language is required.");
  }

  if (!Array.isArray(data.completedProjects) || data.completedProjects.length === 0) {
    errors.push("At least one Completed Project is required.");
  } else {
    const invalidProj = data.completedProjects.some(p => typeof p === 'object' ? !p.title?.trim() : !String(p).trim());
    if (invalidProj) errors.push("Each project must have a valid title.");
  }

  // Validate optional numeric bounds if present
  if (data.cgpa !== null && data.cgpa !== undefined && data.cgpa !== "") {
    const numCgpa = Number(data.cgpa);
    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      errors.push("CGPA must be a number between 0 and 10.");
    }
  }

  if (data.backlogs !== null && data.backlogs !== undefined && data.backlogs !== "") {
    const numBk = Number(data.backlogs);
    if (isNaN(numBk) || numBk < 0) {
      errors.push("Backlogs cannot be negative.");
    }
  }

  return errors;
};

/**
 * Save or Update Academic Profile for Mission 1 & Award XP
 */
export const saveAcademicFoundation = async (userId, rawData, pdfFile = null) => {
  const validationErrors = validateAcademicData(rawData);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join(" "));
    err.statusCode = 400;
    throw err;
  }

  // Normalize inputs
  const collegeName = rawData.collegeName.trim();
  const university = rawData.university.trim();
  const degree = rawData.degree.trim();
  const department = rawData.department.trim();
  const currentYear = Number(rawData.currentYear);
  const currentSemester = Number(rawData.currentSemester);
  const expectedGraduation = Number(rawData.expectedGraduation);
  const cgpa = (rawData.cgpa !== null && rawData.cgpa !== undefined && rawData.cgpa !== "") ? Number(rawData.cgpa) : null;
  const backlogs = (rawData.backlogs !== null && rawData.backlogs !== undefined && rawData.backlogs !== "") ? Number(rawData.backlogs) : 0;
  const programmingExperience = rawData.programmingExperience;
  
  const knownLanguages = rawData.knownLanguages
    .map(l => String(l).trim())
    .filter(Boolean);

  const completedProjects = rawData.completedProjects.map(p => {
    if (typeof p === "string") return { title: p.trim(), description: "", link: "" };
    return {
      title: (p.title || "").trim(),
      description: (p.description || "").trim(),
      link: (p.link || "").trim()
    };
  });

  const certifications = Array.isArray(rawData.certifications)
    ? rawData.certifications.map(c => String(c).trim()).filter(Boolean)
    : [];

  const syllabusUrl = rawData.syllabusUrl ? String(rawData.syllabusUrl).trim() : "";
  const syllabusPdfPath = pdfFile ? (pdfFile.path || pdfFile.name || "uploaded_syllabus.pdf") : "";

  const normalizedData = {
    collegeName,
    university,
    degree,
    department,
    currentYear,
    currentSemester,
    expectedGraduation,
    cgpa,
    backlogs,
    programmingExperience,
    knownLanguages,
    completedProjects,
    certifications,
    syllabusUrl,
    syllabusPdfPath
  };

  // Generate deterministic vector (NO AI / LLM)
  const academicVector = generateAcademicVector(normalizedData);

  // Store in MongoDB
  const profile = await AcademicProfile.findOneAndUpdate(
    { userId },
    {
      userId,
      ...normalizedData,
      academicVector,
      completed: true,
      completedAt: new Date()
    },
    { new: true, upsert: true }
  );

  // Sync basic academic fields to User model for app compatibility
  await User.findByIdAndUpdate(userId, {
    college: collegeName,
    degreeType: degree,
    department: department,
    year: currentYear,
    course: `${degree} in ${department}`,
    skills: knownLanguages,
    syllabusUrl: syllabusUrl || user.syllabusUrl
  });

  // Award XP for Mission 1 completion (+250 XP)
  let xpResult = null;
  try {
    xpResult = await updateProgress(userId, 'MISSION_1_COMPLETE', 250);
  } catch (e) {
    console.error("Failed to award Mission 1 XP:", e.message);
  }


  return {
    profile,
    vector: academicVector,
    xpAwarded: 250,
    xpResult
  };
};

/**
 * Fetch existing Mission 1 Profile
 */
export const getAcademicFoundationByUserId = async (userId) => {
  const profile = await AcademicProfile.findOne({ userId });
  return profile;
};
