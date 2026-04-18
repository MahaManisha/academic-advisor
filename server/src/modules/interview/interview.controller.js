import { generateInterviewQuestions } from "./interview.service.js";

export const getQuestions = async (req, res) => {
    try {
        const { company = "General", role = "Software Engineer", difficulty = "medium" } = req.body;

        if (!role) {
            return res.status(400).json({ error: "Role is required" });
        }

        const data = await generateInterviewQuestions(company, role, difficulty);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error("Error in getQuestions controller:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch interview questions"
        });
    }
};
