// server/src/modules/analytics/analytics.controller.js
import { generateAnalytics } from "./analytics.service.js";
import Analytics from "./analytics.model.js";

export const generate = async (req, res, next) => {
  try {
    const data = await generateAnalytics(
      req.user.id,
      req.params.domain
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await Analytics.find({
      userId: req.user.id
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
