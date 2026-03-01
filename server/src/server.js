// server/src/server.js
import "./config/env.js"; // Must be first to load .env before other imports

import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug Logging
// Env loading moved to config/env.js


import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import setupSockets from "./socket/index.js";
import { initDeadlineCron } from "./cron/deadlineReminder.js";

const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Make io accessible across app via req.app.get('io')
app.set('io', io);

// Setup socket events
setupSockets(io);

// Initialize Cron Jobs
initDeadlineCron(io);

// Start server
server.listen(PORT, () => {

});
