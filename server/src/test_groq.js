import mongoose from 'mongoose';
import "./config/env.js";
import { generateAdaptiveQuestion } from './modules/onboarding/onboarding.rag.service.js';

async function testGroq() {
    try {
        console.log("Testing Groq Adaptive Question...");
        const result = await generateAdaptiveQuestion("Computer Science", 3, null);
        console.log("Success:", result);
    } catch (e) {
        console.error("Error occurred:", e);
    }
    process.exit(0);
}

testGroq();
