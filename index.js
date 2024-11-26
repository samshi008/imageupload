const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware for CORS

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Validate file type
const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return allowedTypes.includes(file.mimetype);
};

// Cloudinary upload function
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// API route for image upload
app.post('/api/upload-image', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  if (!validateFileType(file)) {
    return res.status(400).json({ message: 'Unsupported file type.' });
  }

  try {
    const result = await uploadToCloudinary(file.buffer, 'FoodDeliveryApp');
    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(400).json({ message: 'Cloudinary upload error', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
