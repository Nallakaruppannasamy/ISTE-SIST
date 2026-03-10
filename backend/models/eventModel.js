import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, 
    longDescription: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['upcoming', 'finished'], 
        default: 'upcoming' 
    },
    brochure: { type: String, required: true }, // Cloudinary URL
    registrationLink: { type: String }, // New Field
    createdAt: { type: Date, default: Date.now },
});

const eventModel = mongoose.models.event || mongoose.model("event", eventSchema);

export default eventModel;