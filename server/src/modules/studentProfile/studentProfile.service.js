// server/src/modules/studentProfile/studentProfile.service.js
import StudentProfile from "./studentProfile.model.js";

export const getProfileByUserId = async (userId) => {
  const profile = await StudentProfile.findOne({ userId });
  if (!profile) {
    throw { status: 404, message: "Student profile not found" };
  }
  return profile;
};

export const updateProfile = async (userId, updates) => {
  return await StudentProfile.findOneAndUpdate(
    { userId },
    updates,
    { new: true }
  );
};
