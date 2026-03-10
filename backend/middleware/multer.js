import multer from 'multer';

// Configure storage settings
const storage = multer.diskStorage({
    // The filename function defines how the file should be named on the server
    filename: function (req, file, callback) {
        // We use the original name, but you can also add a timestamp to prevent overwriting
        callback(null, file.originalname);
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

export default upload;