import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "./src/modules/assessment/question.model.js";

dotenv.config();

const questions = [
    // COMPUTER SCIENCE
    {
        domain: "Computer Science",
        topic: "Programming",
        difficulty: 1,
        questionText: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tool Multi Language", "None of above"],
        correctAnswer: "0", // Index 0
        explanation: "HTML is the standard markup language for documents designed to be displayed in a web browser.",
        tags: ["web", "basics"]
    },
    {
        domain: "Computer Science",
        topic: "Data Structures",
        difficulty: 2,
        questionText: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Tree"],
        correctAnswer: "1",
        explanation: "Stack follows Last In First Out (LIFO).",
        tags: ["dsa"]
    },
    {
        domain: "Computer Science",
        topic: "Algorithms",
        difficulty: 3,
        questionText: "What is the time complexity of Binary Search?",
        options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        correctAnswer: "1",
        explanation: "Binary search divides the search interval in half essentially.",
        tags: ["algorithms"]
    },

    // MECHANICAL ENGINEERING
    {
        domain: "Mechanical Engineering",
        topic: "Thermodynamics",
        difficulty: 1,
        questionText: "The First Law of Thermodynamics deals with?",
        options: ["Conservation of Mass", "Conservation of Energy", "Conservation of Momentum", "Conservation of Heat"],
        correctAnswer: "1",
        explanation: "The first law is an application of the conservation of energy principle to heat and thermodynamic processes.",
        tags: ["physics"]
    },
    {
        domain: "Mechanical Engineering",
        topic: "Mechanics",
        difficulty: 2,
        questionText: "What is the unit of Force?",
        options: ["Joule", "Pascal", "Newton", "Watt"],
        correctAnswer: "2",
        explanation: "The SI unit of force is the Newton.",
        tags: ["basics"]
    },

    // CIVIL ENGINEERING
    {
        domain: "Civil Engineering",
        topic: "Materials",
        difficulty: 1,
        questionText: "What represents the ratio of stress to strain?",
        options: ["Poisson Ratio", "Young's Modulus", "Bulk Modulus", "Rigidity Modulus"],
        correctAnswer: "1",
        explanation: "Young's modulus is a measure of the stiffness of a solid material.",
        tags: ["materials"]
    },

    // ELECTRONICS
    {
        domain: "Electronics Engineering",
        topic: "Circuits",
        difficulty: 1,
        questionText: "V = IR is known as?",
        options: ["Newton's Law", "Ohm's Law", "Faraday's Law", "Kirchhoff's Law"],
        correctAnswer: "1",
        explanation: "Ohm's law states that the current through a conductor between two points is directly proportional to the voltage across the two points.",
        tags: ["circuits"]
    }
];

const seedQuestions = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI missing");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        await Question.deleteMany({});
        console.log("🗑️ Cleared existing questions");

        await Question.insertMany(questions);
        console.log(`✅ Seeded ${questions.length} questions`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedQuestions();
