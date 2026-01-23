import { handleChat } from "./chat.service.js";

export const chat = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    const result = await handleChat(req.user.id, question);

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};
