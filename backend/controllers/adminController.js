import jwt from "jsonwebtoken";
import eventModel from "../models/eventModel.js";
import teamModel from "../models/teamModel.js";
import galleryModel from "../models/galleryModel.js";
import feedbackModel from "../models/feedbackModel.js";
import { v2 as cloudinary } from 'cloudinary';

// Admin Login Logic
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get Dashboard Data (Dynamic)
// Dynamic Dashboard Data including Teams
const dashboardData = async (req, res) => {
    try {
        const events = await eventModel.find({});
        const teams = await teamModel.find({});
        const feedbacks = await feedbackModel.find({});

        // Calculate Category Split (Feature 11)
        const upcomingEvents = events.filter(e => e.category === 'upcoming').length;
        const finishedEvents = events.filter(e => e.category === 'finished').length;

        // Feedback Stats (Feature 7, 8, 9)
        const totalFeedback = feedbacks.length;
        const unreadFeedback = feedbacks.filter(f => !f.processed).length;
        const avgRating = feedbacks.length > 0 
            ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) 
            : 0;

        // Team Role Distribution (Feature 12)
        const roleDistribution = teams.reduce((acc, member) => {
            acc[member.position] = (acc[member.position] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            dashData: {
                totalEvents: events.length,
                upcomingEvents,
                finishedEvents,
                totalTeams: teams.length,
                totalFeedback,
                unreadFeedback,
                avgRating,
                roleDistribution, // Sent as an object for the table
                latestEvents: events.reverse(), // Full list for pagination
                latestMembers: teams.reverse().slice(0, 5) // Recent team additions
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add Event with Cloudinary Upload
const addEvent = async (req, res) => {
    try {
        const { title, description, longDescription, date, time, venue, category, registrationLink } = req.body;
        const brochureFile = req.file;

        if (!brochureFile) {
            return res.json({ success: false, message: "Event brochure is required" });
        }

        const brochureUpload = await cloudinary.uploader.upload(brochureFile.path, { 
            resource_type: "auto" 
        });
        
        const newEvent = new eventModel({
            title, description, longDescription, date, time, venue, category, registrationLink,
            brochure: brochureUpload.secure_url
        });

        await newEvent.save();
        res.json({ success: true, message: "Event Added Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id, title, description, longDescription, date, time, venue, category, registrationLink } = req.body;
        const brochureFile = req.file;

        const existingEvent = await eventModel.findById(id);
        if (!existingEvent) return res.json({ success: false, message: "Event not found" });

        if (existingEvent.category === 'finished' && category === 'upcoming') {
            return res.json({ success: false, message: "Cannot change finished events back to upcoming" });
        }

        const updateData = { title, description, longDescription, date, time, venue, category, registrationLink };

        if (brochureFile) {
            const upload = await cloudinary.uploader.upload(brochureFile.path, { resource_type: "auto" });
            updateData.brochure = upload.secure_url;
        }

        await eventModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Event Updated Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// List all events
const listEvents = async (req, res) => {
    try {
        const events = await eventModel.find({});
        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Remove event
const removeEvent = async (req, res) => {
    try {
        const { id } = req.body;
        await eventModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Event Removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add Team Member with Cloudinary Upload
const addTeamMember = async (req, res) => {
    try {
        const { name, position, linkedin } = req.body;
        const imageFile = req.file; // Get file from multer

        if (!imageFile) {
            return res.json({ success: false, message: "Image is required" });
        }

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { 
            resource_type: "image" 
        });
        const imageUrl = imageUpload.secure_url;

        const newMember = new teamModel({
            name,
            position,
            linkedin,
            image: imageUrl // Save the Cloudinary URL
        });

        await newMember.save();
        res.json({ success: true, message: "Team Member Added Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get All Team Members
const listTeamMembers = async (req, res) => {
    try {
        const members = await teamModel.find({});
        res.json({ success: true, members });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Remove Team Member
const removeMember = async (req, res) => {
    try {
        const { id } = req.body;
        await teamModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Member Removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add images to a specific event gallery
const addGalleryImages = async (req, res) => {
    try {
        const { eventId } = req.body;
        const files = req.files; // Array of files from multer

        if (!files || files.length === 0) {
            return res.json({ success: false, message: "No images selected" });
        }

        const uploadPromises = files.map(file => 
            cloudinary.uploader.upload(file.path, { resource_type: "image" })
        );
        
        const results = await Promise.all(uploadPromises);
        const imageUrls = results.map(result => result.secure_url);

        let gallery = await galleryModel.findOne({ eventId });

        if (gallery) {
            gallery.images.push(...imageUrls);
            await gallery.save();
        } else {
            gallery = new galleryModel({ eventId, images: imageUrls });
            await gallery.save();
        }

        res.json({ success: true, message: "Photos added to gallery successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all gallery items grouped by event
const getGalleryData = async (req, res) => {
    try {
        const gallery = await galleryModel.find({}).populate('eventId', 'title date venue');
        res.json({ success: true, gallery });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a specific image from gallery
const deleteGalleryImage = async (req, res) => {
    try {
        const { galleryId, imageUrl } = req.body;
        await galleryModel.findByIdAndUpdate(galleryId, {
            $pull: { images: imageUrl }
        });
        res.json({ success: true, message: "Image removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Save new feedback (Public)
const addFeedback = async (req, res) => {
    try {
        const { name, email, rollNumber, eventName, rating, message } = req.body;
        
        const newFeedback = new feedbackModel({
            name, email, rollNumber, eventName, rating, message
        });

        await newFeedback.save();
        res.json({ success: true, message: "Feedback submitted! Thank you." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Ensure listFeedback and removeFeedback are also updated with processed field support
const listFeedback = async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find({}).sort({ date: -1 });
        res.json({ success: true, feedbacks });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete feedback (Admin)
const removeFeedback = async (req, res) => {
    try {
        const { id } = req.body;
        await feedbackModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Feedback Deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Toggle Processed Status (Feature 7)
const toggleFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.body;
        const feedback = await feedbackModel.findById(id);
        if (!feedback) {
            return res.json({ success: false, message: "Feedback not found" });
        }
        feedback.processed = !feedback.processed;
        await feedback.save();
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { 
    adminLogin, 
    dashboardData, 
    addEvent, 
    updateEvent, 
    listEvents, 
    removeEvent, 
    addTeamMember, 
    listTeamMembers, 
    removeMember, 
    addGalleryImages, 
    getGalleryData, 
    deleteGalleryImage, 
    addFeedback, 
    listFeedback, 
    removeFeedback,
    toggleFeedbackStatus
};