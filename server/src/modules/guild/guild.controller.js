import Guild from "./guild.model.js";

export const getGuilds = async (req, res, next) => {
    try {
        const guilds = await Guild.find().populate("leader", "fullName").select("-members");
        res.json({ success: true, guilds });
    } catch (error) {
        next(error);
    }
};

export const createGuild = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const existing = await Guild.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: "Guild name already taken" });
        }

        const newGuild = new Guild({
            name,
            description,
            leader: req.user.id,
            members: [{ user: req.user.id, role: "leader" }],
        });

        await newGuild.save();
        res.status(201).json({ success: true, guild: newGuild });
    } catch (error) {
        next(error);
    }
};

export const getGuildDetails = async (req, res, next) => {
    try {
        const guild = await Guild.findById(req.params.id)
            .populate("leader", "fullName avatar")
            .populate("members.user", "fullName avatar course");
        if (!guild) return res.status(404).json({ success: false, message: "Guild not found" });

        res.json({ success: true, guild });
    } catch (error) {
        next(error);
    }
};

export const joinGuild = async (req, res, next) => {
    try {
        const guild = await Guild.findById(req.params.id);
        if (!guild) return res.status(404).json({ success: false, message: "Guild not found" });

        const isMember = guild.members.some((m) => m.user.toString() === req.user.id.toString());
        if (isMember) return res.status(400).json({ success: false, message: "Already a member" });

        guild.members.push({ user: req.user.id, role: "member" });
        await guild.save();

        res.json({ success: true, message: "Joined successfully", guild });
    } catch (error) {
        next(error);
    }
};

export const contributeMission = async (req, res, next) => {
    try {
        const { progress } = req.body; // Add progress
        const guild = await Guild.findById(req.params.id);
        if (!guild) return res.status(404).json({ success: false, message: "Guild not found" });

        // Validate user is member
        const isMember = guild.members.some((m) => m.user.toString() === req.user.id.toString());
        if (!isMember) return res.status(403).json({ success: false, message: "Not a member" });

        guild.weeklyMission.progress += Number(progress || 1);

        // Check if completed
        let leveledUp = false;
        let xpGranted = false;
        if (guild.weeklyMission.progress >= guild.weeklyMission.target) {
            guild.xp += guild.weeklyMission.rewardXP;
            // Basic leveling logic: every 1000 xp
            const predictedLevel = Math.floor(guild.xp / 1000) + 1;
            if (predictedLevel > guild.level) {
                guild.level = predictedLevel;
                leveledUp = true;
            }

            // Reset mission (in a real app you'd run a cron or randomized new mission)
            guild.weeklyMission.progress = 0;
            guild.weeklyMission.target = Math.floor(guild.weeklyMission.target * 1.5); // Increase difficulty
            guild.weeklyMission.rewardXP += 250;
            xpGranted = true;
        }

        await guild.save();
        res.json({ success: true, message: "Progress added!", guild, leveledUp, xpGranted });
    } catch (error) {
        next(error);
    }
};
