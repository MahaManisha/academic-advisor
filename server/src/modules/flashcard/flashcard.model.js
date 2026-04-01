import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
});

const FlashcardSetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            default: "Generated Study Set"
        },
        summary: {
            type: String, // High-level key points summary
            default: ""
        },
        cards: [FlashcardSchema]
    },
    { timestamps: true }
);

export default mongoose.model("FlashcardSet", FlashcardSetSchema);
