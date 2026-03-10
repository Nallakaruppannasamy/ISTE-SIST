import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    rollNumber: { type: String, required: true },
    eventName: { type: String, default: "General Feedback" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, maxlength: 1500 },
    consent: { type: Boolean, default: false },
    processed: { type: Boolean, default: false }, // Feature 7: Status tracking
    date: { type: Date, default: Date.now },
});

const feedbackModel = mongoose.models.feedback || mongoose.model("feedback", feedbackSchema);
export default feedbackModel;