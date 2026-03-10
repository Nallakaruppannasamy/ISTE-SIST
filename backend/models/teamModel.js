import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    linkedin: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary URL
    createdAt: { type: Date, default: Date.now },
});

const teamModel = mongoose.models.team || mongoose.model("team", teamSchema);

export default teamModel;