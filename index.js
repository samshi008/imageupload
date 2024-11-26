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

const storage = multer.memoryStorage(); 
const upload = multer({ storage });


app.post('/api/upload-image', upload.single(), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {

    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: 'FoodDeliveryApp' }, 
      (error, result) => {
        if (error) {
          console.error('Cloudinary Error:', error);
          return res.status(500).json({ message: 'Cloudinary upload error', error });
        }

        return res.status(200).json({ imageUrl: result.secure_url });
      }
    ).end(file.buffer); 
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
