const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/notices/";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Uploads will be stored in the 'uploads/notices' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter to allow specific file types (JPEG, PNG, PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword", // DOC
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX are allowed."), false);
    }
};

// Initialize multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: fileFilter
});

module.exports = upload;
