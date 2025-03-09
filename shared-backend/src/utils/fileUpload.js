const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { ErrorResponse } = require('../middleware/error');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
  
  // Check extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('File type not supported', 400), false);
  }
};

// Configure upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize // 5MB
  }
});

// Delete file
const deleteFile = async (filename) => {
  const filepath = path.join(uploadDir, filename);
  try {
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
    throw new ErrorResponse('Error deleting file', 500);
  }
};

// Get file URL
const getFileUrl = (filename) => {
  return `${config.uploadDir}/${filename}`;
};

module.exports = {
  upload,
  deleteFile,
  getFileUrl
}; 