import { generateInterviewQuestions, generateInterviewRounds } from "./interview.service.js";

export const getRounds = async (req, res) => {
    try {
        const { company = "General", role = "Software Engineer" } = req.body;

        if (!role) {
            return res.status(400).json({ error: "Role is required" });
        }

        const data = await generateInterviewRounds(company, role);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error("Error in getRounds controller:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch interview rounds"
        });
    }
};

export const getQuestions = async (req, res) => {
    try {
        const { company = "General", role = "Software Engineer", difficulty = "medium", round = "General" } = req.body;

        if (!role) {
            return res.status(400).json({ error: "Role is required" });
        }

        const data = await generateInterviewQuestions(company, role, difficulty, round);

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
