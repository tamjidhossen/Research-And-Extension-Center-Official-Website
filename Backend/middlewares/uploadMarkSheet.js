const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure Directory Exists
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Create the directory (and parent directories if needed)
    }
};

// Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = "uploads/marksheet/";
        ensureDirectoryExists(uploadPath); // Ensure directory exists before saving
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// File Type Filter (Only PDF & DOC/DOCX)
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = [".pdf", ".doc", ".docx"];
    if (allowedFileTypes.includes(path.extname(file.originalname).toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and DOC/DOCX files are allowed"), false);
    }
};

// Upload Middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file limit
});

module.exports = upload;
