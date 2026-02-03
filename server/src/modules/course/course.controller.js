import Course from "./course.model.js";

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
