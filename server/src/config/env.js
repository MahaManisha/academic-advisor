// server/src/config/env.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (server/src/config/../../../.env)
// Current dir is server/src/config
const envPath = path.resolve(__dirname, "../../../.env");

dotenv.config({ path: envPath });





export default process.env;
