import { generateArenaQuiz } from "./arena.service.js";

// In-memory state for Arena Matchmaking and Active Games
let activeChallenges = []; // [{ challengeId, socketId, userId, name, topic }]
let activeMatches = {}; // roomId -> { players: [{socketId, userId, name, score, answersGiven}], quiz: [], currentQuestion: 0, interval: null }

export default function setupArenaSocket(io, socket) {
    // Send current challenges when joining lobby
    socket.on("arena_enter_lobby", () => {
        socket.emit("arena_challenges_update", activeChallenges);
    });

    // Create a new PvP challenge
    socket.on("arena_create_challenge", (data) => {
        const { userId, name, topic } = data;
        const challengeId = `chall_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Remove existing challenges by this socket (prevent spam)
        activeChallenges = activeChallenges.filter(c => c.socketId !== socket.id);

        activeChallenges.push({ challengeId, socketId: socket.id, userId, name, topic });
        io.emit("arena_challenges_update", activeChallenges);
        console.log(`[Arena] ${name} created challenge for ${topic}`);
    });

    // Accept an existing challenge
    socket.on("arena_accept_challenge", async (data) => {
        const { challengeId, userId, name } = data;
        const challengeIndex = activeChallenges.findIndex(c => c.challengeId === challengeId);

        if (challengeIndex !== -1) {
            const challenge = activeChallenges.splice(challengeIndex, 1)[0];
            io.emit("arena_challenges_update", activeChallenges);

            const roomId = `arena_${Date.now()}_pvp`;
            socket.join(roomId);

            const hostSocket = io.sockets.sockets.get(challenge.socketId);
            if (hostSocket) hostSocket.join(roomId);

            // Notify Host
            if (hostSocket) {
                io.to(challenge.socketId).emit("arena_match_found", {
                    roomId: roomId,
                    opponent: name,
                    topic: challenge.topic,
                    message: "Generating Battle Matrix..."
                });
            }

            // Notify Challenger
            io.to(socket.id).emit("arena_match_found", {
                roomId: roomId,
                opponent: challenge.name,
                topic: challenge.topic,
                message: "Generating Battle Matrix..."
            });

            const quizData = await generateArenaQuiz(challenge.topic);

            activeMatches[roomId] = {
                players: [
                    { socketId: challenge.socketId, userId: challenge.userId, name: challenge.name, score: 0, answersGiven: 0 },
                    { socketId: socket.id, userId, name, score: 0, answersGiven: 0 }
                ],
                quiz: quizData,
                roomId
            };

            setTimeout(() => {
                io.to(roomId).emit("arena_game_start", {
                    quiz: quizData,
                    players: [
                        { id: challenge.socketId, name: challenge.name },
                        { id: socket.id, name }
                    ]
                });
            }, 3000);
        }
    });

    // Cancel queued challenge
    socket.on("arena_cancel_challenge", () => {
        activeChallenges = activeChallenges.filter(c => c.socketId !== socket.id);
        io.emit("arena_challenges_update", activeChallenges);
    });
    socket.on("arena_join_queue", async (data) => {
        const { userId, name, topic, mode } = data;
        console.log(`[Arena] Player ${name} joined queue for ${topic} [Mode: ${mode || 'pvp'}]`);

        if (mode === 'ai') {
            const roomId = `arena_${Date.now()}_ai`;
            socket.join(roomId);

            const gameTopic = topic || "General Knowledge";

            io.to(socket.id).emit("arena_match_found", {
                roomId: roomId,
                opponent: "AI Challenger (Bot)",
                topic: gameTopic,
                message: "Generating Battle Matrix..."
            });

            const quizData = await generateArenaQuiz(gameTopic);

            activeMatches[roomId] = {
                isVsBot: true,
                players: [
                    { socketId: socket.id, userId, name, score: 0, answersGiven: 0 },
                    { socketId: "bot123", userId: "bot123", name: "AI Challenger", score: 0, answersGiven: 0 }
                ],
                quiz: quizData,
                roomId
            };

            setTimeout(() => {
                io.to(roomId).emit("arena_game_start", {
                    quiz: quizData,
                    players: [
                        { id: socket.id, name },
                        { id: "bot123", name: "AI Challenger" }
                    ]
                });

                // AI Bot automated answering interval
                const botInterval = setInterval(() => {
                    const match = activeMatches[roomId];
                    if (!match || !match.isVsBot) {
                        clearInterval(botInterval);
                        return;
                    }

                    const bot = match.players[1];
                    if (bot.answersGiven < match.quiz.length) {
                        bot.answersGiven += 1;
                        const isCorrect = Math.random() > 0.3; // 70% accuracy
                        if (isCorrect) bot.score += 70 + Math.floor(Math.random() * 30);

                        io.to(roomId).emit("arena_score_update", {
                            players: match.players.map(p => ({
                                id: p.socketId,
                                name: p.name,
                                score: p.score
                            }))
                        });

                        const isGameOver = match.players.every(p => p.answersGiven >= match.quiz.length);
                        if (isGameOver) {
                            const winner = match.players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                            const isDraw = match.players.every(p => p.score === winner.score);
                            io.to(roomId).emit("arena_game_over", {
                                winnerId: isDraw ? null : winner.socketId,
                                winnerName: isDraw ? 'Draw' : winner.name,
                                players: match.players
                            });
                            delete activeMatches[roomId];
                            clearInterval(botInterval);
                        }
                    } else {
                        clearInterval(botInterval);
                    }
                }, 5000); // answers every 5 seconds
            }, 3000);
            return;
        }

        // Fallback or ignore for anything that isn't 'ai'
    });

    socket.on("arena_submit_answer", (data) => {
        const { roomId, questionIndex, isCorrect, timeRemaining } = data;
        const match = activeMatches[roomId];
        if (!match) return;

        const player = match.players.find(p => p.socketId === socket.id);
        if (player) {
            player.answersGiven += 1;
            if (isCorrect) {
                // Score based on speed (up to 100 points per question)
                const points = 50 + Math.floor((timeRemaining / 15) * 50);
                player.score += points;
            }

            // Broadcast score update
            io.to(roomId).emit("arena_score_update", {
                players: match.players.map(p => ({
                    id: p.socketId,
                    name: p.name,
                    score: p.score
                }))
            });

            // Check if game over (both answered all)
            const isGameOver = match.players.every(p => p.answersGiven >= match.quiz.length);
            if (isGameOver) {
                // determine winner
                const winner = match.players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                const isDraw = match.players.every(p => p.score === winner.score);

                io.to(roomId).emit("arena_game_over", {
                    winnerId: isDraw ? null : winner.socketId,
                    winnerName: isDraw ? 'Draw' : winner.name,
                    players: match.players
                });

                delete activeMatches[roomId];
            }
        }
    });

    socket.on("arena_leave_queue", () => {
        activeChallenges = activeChallenges.filter(c => c.socketId !== socket.id);
        io.emit("arena_challenges_update", activeChallenges);
    });

    socket.on("disconnect", () => {
        activeChallenges = activeChallenges.filter(c => c.socketId !== socket.id);
        io.emit("arena_challenges_update", activeChallenges);

        // Find if they were in an active match and end it
        for (const roomId in activeMatches) {
            const match = activeMatches[roomId];
            if (match.players.some(p => p.socketId === socket.id)) {
                // The other player automatically wins if someone disconnects
                const opponent = match.players.find(p => p.socketId !== socket.id);
                io.to(roomId).emit("arena_game_over", {
                    winnerId: opponent.socketId,
                    winnerName: opponent.name,
                    reason: "Opponent Disconnected",
                    players: match.players
                });
                delete activeMatches[roomId];
            }
        }
    });
}
