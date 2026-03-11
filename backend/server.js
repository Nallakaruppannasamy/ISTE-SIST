import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoutes.js';

// App Configuration
const app = express();

// Connect to MongoDB
connectDB();

// Connect to Cloudinary
connectCloudinary();

// Middleware
const allowedOrigins = [
    'https://iste-sist-admin.vercel.app',
    'https://iste-sist.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'], // 'token' is required for your authAdmin middleware
    credentials: true
}));

app.use(express.json()); 

// API Endpoints
app.use('/api/admin', adminRouter); 

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('ISTE SIST API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));