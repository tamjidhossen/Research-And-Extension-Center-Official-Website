const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure Directory Exists
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath;
        if (file.fieldname === "marksheet") {
            uploadPath = "uploads/marksheet/";
        } else if (file.fieldname === "evaluation_sheet") {
            uploadPath = "uploads/evaluation_sheet/";
        } else if (file.fieldname === "invoice") {
            uploadPath = "uploads/invoice/";
        } else {
            return cb(new Error("Invalid field name"), null);
        }
        ensureDirectoryExists(uploadPath);
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

// Upload Middleware (Handling multiple files, evaluation_sheet and invoice are optional)
const upload = (req, res, next) => {
    const uploadMiddleware = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }).fields([
        { name: "marksheet", maxCount: 1 },
        { name: "evaluation_sheet", maxCount: 1 }, // Optional field
        { name: "invoice", maxCount: 1 }           // Optional field
    ]);

    uploadMiddleware(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.files?.marksheet) {
            return res.status(400).json({ error: "Marksheet is required" });
        }
        next();
    });
};

module.exports = upload;
