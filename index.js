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
const upload = multer({ storage ,
  limits: { fileSize: 10 * 1024 * 1024 },
});
const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  return allowedTypes.includes(file.mimetype);
};

app.get('/', (req, res) => {
  res.send(`<h1>Image Upload Service</h1>
  <p>Server is up and running.</p>
  <p>Use the following endpoint to upload images:</p>
  <ul>
    <li><strong>Endpoint:</strong> <code>/api/upload-image</code></li>
    <li><strong>Methods Supported:</strong> POST</li>
    <li><strong>File Limit:</strong> 10 MB</li>
    <li><strong>Accepted Formats:</strong> JPEG, PNG, JPG</li>
  </ul>
`)
});
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

      res.status(200).json({ ImageUrl: result.secure_url });
    }
  );
  uploadStream.end(file.buffer);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


//#region 
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Configure storage for uploaded files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Define the folder where images will be saved
//     const uploadPath = path.join(__dirname, 'uploads');
    
//     // Ensure the folder exists
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true }); // Create folder if it doesn't exist
//     }

//     // Set destination folder for uploaded images
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     // Create a unique filename using timestamp and original file name
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     const fileExtension = path.extname(file.originalname); // Get file extension
//     const filename = `${uniqueSuffix}${fileExtension}`;
//     cb(null, filename);
//   }
// });

// // Initialize multer with storage configuration and file size limit
// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
//   fileFilter: (req, file, cb) => {
//     // Only accept image files (you can add more file types here)
//     const fileTypes = /jpeg|jpg|png|gif/;
//     const mimeType = fileTypes.test(file.mimetype);
//     const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    
//     if (mimeType && extName) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only images are allowed.'));
//     }
//   }
// });
// app.get('/Home',(req,res) => {
// res.send("Hello");
// })
// app.get('/', (req, res) => {
//     res.send(`<h1>Image Upload Service</h1>
//     <p>Server is up and running.</p>
//     <p>Use the following endpoint to upload images:</p>
//     <ul>
//       <li><strong>Endpoint:</strong> <code>/api/upload-image</code></li>
//       <li><strong>Methods Supported:</strong> POST</li>
//       <li><strong>File Limit:</strong> 10 MB</li>
//       <li><strong>Accepted Formats:</strong> JPEG, PNG, GIF</li>
//     </ul>
//   `)
//   });
// // Route to upload a single image
// app.post('/api/upload-image', upload.single('file'), (req, res) => {
//   const file = req.file;

//   // Check if file is uploaded
//   if (!file) {
//     return res.status(400).json({ message: 'No file uploaded.' });
//   }

//   // Respond with the file's path or success message
//   const filePath = `/uploads/${file.filename}`;
//   res.status(200).json({
//     message: 'File uploaded successfully!',
//     filePath: filePath // this will be used to access the file from the front end
//   });
// });

// // Serve uploaded files (static content) so they can be accessed by the browser
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
//#endregion