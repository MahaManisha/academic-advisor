// server/src/modules/studentProfile/studentProfile.controller.js
import {
  getProfileByUserId,
  updateProfile
} from "./studentProfile.service.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getProfileByUserId(req.user.id);
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await updateProfile(req.user.id, req.body);
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};
