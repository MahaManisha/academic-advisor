import Session from "./session.model.js";

export const createSession = async (req, res, next) => {
  try {
    const { studentId, title, description, date, startTime, endTime, meetingLink } = req.body;
    const mentorId = req.user.id;

    const session = await Session.create({
      mentorId,
      studentId,
      title,
      description,
      date,
      startTime,
      endTime,
      meetingLink
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

export const getMySessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = {};
    if (role === 'mentor') {
      query = { mentorId: userId };
    } else {
      query = { studentId: userId };
    }

    const sessions = await Session.find(query)
      .populate("mentorId", "fullName email avatar")
      .populate("studentId", "fullName email avatar")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

export const updateSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const session = await Session.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Session.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    next(error);
  }
};
