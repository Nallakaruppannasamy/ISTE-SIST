import express from 'express';
import { 
    adminLogin, 
    dashboardData, 
    addTeamMember, 
    listTeamMembers, 
    removeMember, 
    addEvent,
    updateEvent,
    listEvents,
    removeEvent,
    addGalleryImages,
    getGalleryData,
    deleteGalleryImage,
    addFeedback,
    listFeedback,
    removeFeedback,
    toggleFeedbackStatus
} from '../controllers/adminController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get('/dashboard', authAdmin, dashboardData);

// Event Management Routes
adminRouter.post('/add-event', authAdmin, upload.single('brochure'), addEvent);
adminRouter.post('/update-event', authAdmin, upload.single('brochure'), updateEvent);
adminRouter.get('/list-events', listEvents);
adminRouter.post('/remove-event', authAdmin, removeEvent);

// Team Management Routes
adminRouter.post('/add-team', authAdmin, upload.single('image'), addTeamMember);
adminRouter.get('/list-team', listTeamMembers); // REMOVED authAdmin so frontend can see team
adminRouter.post('/remove-team', authAdmin, removeMember);

// Gallery Routes (Multiple image upload support)
adminRouter.post('/add-gallery', authAdmin, upload.array('images', 20), addGalleryImages);
adminRouter.get('/list-gallery', getGalleryData);
adminRouter.post('/remove-gallery-img', authAdmin, deleteGalleryImage);

// Feedback Routes
adminRouter.post('/add-feedback', addFeedback); // Public
adminRouter.get('/list-feedback', authAdmin, listFeedback); // Admin Only
adminRouter.post('/remove-feedback', authAdmin, removeFeedback); // Admin Only
adminRouter.post('/toggle-feedback', authAdmin, toggleFeedbackStatus);

export default adminRouter;