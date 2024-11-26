const multer = require("multer");
const path = require("path");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to the 'uploads' directory
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Ensure the file has a .pdf extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== ".pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }

    // Generate a unique filename with a .pdf extension
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Set up the Multer middleware
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow only .pdf files
    if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});


module.exports = {
  upload,
};
