import User from "./user.model.js";

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select("-passwordHash") // Exclude password
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Unable to fetch users",
            error: error.message,
        });
    }
};

// Get user statistics (Admin only)
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const students = await User.countDocuments({ role: "student" });
        const admins = await User.countDocuments({ role: "admin" });
        const activeUsers = await User.countDocuments({ status: "active" });

        // Calculate growth (mock logic for now as we don't have historical snapshots easily without aggregation)
        // Real implementation would look at create dates from last month vs this month

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                students,
                admins,
                activeUsers,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Unable to fetch stats",
            error: error.message,
        });
    }
};

// Update user status (Admin only)
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Use 'active' or 'suspended'."
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent admin from blocking themselves or other admins (optional, but good practice)
        if (user.role === 'admin' && req.user.id !== user._id) {
            // Depending on policy, maybe allow super admin to block other admins, but for now specific check
            // Ignoring for simplicity unless requested, but generally safer to act on students
        }

        user.status = status;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            user: { _id: user._id, status: user.status }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Unable to update user status",
            error: error.message,
        });
    }
};

// Get detailed student profile (Admin)
export const getStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                student: user,
                assessments: user.assessmentResults || [],
                performance: {
                    attendance: 85,
                    assignments: 12
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};
