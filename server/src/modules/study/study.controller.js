import StudySession from "./study.model.js";

// POST /api/study/start
export const startStudySession = async (req, res) => {
    try {
        const { courseId } = req.body;
        const newSession = await StudySession.create({
            userId: req.user.id || req.user.userId,
            courseId: courseId || null,
        });

        res.status(201).json({ success: true, session: newSession });
    } catch (error) {
        console.error("Start Study Session Error:", error);
        res.status(500).json({ success: false, error: "Failed to start study session." });
    }
};

// POST /api/study/end
// Updates an existing session with final time metrics and XP earned
export const endStudySession = async (req, res) => {
    try {
        const { sessionId, totalStudyTime, focusedTime, distractions, xpEarned } = req.body;

        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Session ID required" });
        }

        const session = await StudySession.findByIdAndUpdate(
            sessionId,
            {
                totalStudyTime,
                focusedTime,
                distractions,
                xpEarned
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ success: false, message: "Study session not found." });
        }

        res.json({ success: true, session });
    } catch (error) {
        console.error("End Study Session Error:", error);
        res.status(500).json({ success: false, error: "Failed to end study session." });
    }
};

// GET /api/study/history
export const getStudyHistory = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const history = await StudySession.find({ userId }).sort({ date: -1 });
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch study history." });
    }
};
