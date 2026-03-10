import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoutes.js';


//App Configuration
const app = express();

//Connect to MongoDB
connectDB();

// Connect to Cloudinary
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json()); 

// API Endpoints
app.use('/api/admin', adminRouter); 

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('ISTE SIST API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));