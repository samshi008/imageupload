const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage ,
  limits: { fileSize: 10 * 1024 * 1024 },
});
const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return allowedTypes.includes(file.mimetype);
};

// API route for image upload
app.post('/api/upload-image', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!validateFileType(file)) {
    return res.status(400).json({ message: 'Unsupported file type.' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'FoodDeliveryApp' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Error:', error);
        return res.status(500).json({ message: 'Cloudinary upload error', error });
      }

      res.status(200).json({ imageUrl: result.secure_url });
    }
  );

  uploadStream.end(file.buffer);
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
