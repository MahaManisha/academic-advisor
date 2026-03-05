import Course from "./course.model.js";
import StudentProfile from "../studentProfile/studentProfile.model.js";
import Groq from "groq-sdk";

// Create a new course
export const createCourse = async (req, res) => {
    try {
        if (req.user && req.user.id && !req.body.userId) {
            req.body.userId = req.user.id;
        }
        const course = new Course(req.body);
        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all courses (scoped to user)
export const getAllCourses = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const query = { status: 'active' };
        if (userId) {
            // Only fetch courses for THIS specific user, or global ones (if needed)
            // For now, let's just show courses that are explicitly theirs.
            query.$or = [{ userId: userId }, { userId: { $exists: false } }];
        }
        const courses = await Course.find(query).sort({ createdAt: -1 });
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
        IMPORTANT: For 'videoUrl' and 'thumbnail', you MUST provide a REAL, existing YouTube link to a relevant free educational video for each specific topic (e.g., from FreeCodeCamp, CrashCourse, Programming with Mosh, etc). Do NOT just copy the example placeholder URLs.
        Estimate a realistic 'duration' for each video.
        
        Return ONLY valid JSON in this exact structure:
        [
          {
            "title": "Mission Title",
            "name": "Mission Title",
            "code": "SHORT-CODE",
            "description": "Engaging mission briefing...",
            "credits": 3,
            "difficulty": "Intermediate",
            "category": "Department Name",
            "instructor": "Real YouTube Channel Name",
            "duration": "e.g., 2h 30m",
            "videoUrl": "REAL_YOUTUBE_URL_HERE",
            "thumbnail": "REAL_YOUTUBE_THUMBNAIL_URL_HERE",
            "recommendationReason": "Because you want to learn X, this helps you achieve Y."
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

        const suggestedCourses = newCourses.map(c => ({
            title: c.title || c.name,
            name: c.title || c.name,
            code: c.code || "AI101",
            description: c.description || "Generated academic mission",
            credits: c.credits || 3,
            difficulty: c.difficulty || "Intermediate",
            category: c.category || "AI Generation",
            instructor: c.instructor,
            duration: c.duration,
            videoUrl: c.videoUrl,
            thumbnail: c.thumbnail,
            recommendationReason: c.recommendationReason,
            status: 'suggested'
        }));

        res.json({ success: true, data: suggestedCourses, message: "Custom AI Missions Suggested!" });

    } catch (error) {
        console.error("AI Mission Generation Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Generate an assessment based on completed course/video
export const generateVideoAssessment = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const prompt = `
        You are an educational AI assessing a student who just watched a video tutorial.
        Course Title: ${course.title}
        Description: ${course.description}
        Instructor: ${course.instructor || 'Unknown'}
        
        Generate exactly 3 Multiple Choice Questions (MCQs) to test their basic understanding of this topic.
        Return ONLY valid JSON in this exact structure:
        {
          "sections": [
            {
              "section_name": "${course.title || 'Course'} Assessment",
              "questions": [
                {
                  "question": "Question text here?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correct_answer": "Option B",
                  "question_type": "MCQ"
                }
              ]
            }
          ]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 1500,
        });

        const rawJsonText = completion.choices[0].message.content.trim();
        const jsonMatch = rawJsonText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("Failed to parse AI assessment response.");
        }

        const assessmentData = JSON.parse(jsonMatch[0]);

        res.json({ success: true, assessment: assessmentData });

    } catch (error) {
        console.error("Video Assessment Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
