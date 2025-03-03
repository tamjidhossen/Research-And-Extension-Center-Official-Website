const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');


const uploadDir = 'uploads/document';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const randomStr = crypto.randomBytes(4).toString("hex"); // Generates 8 random characters
        cb(null, `${Date.now()}-${randomStr}-${file.originalname}`);
    }
});


const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf, .doc, and .docx files are allowed!'), false);
    }
};


const upload = multer({ storage, fileFilter });

module.exports = upload;
