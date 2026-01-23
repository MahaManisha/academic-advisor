import { generateRecommendations } from "./recommendation.service.js";

export const generate = async (req, res, next) => {
  try {
    await generateRecommendations(req.user.id);
    res.json({ success: true, message: "Recommendations generated" });
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const data = await Recommendation.find({ userId: req.user.id });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
