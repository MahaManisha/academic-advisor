import { updateProgress } from "./gamification.service.js";
import Gamification from "./gamification.model.js";

export const reward = async (req, res, next) => {
  try {
    const { action } = req.body;
    const data = await updateProgress(req.user.id, action);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const data = await Gamification.findOne({
      userId: req.user.id
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
