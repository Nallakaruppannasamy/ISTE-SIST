import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'event', required: true },
    images: [{ type: String, required: true }], // Array of Cloudinary URLs
    createdAt: { type: Date, default: Date.now },
});

const galleryModel = mongoose.models.gallery || mongoose.model("gallery", gallerySchema);
export default galleryModel;