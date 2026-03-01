import Course from "./course.model.js";
import StudentProfile from "../studentProfile/studentProfile.model.js";
import Groq from "groq-sdk";

// Create a new course
export const createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all courses (with standardized pagination/filtering if needed later)
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get single course
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update course
export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete course (Soft delete preferably, or hard delete)
export const deleteCourse = async (req, res) => {
    try {
        // We'll do a hard delete for now to keep it simple as per instructions "delete courses"
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });
        res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Generate personalized quests/missions for a user using AI
export const generateAIMissions = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const profile = await StudentProfile.findOne({ userId });

        // Let's create an AI client
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        let focusStr = "General Computer Science and Soft Skills";
        let skillStr = "basic analytical skills";

        if (profile) {
            focusStr = profile.focusArea || profile.interests?.join(", ") || focusStr;
            skillStr = profile.skills?.map(s => `${s.domain} (${s.level})`).join(", ") || skillStr;
        }

        const prompt = `
        You are an advanced Gamified Academic Assessment AI. 
        The student focuses on: ${focusStr}.
        Their current known skills are: ${skillStr}.
        
        Generate exactly 3 "Missions" (courses) to help them level up their skills.
        Return ONLY valid JSON in this exact structure:
        [
          {
            "name": "Mission Title",
            "code": "SHORT-CODE",
            "description": "Engaging mission briefing...",
            "credits": 3,
            "difficulty": "Intermediate",
            "category": "Department Name"
          }
        ]
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1000,
        });

        const rawJsonText = completion.choices[0].message.content.trim();
        const jsonMatch = rawJsonText.match(/\[[\s\S]*\]/);

        if (!jsonMatch) {
            throw new Error("Failed to parse AI response into JSON array.");
        }

        const newCourses = JSON.parse(jsonMatch[0]);

        const savedCourses = [];
        for (const c of newCourses) {
            const existing = await Course.findOne({ name: c.name });
            if (!existing) {
                const created = await Course.create({
                    name: c.name,
                    code: c.code || "AI101",
                    description: c.description || "Generated academic mission",
                    credits: c.credits || 3,
                    difficulty: c.difficulty || "Intermediate",
                    category: c.category || "AI Generation",
                    status: 'active'
                });
                savedCourses.push(created);
            } else {
                savedCourses.push(existing);
            }
        }

        res.json({ success: true, data: savedCourses, message: "Custom AI Missions Deployed!" });

    } catch (error) {
        console.error("AI Mission Generation Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
