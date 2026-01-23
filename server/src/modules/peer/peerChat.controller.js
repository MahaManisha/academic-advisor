import PeerChat from "./peerChat.model.js";
import { suggestPeers } from "./peerMatch.service.js";

export const getPeerSuggestions = async (req, res, next) => {
  try {
    const { skill } = req.query;

    const peers = await suggestPeers(req.user.id, skill);

    res.json({
      success: true,
      peers
    });
  } catch (err) {
    next(err);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const chat = await PeerChat.findOne({ roomId });

    res.json({
      success: true,
      chat
    });
  } catch (err) {
    next(err);
  }
};
