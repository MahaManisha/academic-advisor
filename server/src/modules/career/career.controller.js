// server/src/modules/career/career.controller.js
import CareerProfile from './career.model.js';
import UserAnalytics from '../../models/UserAnalytics.js';
import User from '../user/user.model.js';
import Groq from 'groq-sdk';

const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Helper: Build a rich student context from whatever data is available ──────
const buildStudentContext = (user, analytics) => {
  // Domain / Expert area
  const expertDomain =
    analytics?.recommendedTracks?.[0] ||
    user.domain ||
    user.areaOfInterest?.[0] ||
    user.careerInterest ||
    user.learningDomain ||
    user.fieldOfStudy ||
    user.course ||
    'Computer Science';

  // Suggested courses
  const suggestedCourses =
    analytics?.recommendedCourses?.slice(0, 5) ||
    user.areaOfInterest?.slice(0, 5) ||
    user.skills?.slice(0, 5) ||
    [];

  // CGPA — look in marksheets if not directly on user
  let cgpa = user.cgpa || 'N/A';
  if (cgpa === 'N/A' && user.marksheets?.length > 0) {
    const last = user.marksheets[user.marksheets.length - 1];
    cgpa = last.cgpa || last.gpa || 'N/A';
  }

  // Skills
  const skills = [
    ...(user.skills || []),
    ...(analytics?.recommendedCourses?.slice(0, 3) || []),
    ...(user.areaOfInterest || [])
  ].filter(Boolean).slice(0, 8);

  // AI analysis summaries from marksheets
  const aiAnalysisSummaries = (user.marksheets || [])
    .filter(m => m.aiAnalysis)
    .map(m => `${m.semester}: ${m.aiAnalysis.slice(0, 200)}`)
    .join('\n');

  return {
    expertDomain,
    suggestedCourses,
    cgpa,
    skills,
    aiAnalysisSummaries,
    department: user.department || user.domain || 'Computer Science',
    degree: user.degreeType || 'B.E/B.Tech',
    college: user.college || 'NEC Engineering College',
    year: user.year || 'N/A',
    academicStatus: user.academicStatus || 'college',
    fullName: user.fullName || 'Student'
  };
};

// ─── POST /api/career/predict ─────────────────────────────────────────────────
export const predictCareer = async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, analytics] = await Promise.all([
      User.findById(userId),
      UserAnalytics.findOne({ userId })
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const ctx = buildStudentContext(user, analytics);

    const prompt = `You are an elite Career Intelligence AI. Analyze this student's academic profile and predict their top 4 advanced career paths that suit their skills.

STUDENT PROFILE:
Name: ${ctx.fullName}
College: ${ctx.college}
Degree: ${ctx.degree}
Department: ${ctx.department}
Year: ${ctx.year}
Expert Domain: ${ctx.expertDomain}
CGPA: ${ctx.cgpa}
Known Skills/Interests: ${ctx.skills.join(', ') || 'Not specified'}
Recommended Topics: ${ctx.suggestedCourses.join(', ') || 'Not yet analyzed'}
${ctx.aiAnalysisSummaries ? `Academic Analysis:\n${ctx.aiAnalysisSummaries}` : ''}

INSTRUCTIONS:
Generate exactly 4 highly specific, high-paying career role predictions relevant to the student's domain.
For each role, calculate a highly accurate and realistic match score (0-100).
Provide actionable, detailed roadmap steps tailored specifically to their exact skill gaps. Do NOT provide generic advice. Give specialized technologies, specific frameworks, and high-level concepts.

Return ONLY a valid JSON object in this exact structure:
{
  "currentSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "overallReadiness": 65,
  "roles": [
    {
      "role": "Senior Cloud Infrastructure Engineer",
      "matchScore": 78,
      "description": "Architecting robust cloud microservices and deployment pipelines.",
      "requiredSkills": ["Kubernetes", "AWS EKS", "Terraform", "Go"],
      "skillGaps": ["Terraform", "Go"],
      "roadmap": [
        "Phase 1: Learn Go concurrency concepts and syntax heavily",
        "Phase 2: Master Infrastructure as Code using Terraform provisioning",
        "Phase 3: Deploy resilient microservices on AWS EKS",
        "Phase 4: Design high-availability multi-region architectures"
      ],
      "avgSalary": "₹15-35 LPA",
      "difficulty": "Hard"
    }
  ]
}`;

    let aiData;

    try {
      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      aiData = JSON.parse(raw);
    } catch (aiError) {
      console.warn('⚠️ Groq AI error, using intelligent fallback:', aiError.message);
      // Smart fallback based on the user's actual domain
      aiData = generateFallbackPrediction(ctx);
    }

    // Persist to DB
    const careerProfile = await CareerProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        targetRoles: aiData.roles || [],
        currentSkills: aiData.currentSkills || [],
        expertDomain: ctx.expertDomain,
        overallReadiness: aiData.overallReadiness || 60,
        lastPredictedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: careerProfile });
  } catch (err) {
    console.error('Career Prediction Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Fallback prediction generator ───────────────────────────────────────────
const generateFallbackPrediction = (ctx) => {
  const domain = ctx.expertDomain.toLowerCase();

  // Domain-aware career paths
  const domainPaths = {
    'computer science': ['Software Development Engineer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer'],
    'data': ['Data Scientist', 'ML Engineer', 'Data Analyst', 'AI Research Engineer'],
    'ai': ['ML Engineer', 'AI Research Engineer', 'Data Scientist', 'NLP Engineer'],
    'web': ['Full Stack Developer', 'Frontend Engineer', 'Backend Engineer', 'UI/UX Developer'],
    'cyber': ['Cybersecurity Analyst', 'Ethical Hacker', 'Security Engineer', 'SOC Analyst'],
    'cloud': ['Cloud Architect', 'DevOps Engineer', 'Site Reliability Engineer', 'Solutions Architect'],
    'default': ['Software Development Engineer', 'Full Stack Developer', 'Data Analyst', 'Product Manager']
  };

  const matchKey = Object.keys(domainPaths).find(k => domain.includes(k)) || 'default';
  const roles = domainPaths[matchKey];

  const salaries = ['₹4-10 LPA', '₹6-15 LPA', '₹8-20 LPA', '₹10-25 LPA'];
  const difficulties = ['Easy', 'Medium', 'Medium', 'Hard'];

  return {
    currentSkills: ctx.skills.length > 0 ? ctx.skills.slice(0, 5) : ['Problem Solving', 'Communication', 'Programming Basics', 'Critical Thinking', 'Teamwork'],
    overallReadiness: ctx.cgpa !== 'N/A' ? Math.min(95, Math.round(parseFloat(ctx.cgpa) * 10 + 10)) : 60,
    roles: roles.map((role, i) => ({
      role,
      matchScore: Math.max(50, 85 - i * 8),
      description: `Build a career in ${role} leveraging your ${ctx.expertDomain} background.`,
      requiredSkills: ['DSA', 'System Design', 'Problem Solving', 'Communication', 'Domain Knowledge'],
      skillGaps: i < 2 ? ['System Design', 'Advanced DSA'] : ['Leadership', 'Domain Expertise'],
      roadmap: [
        `Month 1: Strengthen core ${ctx.expertDomain} fundamentals`,
        'Month 2: Build 2-3 portfolio projects',
        'Month 3: Practice coding interviews on LeetCode/HackerRank',
        'Month 4: Apply to internships and entry-level roles'
      ],
      avgSalary: salaries[i],
      difficulty: difficulties[i]
    }))
  };
};

// ─── GET /api/career/profile ──────────────────────────────────────────────────
export const getCareerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await CareerProfile.findOne({ userId });
    res.json({ success: true, data: profile || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/career/roadmap/:roleIndex ──────────────────────────────────────
export const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const idx = parseInt(req.params.roleIndex, 10);
    const profile = await CareerProfile.findOne({ userId });

    if (!profile) return res.status(404).json({ message: 'No career profile found. Run prediction first.' });
    if (isNaN(idx) || idx >= profile.targetRoles.length) {
      return res.status(404).json({ message: 'Role index out of range.' });
    }

    res.json({ success: true, data: profile.targetRoles[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
